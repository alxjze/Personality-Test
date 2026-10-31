<?php

declare(strict_types=1);

namespace App\Controllers;

use App\App;
use App\Middleware\RateLimiter;

abstract class Controller
{
    public function __construct(protected readonly App $app)
    {
    }

    protected function limit(string $bucket, string $identity): void
    {
        $this->app->make(RateLimiter::class)->hit($bucket, $identity);
    }

    /** Raise execution time for AI-backed requests on shared hosting. */
    protected function allowLongRequest(): void
    {
        @set_time_limit(max(60, (int) $this->app->config->get('ai.timeout', 90) + 30));
    }
}
