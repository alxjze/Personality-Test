<?php

declare(strict_types=1);

namespace App\Services;

use App\App;
use App\Core\HttpException;
use App\Repositories\ConsentRepository;

/**
 * Explicit consent tracking (versioned) before personal data is sent to an external AI provider.
 */
final class ConsentService
{
    public const AI_PROCESSING = 'ai_processing';
    public const CV_PROCESSING = 'cv_processing';
    public const PRIVACY_POLICY = 'privacy_policy';

    private ConsentRepository $repo;

    public function __construct(private readonly App $app)
    {
        $this->repo = $app->make(ConsentRepository::class);
    }

    public function version(string $type): string
    {
        return match ($type) {
            self::AI_PROCESSING => (string) $this->app->config->get('consent.ai_processing_version'),
            self::CV_PROCESSING => (string) $this->app->config->get('consent.cv_processing_version'),
            default => (string) $this->app->config->get('consent.privacy_version'),
        };
    }

    public function has(int $userId, string $type): bool
    {
        return $this->repo->hasConsent($userId, $type, $this->version($type));
    }

    public function record(int $userId, string $type): void
    {
        $this->repo->record($userId, $type, $this->version($type));
    }

    /**
     * Ensures AI-processing consent exists; records it if the request explicitly grants it now.
     */
    public function requireAiConsent(int $userId, bool $grantedNow): void
    {
        if ($this->has($userId, self::AI_PROCESSING)) {
            return;
        }
        if (!$grantedNow) {
            throw new HttpException(428, 'consent_required', 'Persetujuan pemrosesan data oleh layanan AI diperlukan sebelum melanjutkan.');
        }
        $this->record($userId, self::AI_PROCESSING);
    }

    public function status(int $userId): array
    {
        return [
            'ai_processing' => $this->has($userId, self::AI_PROCESSING),
            'privacy_policy' => $this->has($userId, self::PRIVACY_POLICY),
            'versions' => [
                'ai_processing' => $this->version(self::AI_PROCESSING),
                'cv_processing' => $this->version(self::CV_PROCESSING),
                'privacy_policy' => $this->version(self::PRIVACY_POLICY),
            ],
            'history' => $this->repo->listForUser($userId),
        ];
    }

    public function revoke(int $userId, string $type): void
    {
        $this->repo->revoke($userId, $type);
    }
}
