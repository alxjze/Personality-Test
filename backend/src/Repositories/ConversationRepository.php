<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class ConversationRepository extends Repository
{
    public function create(int $userId, string $title): int
    {
        $now = Database::now();
        return $this->db->insert(
            'INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
            [$userId, $title, $now, $now],
        );
    }

    public function findForUser(int $id, int $userId): ?array
    {
        $row = $this->db->one('SELECT * FROM conversations WHERE id = ? AND user_id = ?', [$id, $userId]);
        return $row ? $this->present($row) : null;
    }

    public function listForUser(int $userId): array
    {
        $rows = $this->db->all(
            'SELECT c.*, (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) AS message_count
             FROM conversations c WHERE c.user_id = ? ORDER BY c.updated_at DESC, c.id DESC LIMIT 100',
            [$userId],
        );
        return array_map(fn ($r) => $this->present($r) + ['message_count' => (int) $r['message_count']], $rows);
    }

    public function countForUser(int $userId): int
    {
        return (int) ($this->db->one('SELECT COUNT(*) AS c FROM conversations WHERE user_id = ?', [$userId])['c'] ?? 0);
    }

    public function addMessage(int $conversationId, string $role, string $content, ?array $meta = null): int
    {
        $now = Database::now();
        $id = $this->db->insert(
            'INSERT INTO conversation_messages (conversation_id, role, content, meta_json, created_at) VALUES (?, ?, ?, ?, ?)',
            [$conversationId, $role, $content, $meta === null ? null : self::encode($meta), $now],
        );
        $this->db->run('UPDATE conversations SET updated_at = ? WHERE id = ?', [$now, $conversationId]);
        return $id;
    }

    /** @return list<array{id:int, role:string, content:string, meta:mixed, created_at:?string}> */
    public function messages(int $conversationId, int $limit = 200): array
    {
        $rows = $this->db->all(
            'SELECT * FROM (SELECT * FROM conversation_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ' . max(1, min(500, $limit)) . ') t ORDER BY id ASC',
            [$conversationId],
        );
        return array_map(fn ($r) => [
            'id' => (int) $r['id'],
            'role' => $r['role'],
            'content' => $r['content'],
            'meta' => self::decode($r['meta_json']),
            'created_at' => self::iso($r['created_at']),
        ], $rows);
    }

    public function deleteForUser(int $id, int $userId): bool
    {
        return $this->db->run('DELETE FROM conversations WHERE id = ? AND user_id = ?', [$id, $userId])->rowCount() > 0;
    }

    public function deleteAllForUser(int $userId): void
    {
        $this->db->run('DELETE FROM conversations WHERE user_id = ?', [$userId]);
    }

    private function present(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'title' => $r['title'],
            'created_at' => self::iso($r['created_at']),
            'updated_at' => self::iso($r['updated_at']),
        ];
    }
}
