<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Core\HttpException;

/**
 * Provider failure. The message shown to users is always generic; details go to the log only.
 */
final class AiException extends HttpException
{
    public function __construct(string $userMessage = 'Layanan AI sedang tidak dapat diakses. Silakan coba beberapa saat lagi.', int $status = 502, string $code = 'ai_unavailable')
    {
        parent::__construct($status, $code, $userMessage);
    }

    public static function busy(): self
    {
        return new self('Layanan AI sedang sibuk. Coba lagi dalam beberapa menit.', 503, 'ai_busy');
    }

    public static function misconfigured(): self
    {
        return new self('Layanan AI belum dikonfigurasi dengan benar. Hubungi admin.', 503, 'ai_misconfigured');
    }

    public static function declined(): self
    {
        return new self('AI tidak dapat memproses permintaan ini. Coba ubah atau perjelas isinya.', 422, 'ai_declined');
    }

    public static function badOutput(): self
    {
        return new self('AI memberikan respons yang tidak dapat diproses. Silakan coba lagi.', 502, 'ai_bad_output');
    }
}
