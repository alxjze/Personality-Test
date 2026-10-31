<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class InterviewRepository extends Repository
{
    public function create(int $userId, string $position, string $type, array $questions, array $meta): int
    {
        $now = Database::now();
        return $this->db->insert(
            'INSERT INTO interview_sessions (user_id, job_position, interview_type, questions_json, answers_json, feedback_json, meta_json, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$userId, $position, $type, self::encode($questions), self::encode(new \stdClass()), self::encode(new \stdClass()), self::encode($meta), $now, $now],
        );
    }

    public function findForUser(int $id, int $userId): ?array
    {
        $row = $this->db->one('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?', [$id, $userId]);
        return $row ? $this->present($row, true) : null;
    }

    public function saveAnswer(int $id, int $index, string $answer, array $feedback): void
    {
        // Read-modify-write inside a transaction to avoid lost updates.
        $this->db->transaction(function (Database $db) use ($id, $index, $answer, $feedback) {
            $row = $db->one('SELECT answers_json, feedback_json FROM interview_sessions WHERE id = ? FOR UPDATE', [$id]);
            $answers = self::decode($row['answers_json'] ?? null) ?: [];
            $feedbacks = self::decode($row['feedback_json'] ?? null) ?: [];
            $answers[(string) $index] = ['answer' => $answer, 'answered_at' => gmdate('c')];
            $feedbacks[(string) $index] = $feedback;
            $db->run(
                'UPDATE interview_sessions SET answers_json = ?, feedback_json = ?, updated_at = ? WHERE id = ?',
                [self::encode((object) $answers), self::encode((object) $feedbacks), Database::now(), $id],
            );
        });
    }

    public function listForUser(int $userId, int $limit = 50): array
    {
        $rows = $this->db->all(
            'SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT ' . max(1, min(100, $limit)),
            [$userId],
        );
        return array_map(fn ($r) => $this->present($r, false), $rows);
    }

    public function countForUser(int $userId): int
    {
        return (int) ($this->db->one('SELECT COUNT(*) AS c FROM interview_sessions WHERE user_id = ?', [$userId])['c'] ?? 0);
    }

    public function deleteForUser(int $id, int $userId): bool
    {
        return $this->db->run('DELETE FROM interview_sessions WHERE id = ? AND user_id = ?', [$id, $userId])->rowCount() > 0;
    }

    public function deleteAllForUser(int $userId): void
    {
        $this->db->run('DELETE FROM interview_sessions WHERE user_id = ?', [$userId]);
    }

    private function present(array $r, bool $full): array
    {
        $questions = self::decode($r['questions_json']) ?: [];
        $answers = self::decode($r['answers_json']) ?: [];
        $feedback = self::decode($r['feedback_json']) ?: [];
        $meta = self::decode($r['meta_json']) ?: [];
        $out = [
            'id' => (int) $r['id'],
            'job_position' => $r['job_position'],
            'interview_type' => $r['interview_type'],
            'total_questions' => count($questions),
            'answered_count' => count($answers),
            'simulated' => (bool) ($meta['simulated'] ?? false),
            'created_at' => self::iso($r['created_at']),
            'updated_at' => self::iso($r['updated_at']),
        ];
        if ($full) {
            $out['questions'] = $questions;
            $out['answers'] = (object) $answers;
            $out['feedback'] = (object) $feedback;
            $out['meta'] = $meta;
        }
        return $out;
    }
}
