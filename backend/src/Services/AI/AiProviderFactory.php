<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Core\Config;
use App\Core\Logger;

final class AiProviderFactory
{
    public static function create(Config $config, Logger $logger): AiProvider
    {
        $provider = (string) $config->get('ai.provider', 'mock');
        $key = (string) $config->get('ai.api_key', '');
        $model = (string) $config->get('ai.model', '');
        $timeout = (int) $config->get('ai.timeout', 90);
        $maxTokens = (int) $config->get('ai.max_tokens', 8000);
        $baseUrl = (string) $config->get('ai.base_url', '');

        // Without a key we never pretend to call a real provider.
        if ($provider === 'mock' || $key === '') {
            if ($provider !== 'mock' && $config->isProduction()) {
                $logger->warning('AI provider configured without API key; falling back to mock (simulated) responses.', ['provider' => $provider]);
            }
            return new MockProvider();
        }

        return match ($provider) {
            'openai' => new OpenAiProvider($key, $model !== '' ? $model : 'gpt-4.1-mini', $timeout, $maxTokens, $baseUrl, $logger),
            'anthropic' => new AnthropicProvider($key, $model !== '' ? $model : 'claude-opus-5-5', $timeout, $maxTokens, (string) $config->get('ai.effort', 'medium'), $logger),
            default => throw new \RuntimeException('Unknown AI_PROVIDER: ' . $provider),
        };
    }
}
