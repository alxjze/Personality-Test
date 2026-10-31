<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class ReflectionRepository extends Repository
{
    public function create(int $userId, array $answers, array $result): int
    {
        return $this->db->insert(
            'INSERT INTO reflections (user_id, answers_json, result_json, created_at) VALUES (?, ?, ?, ?)',
            [$userId, self::encode($answers), self::encode($result), Database::now()],
        );
    }

    /** Scoped by user — returns null if it belongs to someone else. */
    public function findForUser(int $id, int $userId): ?array
    {
        $row = $this->db->one('SELECT * FROM reflections WHERE id = ? AND user_id = ?', [$id, $userId]);
        return $row ? $this->present($row, true) : null;
    }

    public function latestForUser(int $userId): ?array
    {
        $row = $this->db->one('SELECT * FROM reflections WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1', [$userId]);
        return $row ? $this->present($row, true) : null;
    }

    public function listForUser(int $userId, int $limit = 50): array
    {
        $rows = $this->db->all(
            'SELECT id, result_json, created_at FROM reflections WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ' . max(1, min(100, $limit)),
            [$userId],
        );
        return array_map(function ($r) {
            $result = self::decode($r['result_json']) ?? [];
            return [
                'id' => (int) $r['id'],
                'created_at' => self::iso($r['created_at']),
                'top_areas' => array_map(fn ($a) => ['id' => $a['id'], 'name' => $a['name'], 'score' => $a['score']], array_slice($result['career_areas'] ?? [], 0, 3)),
            ];
        }, $rows);
    }

    public function countForUser(int $userId): int
    {
        return (int) ($this->db->one('SELECT COUNT(*) AS c FROM reflections WHERE user_id = ?', [$userId])['c'] ?? 0);
    }

    public function deleteForUser(int $id, int $userId): bool
    {
        return $this->db->run('DELETE FROM reflections WHERE id = ? AND user_id = ?', [$id, $userId])->rowCount() > 0;
    }

    public function deleteAllForUser(int $userId): void
    {
        $this->db->run('DELETE FROM reflections WHERE user_id = ?', [$userId]);
    }

    private function present(array $row, bool $withAnswers): array
    {
        $out = [
            'id' => (int) $row['id'],
            'result' => self::decode($row['result_json']),
            'created_at' => self::iso($row['created_at']),
        ];
        if ($withAnswers) {
            $out['answers'] = self::decode($row['answers_json']);
        }
        return $out;
    }
}
