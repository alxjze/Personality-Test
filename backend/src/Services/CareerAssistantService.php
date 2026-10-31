<?php

declare(strict_types=1);

namespace App\Services;

use App\App;
use App\Core\HttpException;
use App\Repositories\ConversationRepository;
use App\Repositories\ProfileRepository;
use App\Repositories\ReflectionRepository;
use App\Services\AI\AiProvider;
use App\Services\AI\Prompts;

final class CareerAssistantService
{
    private const HISTORY_LIMIT = 20;

    public function __construct(private readonly App $app)
    {
    }

    public function chat(int $userId, string $message, ?int $conversationId): array
    {
        $convs = $this->app->make(ConversationRepository::class);
        $history = [];
        if ($conversationId !== null) {
            $conv = $convs->findForUser($conversationId, $userId);
            if ($conv === null) {
                throw HttpException::notFound('Percakapan tidak ditemukan.');
            }
            foreach (array_slice($convs->messages($conversationId), -self::HISTORY_LIMIT) as $m) {
                $history[] = ['role' => $m['role'], 'content' => $m['content']];
            }
        }

        $latest = $this->app->make(ReflectionRepository::class)->latestForUser($userId);
        $reflection = $this->app->make(CareerReflectionService::class);
        $context = $latest ? $reflection->contextSummary($latest['result'] ?? []) : null;
        $profile = $this->app->make(ProfileRepository::class)->findByUser($userId);

        $messages = array_merge($history, [['role' => 'user', 'content' => $message]]);
        $ai = $this->app->make(AiProvider::class);
        $result = $ai->complete(Prompts::careerAssistant($context, $profile), $messages, [
            'feature' => 'assistant',
            'max_tokens' => 4000,
            'effort' => 'low',
            'mock' => ['top_areas' => array_map(fn ($a) => $a['name'], $latest['result']['career_areas'] ?? [])],
        ]);

        // Persist only after a successful AI response so a failure never leaves half a turn.
        $created = false;
        if ($conversationId === null) {
            $title = mb_substr(preg_replace('/\s+/u', ' ', $message) ?? $message, 0, 60);
            $conversationId = $convs->create($userId, $title . (mb_strlen($message) > 60 ? '…' : ''));
            $created = true;
        }
        $convs->addMessage($conversationId, 'user', $message);
        $meta = $result->meta() + ['used_reflection' => $context !== null];
        $assistantId = $convs->addMessage($conversationId, 'assistant', $result->text, $meta);

        return [
            'conversation' => $convs->findForUser($conversationId, $userId),
            'created' => $created,
            'message' => [
                'id' => $assistantId,
                'role' => 'assistant',
                'content' => $result->text,
                'meta' => $meta,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z'),
            ],
        ];
    }
}
