<?php

declare(strict_types=1);

namespace App\Services\AI;

/**
 * Provider-agnostic LLM interface. Implementations: OpenAiProvider, AnthropicProvider, MockProvider.
 */
interface AiProvider
{
    /**
     * @param string $system system instructions
     * @param list<array{role:'user'|'assistant', content:string}> $messages
     * @param array{feature?:string, json?:bool, max_tokens?:int, effort?:string, mock?:array<string,mixed>} $options
     */
    public function complete(string $system, array $messages, array $options = []): AiResult;

    /** True when responses are simulated (mock) and must be labelled as such. */
    public function isSimulated(): bool;

    public function name(): string;
}
