<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\ApiTestCase;

final class AssistantTest extends ApiTestCase
{
    public function testConsentIsRequiredBeforeAiProcessing(): void
    {
        $u = $this->newUser();
        $res = $u['client']->post('/assistant/chat', ['message' => 'Halo']);
        $this->assertSame(428, $res['status']);
        $this->assertSame('consent_required', $res['body']['error']['code']);
    }

    public function testChatCreatesConversationWithSimulatedLabel(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $c->post('/reflections', ['answers' => $this->completeAnswers()]);
        $res = $c->post('/assistant/chat', ['message' => 'Peran apa yang cocok?', 'consent' => true]);
        $this->assertSame(200, $res['status'], json_encode($res['body']));
        $msg = $res['body']['data']['message'];
        $this->assertTrue($msg['meta']['simulated']);
        $this->assertTrue($msg['meta']['used_reflection']);
        $this->assertStringStartsWith('[Simulasi]', $msg['content']);
        $convId = $res['body']['data']['conversation']['id'];

        // Consent is remembered; continue same conversation.
        $res2 = $c->post('/assistant/chat', ['message' => 'Bagaimana dengan CV?', 'conversation_id' => $convId]);
        $this->assertSame(200, $res2['status']);
        $this->assertFalse($res2['body']['data']['created']);

        $conv = $c->get("/assistant/conversations/{$convId}");
        $this->assertCount(4, $conv['body']['data']['messages']);
        $this->assertCount(1, $c->get('/assistant/conversations')['body']['data']);

        $this->assertSame(200, $c->delete("/assistant/conversations/{$convId}")['status']);
        $this->assertSame(404, $c->get("/assistant/conversations/{$convId}")['status']);
    }

    public function testOtherUsersCannotReadConversation(): void
    {
        $owner = $this->newUser();
        $id = $owner['client']->post('/assistant/chat', ['message' => 'Halo', 'consent' => true])['body']['data']['conversation']['id'];
        $intruder = $this->newUser();
        $this->assertSame(404, $intruder['client']->get("/assistant/conversations/{$id}")['status']);
        $res = $intruder['client']->post('/assistant/chat', ['message' => 'Halo', 'conversation_id' => $id, 'consent' => true]);
        $this->assertSame(404, $res['status']);
    }

    public function testRateLimitIsEnforced(): void
    {
        // RL_ASSISTANT_MAX=3 in the test environment.
        $u = $this->newUser();
        $statuses = [];
        for ($i = 0; $i < 4; $i++) {
            $statuses[] = $u['client']->post('/assistant/chat', ['message' => "Pesan {$i}", 'consent' => true]);
        }
        $this->assertSame([200, 200, 200, 429], array_map(fn ($r) => $r['status'], $statuses));
        $this->assertSame('rate_limited', $statuses[3]['body']['error']['code']);
        $this->assertMatchesRegularExpression('/Retry-After: \d+/i', $statuses[3]['headers']);
    }

    public function testMessageValidation(): void
    {
        $u = $this->newUser();
        $this->assertSame(422, $u['client']->post('/assistant/chat', ['message' => '', 'consent' => true])['status']);
        $this->assertSame(422, $u['client']->post('/assistant/chat', ['message' => str_repeat('a', 2001), 'consent' => true])['status']);
    }
}
