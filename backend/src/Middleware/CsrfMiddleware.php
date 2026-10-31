<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Session;

/**
 * Requires a valid X-CSRF-Token header on every state-changing request.
 * Token is bound to the session (GET /api/auth/csrf returns it).
 */
final class CsrfMiddleware
{
    public function __construct(private readonly Session $session)
    {
    }

    public function handle(Request $request): void
    {
        if (!in_array($request->method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return;
        }
        $sent = (string) ($request->header('x-csrf-token') ?? '');
        if ($sent === '' || !hash_equals($this->session->csrfToken(), $sent)) {
            throw new HttpException(419, 'csrf_mismatch', 'Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.');
        }
    }
}
