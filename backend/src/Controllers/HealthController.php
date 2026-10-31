<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AI\AiProvider;

final class HealthController extends Controller
{
    public function show(Request $r): Response
    {
        $dbOk = true;
        try {
            $this->app->db->one('SELECT 1 AS ok');
        } catch (\Throwable $e) {
            $dbOk = false;
            $this->app->logger->error('Health check DB failure', ['message' => $e->getMessage()]);
        }
        $ai = $this->app->make(AiProvider::class);
        return Response::ok([
            'status' => $dbOk ? 'ok' : 'degraded',
            'database' => $dbOk,
            'ai_mode' => $ai->isSimulated() ? 'simulated' : 'live',
            'time' => gmdate('c'),
        ], $dbOk ? 200 : 503);
    }
}
