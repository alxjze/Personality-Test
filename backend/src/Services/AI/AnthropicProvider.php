<?php

declare(strict_types=1);

namespace App\Services\AI;

use Anthropic\Client;
use Anthropic\Core\Exceptions\APIConnectionException;
use Anthropic\Core\Exceptions\APIStatusException;
use Anthropic\Core\Exceptions\AuthenticationException;
use Anthropic\Core\Exceptions\BadRequestException;
use Anthropic\Core\Exceptions\NotFoundException;
use Anthropic\Core\Exceptions\PermissionDeniedException;
use Anthropic\Core\Exceptions\RateLimitException;
use App\Core\Logger;

/**
 * Claude via the official Anthropic PHP SDK.
 */
final class AnthropicProvider implements AiProvider
{
    /** Models that accept server-side refusal fallbacks ("default" routing). */
    private const FALLBACK_MODELS = ['claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5'];

    private ?Client $client = null;

    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
        private readonly int $timeout,
        private readonly int $maxTokens,
        private readonly string $effort,
        private readonly Logger $logger,
    ) {
    }

    public function name(): string
    {
        return 'anthropic';
    }

    public function isSimulated(): bool
    {
        return false;
    }

    private function client(): Client
    {
        return $this->client ??= new Client(
            apiKey: $this->apiKey,
            requestOptions: ['timeout' => (float) $this->timeout, 'maxRetries' => 1],
        );
    }

    public function complete(string $system, array $messages, array $options = []): AiResult
    {
        $effort = (string) ($options['effort'] ?? $this->effort);
        $args = [
            'maxTokens' => (int) ($options['max_tokens'] ?? $this->maxTokens),
            'messages' => $messages,
            'model' => $this->model,
            'system' => $system,
        ];
        if ($effort !== '' && $effort !== 'none') {
            $args['outputConfig'] = ['effort' => $effort];
        }
        if (in_array($this->model, self::FALLBACK_MODELS, true)) {
            // Server-side fallback when the requested model declines for policy reasons.
            $args['fallbacks'] = 'default';
            $args['betas'] = ['server-side-fallback-2026-07-01'];
        }

        try {
            $message = $this->client()->beta->messages->create(...$args);
        } catch (NotFoundException $e) {
            $this->logger->error('Anthropic model not found', ['model' => $this->model]);
            throw AiException::misconfigured();
        } catch (RateLimitException $e) {
            $this->logger->warning('Anthropic rate limited', ['feature' => $options['feature'] ?? null]);
            throw AiException::busy();
        } catch (AuthenticationException | PermissionDeniedException $e) {
            $this->logger->error('Anthropic auth error', ['type' => $e::class]);
            throw AiException::misconfigured();
        } catch (BadRequestException $e) {
            $this->logger->error('Anthropic bad request', ['message' => $e->getMessage()]);
            throw new AiException();
        } catch (APIStatusException $e) {
            $this->logger->error('Anthropic API error', ['type' => $e::class, 'message' => $e->getMessage()]);
            throw AiException::busy();
        } catch (APIConnectionException $e) {
            $this->logger->error('Anthropic connection error', ['message' => $e->getMessage()]);
            throw new AiException();
        }

        if ($message->stopReason === 'refusal') {
            throw AiException::declined();
        }
        $text = '';
        foreach ($message->content as $block) {
            if (($block->type ?? null) === 'text') {
                $text .= $block->text;
            }
        }
        if (trim($text) === '') {
            throw AiException::badOutput();
        }
        return new AiResult($text, 'anthropic', $message->model, false);
    }
}
