<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Consistent JSON envelope:
 *   success: { "success": true,  "data": ... , "meta": {...}? }
 *   error:   { "success": false, "error": { "code", "message", "fields"? } }
 */
final class Response
{
    /** @param array<string, string> $headers */
    public function __construct(
        public readonly int $status,
        public readonly array $body,
        public readonly array $headers = [],
    ) {
    }

    public static function ok(mixed $data = null, int $status = 200, array $meta = []): self
    {
        $body = ['success' => true, 'data' => $data];
        if ($meta !== []) {
            $body['meta'] = $meta;
        }
        return new self($status, $body);
    }

    public static function created(mixed $data = null): self
    {
        return self::ok($data, 201);
    }

    /** @param array<string, string> $fields */
    public static function error(int $status, string $code, string $message, array $fields = [], array $headers = []): self
    {
        $err = ['code' => $code, 'message' => $message];
        if ($fields !== []) {
            $err['fields'] = $fields;
        }
        return new self($status, ['success' => false, 'error' => $err], $headers);
    }

    public function send(): void
    {
        if (!headers_sent()) {
            http_response_code($this->status);
            header('Content-Type: application/json; charset=utf-8');
            header('Cache-Control: no-store');
            header('X-Content-Type-Options: nosniff');
            header('Referrer-Policy: strict-origin-when-cross-origin');
            header('X-Frame-Options: DENY');
            foreach ($this->headers as $k => $v) {
                header($k . ': ' . $v);
            }
        }
        echo json_encode($this->body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    }
}
