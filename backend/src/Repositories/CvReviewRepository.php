<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class CvReviewRepository extends Repository
{
    public function create(int $userId, ?string $filePath, ?string $originalName, string $source, string $targetJob, ?string $jobDescription, array $result, bool $consent): int
    {
        return $this->db->insert(
            'INSERT INTO cv_reviews (user_id, file_path, original_filename, source, target_job, job_description, result_json, consent_given, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$userId, $filePath, $originalName, $source, $targetJob, $jobDescription, self::encode($result), $consent ? 1 : 0, Database::now()],
        );
    }

    public function findForUser(int $id, int $userId): ?array
    {
        $row = $this->db->one('SELECT * FROM cv_reviews WHERE id = ? AND user_id = ?', [$id, $userId]);
        return $row ? $this->present($row, true) : null;
    }

    /** Internal: includes file_path for deletion. */
    public function rawForUser(int $id, int $userId): ?array
    {
        return $this->db->one('SELECT id, file_path FROM cv_reviews WHERE id = ? AND user_id = ?', [$id, $userId]);
    }

    public function filePathsForUser(int $userId): array
    {
        return array_values(array_filter(array_column(
            $this->db->all('SELECT file_path FROM cv_reviews WHERE user_id = ? AND file_path IS NOT NULL', [$userId]),
            'file_path',
        )));
    }

    public function listForUser(int $userId, int $limit = 50): array
    {
        $rows = $this->db->all(
            'SELECT * FROM cv_reviews WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ' . max(1, min(100, $limit)),
            [$userId],
        );
        return array_map(fn ($r) => $this->present($r, false), $rows);
    }

    public function countForUser(int $userId): int
    {
        return (int) ($this->db->one('SELECT COUNT(*) AS c FROM cv_reviews WHERE user_id = ?', [$userId])['c'] ?? 0);
    }

    public function deleteForUser(int $id, int $userId): bool
    {
        return $this->db->run('DELETE FROM cv_reviews WHERE id = ? AND user_id = ?', [$id, $userId])->rowCount() > 0;
    }

    public function deleteAllForUser(int $userId): void
    {
        $this->db->run('DELETE FROM cv_reviews WHERE user_id = ?', [$userId]);
    }

    private function present(array $r, bool $full): array
    {
        $result = self::decode($r['result_json']) ?? [];
        $out = [
            'id' => (int) $r['id'],
            'source' => $r['source'],
            'original_filename' => $r['original_filename'],
            'has_file' => $r['file_path'] !== null,
            'target_job' => $r['target_job'],
            'consent_given' => (bool) $r['consent_given'],
            'created_at' => self::iso($r['created_at']),
            'overall_score' => $result['score']['overall'] ?? null,
            'simulated' => (bool) ($result['meta']['simulated'] ?? false),
        ];
        if ($full) {
            $out['job_description'] = $r['job_description'];
            $out['result'] = $result;
        }
        return $out;
    }
}
