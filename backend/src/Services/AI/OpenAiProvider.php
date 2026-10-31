<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Core\Logger;

/**
 * OpenAI Chat Completions over HTTPS (cURL).
 * Also serves OpenAI-compatible providers with free tiers (Google Gemini, Groq) via their
 * compatibility endpoints — see AiProviderFactory.
 */
final class OpenAiProvider implements AiProvider
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
        private readonly int $timeout,
        private readonly int $maxTokens,
        private readonly string $baseUrl,
        private readonly Logger $logger,
        private readonly string $providerName = 'openai',
        private readonly bool $compat = false,
    ) {
    }

    public function name(): string
    {
        return $this->providerName;
    }

    public function isSimulated(): bool
    {
        return false;
    }

    public function complete(string $system, array $messages, array $options = []): AiResult
    {
        $payload = [
            'model' => $this->model,
            'messages' => array_merge([['role' => 'system', 'content' => $system]], $messages),
        ];
        $max = (int) ($options['max_tokens'] ?? $this->maxTokens);
        if ($this->compat) {
            // Compatibility endpoints use the classic parameter; JSON is enforced by the prompt + JsonOutput.
            $payload['max_tokens'] = $max;
        } else {
            $payload['max_completion_tokens'] = $max;
            if (!empty($options['json'])) {
                $payload['response_format'] = ['type' => 'json_object'];
            }
        }
        $url = rtrim($this->baseUrl !== '' ? $this->baseUrl : 'https://api.openai.com/v1', '/') . '/chat/completions';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        ]);
        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($body === false) {
            $this->logger->error('AI connection error', ['error' => $err, 'feature' => $options['feature'] ?? null]);
            throw new AiException();
        }
        $data = json_decode((string) $body, true);
        if ($status === 429) {
            $this->logger->warning('AI provider rate limited', ['feature' => $options['feature'] ?? null]);
            throw AiException::busy();
        }
        if ($status === 401 || $status === 403) {
            $this->logger->error('AI provider auth error', ['status' => $status]);
            throw AiException::misconfigured();
        }
        if ($status >= 400 || !is_array($data)) {
            $this->logger->error('AI provider API error', ['provider' => $this->providerName, 'status' => $status, 'type' => is_array($data) ? ($data['error']['type'] ?? $data[0]['error']['status'] ?? null) : null, 'code' => is_array($data) ? ($data['error']['code'] ?? $data[0]['error']['code'] ?? null) : null]);
            throw new AiException();
        }
        $choice = $data['choices'][0] ?? [];
        if (($choice['finish_reason'] ?? '') === 'content_filter' || !empty($choice['message']['refusal'])) {
            throw AiException::declined();
        }
        $text = (string) ($choice['message']['content'] ?? '');
        if (trim($text) === '') {
            throw AiException::badOutput();
        }
        return new AiResult($text, $this->providerName, (string) ($data['model'] ?? $this->model), false);
    }
}
