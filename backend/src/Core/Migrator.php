<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Applies database/migrations/*.sql in filename order, recording each in schema_migrations.
 */
final class Migrator
{
    public function __construct(private readonly Database $db, private readonly string $dir)
    {
    }

    /** @return list<string> applied migration names */
    public function migrate(): array
    {
        $pdo = $this->db->pdo();
        $pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (
            migration VARCHAR(191) NOT NULL PRIMARY KEY,
            applied_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        $done = array_column($this->db->all('SELECT migration FROM schema_migrations'), 'migration');
        $files = glob(rtrim($this->dir, '/') . '/*.sql') ?: [];
        sort($files);
        $applied = [];
        foreach ($files as $file) {
            $name = basename($file);
            if (in_array($name, $done, true)) {
                continue;
            }
            $sql = (string) file_get_contents($file);
            foreach ($this->split($sql) as $statement) {
                $pdo->exec($statement);
            }
            $this->db->run('INSERT INTO schema_migrations (migration, applied_at) VALUES (?, ?)', [$name, Database::now()]);
            $applied[] = $name;
        }
        return $applied;
    }

    /** Drops every table — only allowed outside production (used by tests / dev reset). */
    public function reset(): void
    {
        $pdo = $this->db->pdo();
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
        foreach ($this->db->all('SHOW TABLES') as $row) {
            $table = (string) array_values($row)[0];
            $pdo->exec('DROP TABLE IF EXISTS `' . str_replace('`', '', $table) . '`');
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    }

    /** @return list<string> */
    private function split(string $sql): array
    {
        $lines = array_filter(explode("\n", $sql), fn ($l) => !str_starts_with(trim($l), '--'));
        $parts = array_map('trim', explode(';', implode("\n", $lines)));
        return array_values(array_filter($parts, fn ($p) => $p !== ''));
    }
}
