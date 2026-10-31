<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Migrator;
use App\Core\Request;
use App\Core\Response;

/**
 * Maintenance endpoint for hosts without shell access (e.g. Vercel):
 *   POST /api/ops/migrate   with header  X-Ops-Token: <OPS_TOKEN>
 * Disabled entirely unless OPS_TOKEN (>= 32 chars) is configured. Rotate/remove it after use.
 */
final class OpsController extends Controller
{
    public function migrate(Request $r): Response
    {
        $token = (string) \App\Core\Env::get('OPS_TOKEN', '');
        $sent = (string) ($r->header('x-ops-token') ?? '');
        if (strlen($token) < 32) {
            throw HttpException::notFound('Endpoint tidak ditemukan.');
        }
        $this->limit('login', 'ops|' . $r->ip);
        if ($sent === '' || !hash_equals($token, $sent)) {
            throw HttpException::forbidden('Token tidak valid.');
        }
        $applied = (new Migrator($this->app->db, $this->app->root . '/database/migrations'))->migrate();
        $this->app->logger->info('Migrations applied via ops endpoint', ['applied' => $applied]);
        return Response::ok(['applied' => $applied]);
    }
}
