<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Core\Config;
use App\Core\Logger;

final class AiProviderFactory
{
    /** Free-tier defaults; override with AI_MODEL when the provider renames models. */
    public const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash';
    public const GROQ_DEFAULT_MODEL = 'openai/gpt-oss-120b';

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
            // Free tiers (no credit card). Key: https://aistudio.google.com/apikey
            'gemini' => new OpenAiProvider(
                $key,
                $model !== '' ? $model : self::GEMINI_DEFAULT_MODEL,
                $timeout,
                $maxTokens,
                $baseUrl !== '' ? $baseUrl : 'https://generativelanguage.googleapis.com/v1beta/openai',
                $logger,
                'gemini',
                true,
            ),
            // Key: https://console.groq.com/keys
            'groq' => new OpenAiProvider(
                $key,
                $model !== '' ? $model : self::GROQ_DEFAULT_MODEL,
                $timeout,
                $maxTokens,
                $baseUrl !== '' ? $baseUrl : 'https://api.groq.com/openai/v1',
                $logger,
                'groq',
                true,
            ),
            'anthropic' => new AnthropicProvider($key, $model !== '' ? $model : 'claude-opus-5-5', $timeout, $maxTokens, (string) $config->get('ai.effort', 'medium'), $logger),
            default => throw new \RuntimeException('Unknown AI_PROVIDER: ' . $provider),
        };
    }
}
