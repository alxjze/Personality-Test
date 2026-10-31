<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Stores PHP sessions in MySQL (table `sessions`).
 * Works on shared hosting AND on stateless/serverless platforms (e.g. Vercel),
 * where the local filesystem is not shared between requests.
 * Session IDs are stored hashed (SHA-256) so a DB leak does not expose live session cookies.
 */
final class DbSessionHandler implements \SessionHandlerInterface, \SessionUpdateTimestampHandlerInterface
{
    public function __construct(private readonly Database $db, private readonly int $lifetime)
    {
    }

    private function key(string $id): string
    {
        return hash('sha256', $id);
    }

    public function open(string $path, string $name): bool
    {
        return true;
    }

    public function close(): bool
    {
        return true;
    }

    public function read(string $id): string|false
    {
        $row = $this->db->one(
            'SELECT payload FROM sessions WHERE id = ? AND last_activity > ?',
            [$this->key($id), time() - $this->lifetime],
        );
        return $row ? (string) $row['payload'] : '';
    }

    public function write(string $id, string $data): bool
    {
        $userId = null;
        if (isset($_SESSION['user_id']) && is_int($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
        }
        $this->db->run(
            'INSERT INTO sessions (id, user_id, payload, last_activity) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), payload = VALUES(payload), last_activity = VALUES(last_activity)',
            [$this->key($id), $userId, $data, time()],
        );
        return true;
    }

    public function destroy(string $id): bool
    {
        $this->db->run('DELETE FROM sessions WHERE id = ?', [$this->key($id)]);
        return true;
    }

    public function gc(int $max_lifetime): int|false
    {
        return $this->db->run('DELETE FROM sessions WHERE last_activity < ?', [time() - $this->lifetime])->rowCount();
    }

    public function validateId(string $id): bool
    {
        return $this->db->one(
            'SELECT 1 AS ok FROM sessions WHERE id = ? AND last_activity > ?',
            [$this->key($id), time() - $this->lifetime],
        ) !== null;
    }

    public function updateTimestamp(string $id, string $data): bool
    {
        $this->db->run('UPDATE sessions SET last_activity = ? WHERE id = ?', [time(), $this->key($id)]);
        return true;
    }
}
