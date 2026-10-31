<?php

declare(strict_types=1);

namespace App\Core;

use PDO;

/**
 * Thin PDO wrapper. All queries use prepared statements with native (non-emulated) binding.
 */
final class Database
{
    private ?PDO $pdo = null;

    public function __construct(private readonly Config $config)
    {
    }

    public function pdo(): PDO
    {
        if ($this->pdo !== null) {
            return $this->pdo;
        }
        $socket = (string) $this->config->get('db.socket');
        $dsn = $socket !== ''
            ? sprintf('mysql:unix_socket=%s;dbname=%s;charset=utf8mb4', $socket, $this->config->get('db.name'))
            : sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                $this->config->get('db.host'),
                (int) $this->config->get('db.port'),
                $this->config->get('db.name'),
            );
        $this->pdo = new PDO($dsn, (string) $this->config->get('db.user'), (string) $this->config->get('db.pass'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]);
        $this->pdo->exec("SET time_zone = '+00:00'");
        return $this->pdo;
    }

    /** @param array<int|string, mixed> $params */
    public function run(string $sql, array $params = []): \PDOStatement
    {
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /** @return array<string, mixed>|null */
    public function one(string $sql, array $params = []): ?array
    {
        $row = $this->run($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    /** @return list<array<string, mixed>> */
    public function all(string $sql, array $params = []): array
    {
        return $this->run($sql, $params)->fetchAll();
    }

    public function insert(string $sql, array $params = []): int
    {
        $this->run($sql, $params);
        return (int) $this->pdo()->lastInsertId();
    }

    public function transaction(callable $fn): mixed
    {
        $pdo = $this->pdo();
        $pdo->beginTransaction();
        try {
            $result = $fn($this);
            $pdo->commit();
            return $result;
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    public static function now(): string
    {
        return gmdate('Y-m-d H:i:s');
    }
}
