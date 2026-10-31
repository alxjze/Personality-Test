<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\ApiTestCase;
use Tests\HttpClient;

final class ProfileTest extends ApiTestCase
{
    public function testUpdateProfileAndPassword(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $res = $c->put('/profile', ['name' => 'Nama Baru', 'education' => 'S1 Psikologi', 'current_position' => 'Mahasiswa', 'career_goal' => 'HR']);
        $this->assertSame(200, $res['status']);
        $this->assertSame('Nama Baru', $res['body']['data']['user']['name']);
        $this->assertSame('S1 Psikologi', $res['body']['data']['profile']['education']);

        $this->assertSame(422, $c->put('/profile/password', ['current_password' => 'salah123', 'new_password' => 'BaruSekali9'])['status']);
        $this->assertSame(200, $c->put('/profile/password', ['current_password' => $u['password'], 'new_password' => 'BaruSekali9'])['status']);
        $this->assertSame(200, $c->get('/profile')['status'], 'current session stays valid');
        $this->assertSame(200, (new HttpClient())->post('/auth/login', ['email' => $u['email'], 'password' => 'BaruSekali9'])['status']);
    }

    public function testDashboardAggregates(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $c->post('/reflections', ['answers' => $this->completeAnswers()]);
        $d = $c->get('/dashboard')['body']['data'];
        $this->assertSame(1, $d['counts']['reflections']);
        $this->assertNotNull($d['latest_reflection']);
        $this->assertSame(5, $d['progress']['total']);
        $this->assertSame(1, $d['progress']['done']);
    }

    public function testDeletePersonalDataKeepsAccount(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $c->post('/reflections', ['answers' => $this->completeAnswers()]);
        $c->post('/assistant/chat', ['message' => 'Halo', 'consent' => true]);
        $c->post('/cv-reviews', ['cv_text' => self::SAMPLE_CV, 'target_job' => 'HR', 'consent' => true]);
        $c->post('/interviews', ['job_position' => 'HR', 'interview_type' => 'hr', 'question_count' => 3]);

        $this->assertSame(200, $c->delete('/profile/data')['status']);
        $counts = $c->get('/dashboard')['body']['data']['counts'];
        $this->assertSame(['reflections' => 0, 'cv_reviews' => 0, 'interviews' => 0, 'conversations' => 0], $counts);
        $this->assertSame(200, $c->get('/profile')['status']);
    }

    public function testConsentCanBeRevoked(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $c->put('/profile/consents', ['type' => 'ai_processing', 'granted' => true]);
        $this->assertTrue($c->get('/profile/consents')['body']['data']['ai_processing']);
        $c->put('/profile/consents', ['type' => 'ai_processing', 'granted' => false]);
        $this->assertFalse($c->get('/profile/consents')['body']['data']['ai_processing']);
        $this->assertSame(428, $c->post('/assistant/chat', ['message' => 'Halo'])['status']);
    }

    public function testDeleteAccountRequiresPasswordAndRemovesEverything(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $pdf = self::makePdf(explode("\n", self::SAMPLE_CV));
        $c->multipart('/cv-reviews', ['file' => new \CURLFile($pdf, 'application/pdf', 'cv.pdf'), 'target_job' => 'HR', 'consent' => '1']);
        $uid = $u['user']['id'];
        $this->assertCount(1, glob(TEST_STORAGE . "/cv/{$uid}/*.pdf"));

        $this->assertSame(422, $c->delete('/profile', ['password' => 'salah'])['status']);
        $this->assertSame(200, $c->delete('/profile', ['password' => $u['password']])['status']);
        $this->assertSame(401, $c->get('/profile')['status']);
        $this->assertSame(401, (new HttpClient())->post('/auth/login', ['email' => $u['email'], 'password' => $u['password']])['status']);
        $this->assertDirectoryDoesNotExist(TEST_STORAGE . "/cv/{$uid}");
    }
}
