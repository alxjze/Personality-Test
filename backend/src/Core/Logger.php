<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Daily file logger. Never pass passwords, tokens, CV text, or AI keys in $context.
 */
final class Logger
{
    private const REDACT = ['password', 'password_hash', 'token', 'api_key', 'authorization', 'cv_text', 'content', 'answer'];

    public function __construct(private readonly string $dir)
    {
    }

    public function info(string $message, array $context = []): void
    {
        $this->write('INFO', $message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->write('WARNING', $message, $context);
    }

    public function error(string $message, array $context = []): void
    {
        $this->write('ERROR', $message, $context);
    }

    private function write(string $level, string $message, array $context): void
    {
        foreach ($context as $k => $v) {
            if (in_array(strtolower((string) $k), self::REDACT, true)) {
                $context[$k] = '[redacted]';
            }
        }
        $line = sprintf(
            "[%s] %s: %s %s\n",
            gmdate('Y-m-d\TH:i:s\Z'),
            $level,
            $message,
            $context ? json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR) : '',
        );
        if ($this->dir === 'stderr') {
            error_log(rtrim($line));
            return;
        }
        if (!is_dir($this->dir)) {
            @mkdir($this->dir, 0750, true);
        }
        if (@file_put_contents($this->dir . '/app-' . gmdate('Y-m-d') . '.log', $line, FILE_APPEND | LOCK_EX) === false) {
            error_log(rtrim($line)); // read-only filesystem fallback
        }
    }
}
