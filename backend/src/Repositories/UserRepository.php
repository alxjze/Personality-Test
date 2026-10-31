<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class UserRepository extends Repository
{
    /** Public user shape (never includes password_hash). */
    public function findById(int $id): ?array
    {
        $row = $this->db->one('SELECT id, name, email, created_at FROM users WHERE id = ?', [$id]);
        return $row ? $this->present($row) : null;
    }

    /** Includes password_hash — for authentication only. */
    public function findAuthByEmail(string $email): ?array
    {
        return $this->db->one('SELECT id, name, email, password_hash FROM users WHERE email = ?', [$email]);
    }

    public function findAuthById(int $id): ?array
    {
        return $this->db->one('SELECT id, name, email, password_hash FROM users WHERE id = ?', [$id]);
    }

    public function emailExists(string $email): bool
    {
        return $this->db->one('SELECT 1 AS x FROM users WHERE email = ?', [$email]) !== null;
    }

    public function create(string $name, string $email, string $hash): int
    {
        $now = Database::now();
        return $this->db->insert(
            'INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [$name, $email, $hash, $now, $now],
        );
    }

    public function updateName(int $id, string $name): void
    {
        $this->db->run('UPDATE users SET name = ?, updated_at = ? WHERE id = ?', [$name, Database::now(), $id]);
    }

    public function updatePassword(int $id, string $hash): void
    {
        $this->db->run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [$hash, Database::now(), $id]);
    }

    public function delete(int $id): void
    {
        $this->db->run('DELETE FROM users WHERE id = ?', [$id]);
    }

    private function present(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'created_at' => self::iso($row['created_at']),
        ];
    }
}
