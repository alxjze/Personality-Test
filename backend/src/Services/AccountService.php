<?php

declare(strict_types=1);

namespace App\Services;

use App\App;
use App\Repositories\ConversationRepository;
use App\Repositories\CvReviewRepository;
use App\Repositories\InterviewRepository;
use App\Repositories\ProfileRepository;
use App\Repositories\ReflectionRepository;
use App\Repositories\UserRepository;

/**
 * Personal data deletion (right to erasure).
 */
final class AccountService
{
    public function __construct(private readonly App $app)
    {
    }

    /** Deletes all personal content but keeps the account (name/email/password + consent history). */
    public function deletePersonalData(int $userId): void
    {
        $this->app->make(CvFileStorage::class)->deleteAllForUser($userId);
        $this->app->db->transaction(function () use ($userId) {
            $this->app->make(ReflectionRepository::class)->deleteAllForUser($userId);
            $this->app->make(ConversationRepository::class)->deleteAllForUser($userId);
            $this->app->make(CvReviewRepository::class)->deleteAllForUser($userId);
            $this->app->make(InterviewRepository::class)->deleteAllForUser($userId);
            $this->app->make(ProfileRepository::class)->clear($userId);
        });
    }

    /** Deletes the account entirely (FK cascades remove all rows) plus stored files. */
    public function deleteAccount(int $userId): void
    {
        $this->app->make(CvFileStorage::class)->deleteAllForUser($userId);
        $this->app->db->run('DELETE FROM sessions WHERE user_id = ?', [$userId]);
        $this->app->make(UserRepository::class)->delete($userId);
    }
}
