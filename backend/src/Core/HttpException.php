<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Exception that maps directly to a safe JSON error response.
 * The message is always user-facing (Bahasa Indonesia) and must never contain internals.
 */
class HttpException extends \RuntimeException
{
    /** @param array<string, string> $fields */
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly array $fields = [],
        public readonly array $headers = [],
    ) {
        parent::__construct($message, $status);
    }

    public static function badRequest(string $message, string $code = 'bad_request'): self
    {
        return new self(400, $code, $message);
    }

    /** @param array<string, string> $fields */
    public static function validation(array $fields, string $message = 'Data yang dikirim belum valid.'): self
    {
        return new self(422, 'validation_error', $message, $fields);
    }

    public static function unauthorized(string $message = 'Silakan masuk terlebih dahulu.'): self
    {
        return new self(401, 'unauthenticated', $message);
    }

    public static function forbidden(string $message = 'Kamu tidak memiliki akses ke data ini.'): self
    {
        return new self(403, 'forbidden', $message);
    }

    public static function notFound(string $message = 'Data tidak ditemukan.'): self
    {
        return new self(404, 'not_found', $message);
    }

    public static function tooManyRequests(int $retryAfter): self
    {
        $minutes = max(1, (int) ceil($retryAfter / 60));
        return new self(
            429,
            'rate_limited',
            "Terlalu banyak permintaan. Coba lagi dalam sekitar {$minutes} menit.",
            [],
            ['Retry-After' => (string) $retryAfter],
        );
    }
}
