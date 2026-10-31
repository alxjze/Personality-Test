<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class ConsentRepository extends Repository
{
    public function record(int $userId, string $type, string $version): void
    {
        $this->db->run(
            'INSERT INTO consent_logs (user_id, consent_type, consent_version, accepted_at) VALUES (?, ?, ?, ?)',
            [$userId, $type, $version, Database::now()],
        );
    }

    public function hasConsent(int $userId, string $type, string $version): bool
    {
        return $this->db->one(
            'SELECT 1 AS x FROM consent_logs WHERE user_id = ? AND consent_type = ? AND consent_version = ? LIMIT 1',
            [$userId, $type, $version],
        ) !== null;
    }

    public function listForUser(int $userId): array
    {
        return array_map(fn ($r) => [
            'id' => (int) $r['id'],
            'consent_type' => $r['consent_type'],
            'consent_version' => $r['consent_version'],
            'accepted_at' => self::iso($r['accepted_at']),
        ], $this->db->all('SELECT * FROM consent_logs WHERE user_id = ? ORDER BY accepted_at DESC, id DESC', [$userId]));
    }

    public function revoke(int $userId, string $type): void
    {
        $this->db->run('DELETE FROM consent_logs WHERE user_id = ? AND consent_type = ?', [$userId, $type]);
    }
}
