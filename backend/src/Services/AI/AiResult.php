<?php

declare(strict_types=1);

namespace App\Services\AI;

final class AiResult
{
    public function __construct(
        public readonly string $text,
        public readonly string $provider,
        public readonly string $model,
        public readonly bool $simulated,
    ) {
    }

    /** @return array{provider:string, model:string, simulated:bool, generated_at:string} */
    public function meta(): array
    {
        return [
            'provider' => $this->provider,
            'model' => $this->model,
            'simulated' => $this->simulated,
            'generated_at' => gmdate('c'),
        ];
    }
}
