<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\ApiTestCase;
use Tests\HttpClient;

final class ReflectionTest extends ApiTestCase
{
    public function testQuestionsArePublic(): void
    {
        $res = (new HttpClient())->get('/reflections/questions');
        $this->assertSame(200, $res['status']);
        $this->assertCount(5, $res['body']['data']['categories']);
        $this->assertStringContainsString('bukan tes psikologi', $res['body']['data']['disclaimer']);
    }

    public function testGuestCanPreviewWithoutAccount(): void
    {
        $res = (new HttpClient())->post('/reflections/preview', ['answers' => $this->completeAnswers()]);
        $this->assertSame(200, $res['status']);
        $this->assertFalse($res['body']['data']['saved']);
        $result = $res['body']['data']['result'];
        $this->assertCount(3, $result['career_areas']);
        $this->assertNotEmpty($result['summary']);
        $this->assertNotEmpty($result['next_steps']);
        $this->assertStringContainsString('bukan tes psikologi', $result['disclaimer']);
    }

    public function testIncompleteAnswersAreRejected(): void
    {
        $answers = $this->completeAnswers();
        unset($answers['sk_empathy']);
        $answers['val_income'] = 9;
        $res = (new HttpClient())->post('/reflections/preview', ['answers' => $answers]);
        $this->assertSame(422, $res['status']);
        $this->assertArrayHasKey('sk_empathy', $res['body']['error']['fields']);
        $this->assertArrayHasKey('val_income', $res['body']['error']['fields']);
    }

    public function testSavingRequiresLogin(): void
    {
        $this->assertSame(401, (new HttpClient())->post('/reflections', ['answers' => $this->completeAnswers()])['status']);
    }

    public function testUserCanSaveListShowAndDelete(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $saved = $c->post('/reflections', ['answers' => $this->completeAnswers()]);
        $this->assertSame(201, $saved['status']);
        $id = $saved['body']['data']['id'];

        $list = $c->get('/reflections');
        $this->assertCount(1, $list['body']['data']);
        $show = $c->get("/reflections/{$id}");
        $this->assertSame(200, $show['status']);
        $this->assertSame($this->completeAnswers()['int_social_1'], $show['body']['data']['answers']['int_social_1']);
        $this->assertSame($id, $c->get('/reflections/latest')['body']['data']['id']);

        $this->assertSame(200, $c->delete("/reflections/{$id}")['status']);
        $this->assertSame(404, $c->get("/reflections/{$id}")['status']);
    }

    public function testOtherUsersCannotAccessReflection(): void
    {
        $owner = $this->newUser();
        $id = $owner['client']->post('/reflections', ['answers' => $this->completeAnswers()])['body']['data']['id'];
        $intruder = $this->newUser();
        $this->assertSame(404, $intruder['client']->get("/reflections/{$id}")['status']);
        $this->assertSame(404, $intruder['client']->delete("/reflections/{$id}")['status']);
        $this->assertSame(200, $owner['client']->get("/reflections/{$id}")['status']);
    }
}
