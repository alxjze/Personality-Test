<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\ApiTestCase;

final class InterviewTest extends ApiTestCase
{
    public function testCreateAnswerAndFeedback(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $this->assertSame(428, $c->post('/interviews', ['job_position' => 'Business Analyst', 'interview_type' => 'behavioral', 'question_count' => 4])['status']);

        $res = $c->post('/interviews', ['job_position' => 'Business Analyst', 'interview_type' => 'behavioral', 'question_count' => 4, 'consent' => true]);
        $this->assertSame(201, $res['status'], json_encode($res['body']));
        $s = $res['body']['data'];
        $this->assertCount(4, $s['questions']);
        $this->assertSame(0, $s['answered_count']);
        $this->assertTrue($s['simulated']);

        $answer = 'Saat semester lima saya bertugas memimpin proyek analisis data. Saya menyusun kuesioner dan menganalisis hasilnya sehingga layanan meningkat.';
        $res = $c->post("/interviews/{$s['id']}/answer", ['question_index' => 1, 'answer' => $answer]);
        $this->assertSame(200, $res['status'], json_encode($res['body']));
        $s2 = $res['body']['data'];
        $this->assertSame(1, $s2['answered_count']);
        $fb = $s2['feedback']['1'];
        $this->assertContains($fb['rating'], ['kuat', 'cukup', 'perlu_diperbaiki']);
        $this->assertSame(['situation', 'task', 'action', 'result'], array_keys($fb['star']));
        $this->assertTrue($fb['meta']['simulated']);

        $list = $c->get('/interviews')['body']['data'];
        $this->assertSame(1, $list[0]['answered_count']);
    }

    public function testValidation(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $res = $c->post('/interviews', ['job_position' => '', 'interview_type' => 'unknown', 'question_count' => 10, 'consent' => true]);
        $this->assertSame(422, $res['status']);
        $this->assertEqualsCanonicalizing(['job_position', 'interview_type', 'question_count'], array_keys($res['body']['error']['fields']));

        $id = $c->post('/interviews', ['job_position' => 'QA', 'interview_type' => 'technical', 'question_count' => 3, 'consent' => true])['body']['data']['id'];
        $this->assertSame(422, $c->post("/interviews/{$id}/answer", ['question_index' => 9, 'answer' => str_repeat('jawaban ', 5)])['status']);
        $this->assertSame(422, $c->post("/interviews/{$id}/answer", ['question_index' => 0, 'answer' => 'pendek'])['status']);
    }

    public function testOtherUsersCannotAccessSession(): void
    {
        $owner = $this->newUser();
        $id = $owner['client']->post('/interviews', ['job_position' => 'HR', 'interview_type' => 'hr', 'question_count' => 3, 'consent' => true])['body']['data']['id'];
        $intruder = $this->newUser();
        $this->assertSame(404, $intruder['client']->get("/interviews/{$id}")['status']);
        $res = $intruder['client']->post("/interviews/{$id}/answer", ['question_index' => 0, 'answer' => str_repeat('jawaban ', 5), 'consent' => true]);
        $this->assertSame(404, $res['status']);
    }
}
