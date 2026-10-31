<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class PasswordResetRepository extends Repository
{
    public function create(int $userId, string $tokenHash, int $ttlSeconds): void
    {
        // Invalidate older outstanding tokens for this user.
        $this->db->run('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL', [$userId]);
        $this->db->run(
            'INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)',
            [$userId, $tokenHash, gmdate('Y-m-d H:i:s', time() + $ttlSeconds), Database::now()],
        );
    }

    public function findValid(string $tokenHash): ?array
    {
        return $this->db->one(
            'SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
            [$tokenHash, Database::now()],
        );
    }

    public function markUsed(int $id): void
    {
        $this->db->run('UPDATE password_resets SET used_at = ? WHERE id = ?', [Database::now(), $id]);
    }
}
