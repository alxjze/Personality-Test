<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Config;
use App\Core\Database;
use App\Core\HttpException;

/**
 * Fixed-window rate limiter backed by MySQL (works on shared hosting and serverless).
 */
final class RateLimiter
{
    public function __construct(private readonly Database $db, private readonly Config $config)
    {
    }

    /**
     * Registers a hit for $bucket/$identity and throws 429 when the limit is exceeded.
     */
    public function hit(string $bucket, string $identity): void
    {
        [$max, $window] = $this->config->get('rate.' . $bucket, [60, 3600]);
        $key = $bucket . ':' . hash('sha256', $identity);
        $now = time();
        $this->db->run(
            'INSERT INTO rate_limits (rl_key, hits, reset_at) VALUES (?, 1, ?)
             ON DUPLICATE KEY UPDATE
                hits = IF(reset_at <= ?, 1, hits + 1),
                reset_at = IF(reset_at <= ?, VALUES(reset_at), reset_at)',
            [$key, $now + $window, $now, $now],
        );
        $row = $this->db->one('SELECT hits, reset_at FROM rate_limits WHERE rl_key = ?', [$key]);
        if ($row && (int) $row['hits'] > (int) $max) {
            throw HttpException::tooManyRequests(max(1, (int) $row['reset_at'] - $now));
        }
        // Opportunistic cleanup (~1% of requests).
        if (random_int(1, 100) === 1) {
            $this->db->run('DELETE FROM rate_limits WHERE reset_at < ?', [$now]);
        }
    }

    public function clear(string $bucket, string $identity): void
    {
        $this->db->run('DELETE FROM rate_limits WHERE rl_key = ?', [$bucket . ':' . hash('sha256', $identity)]);
    }
}
