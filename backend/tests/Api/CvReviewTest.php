<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\ApiTestCase;

final class CvReviewTest extends ApiTestCase
{
    public function testConsentIsRequired(): void
    {
        $u = $this->newUser();
        $res = $u['client']->post('/cv-reviews', ['cv_text' => self::SAMPLE_CV, 'target_job' => 'HR Generalist']);
        $this->assertSame(422, $res['status']);
        $this->assertArrayHasKey('consent', $res['body']['error']['fields']);
    }

    public function testPastedCvIsAnalysedWithEstimateNote(): void
    {
        $u = $this->newUser();
        $res = $u['client']->post('/cv-reviews', [
            'cv_text' => self::SAMPLE_CV,
            'target_job' => 'HR Generalist',
            'job_description' => 'Rekrutmen, komunikasi, Excel, administrasi karyawan',
            'consent' => true,
        ]);
        $this->assertSame(201, $res['status'], json_encode($res['body']));
        $r = $res['body']['data']['result'];
        $this->assertTrue($r['meta']['simulated']);
        $this->assertCount(5, $r['score']['criteria']);
        $this->assertSame(array_sum(array_column($r['score']['criteria'], 'score')), $r['score']['overall']);
        $this->assertStringContainsString('estimasi', $r['score']['note']);
        $this->assertFalse($res['body']['data']['has_file']);

        $consents = $u['client']->get('/profile/consents')['body']['data']['history'];
        $this->assertContains('cv_processing', array_column($consents, 'consent_type'));
    }

    public function testValidPdfUploadIsStoredPrivatelyAndDeletable(): void
    {
        $u = $this->newUser();
        $pdf = self::makePdf(explode("\n", self::SAMPLE_CV));
        $res = $u['client']->multipart('/cv-reviews', [
            'file' => new \CURLFile($pdf, 'application/pdf', 'cv-budi.pdf'),
            'target_job' => 'HR Generalist',
            'consent' => '1',
        ]);
        $this->assertSame(201, $res['status'], json_encode($res['body']));
        $this->assertTrue($res['body']['data']['has_file']);
        $this->assertSame('upload', $res['body']['data']['source']);
        $this->assertArrayNotHasKey('file_path', $res['body']['data']);

        $uid = $u['user']['id'];
        $files = glob(TEST_STORAGE . "/cv/{$uid}/*.pdf");
        $this->assertCount(1, $files);
        $this->assertSame('0600', substr(sprintf('%o', fileperms($files[0])), -4));

        $id = $res['body']['data']['id'];
        $this->assertSame(200, $u['client']->delete("/cv-reviews/{$id}")['status']);
        $this->assertCount(0, glob(TEST_STORAGE . "/cv/{$uid}/*.pdf"));
        $this->assertSame(404, $u['client']->get("/cv-reviews/{$id}")['status']);
    }

    public function testInvalidFileIsRejected(): void
    {
        $u = $this->newUser();
        $fake = tempnam(sys_get_temp_dir(), 'fake') . '.pdf';
        file_put_contents($fake, "Ini bukan PDF\n" . str_repeat('x', 500));
        $res = $u['client']->multipart('/cv-reviews', [
            'file' => new \CURLFile($fake, 'application/pdf', 'cv.pdf'),
            'target_job' => 'HR Generalist',
            'consent' => '1',
        ]);
        $this->assertSame(422, $res['status']);
        $this->assertSame('Format file harus PDF.', $res['body']['error']['fields']['file']);
    }

    public function testOversizedFileIsRejected(): void
    {
        $u = $this->newUser();
        $big = tempnam(sys_get_temp_dir(), 'big') . '.pdf';
        file_put_contents($big, '%PDF-1.4' . str_repeat('A', 2 * 1024 * 1024 + 10));
        $res = $u['client']->multipart('/cv-reviews', [
            'file' => new \CURLFile($big, 'application/pdf', 'cv.pdf'),
            'target_job' => 'HR Generalist',
            'consent' => '1',
        ]);
        $this->assertSame(422, $res['status']);
        $this->assertStringContainsString('maksimal', $res['body']['error']['fields']['file']);
    }

    public function testOtherUsersCannotAccessCvReview(): void
    {
        $owner = $this->newUser();
        $id = $owner['client']->post('/cv-reviews', ['cv_text' => self::SAMPLE_CV, 'target_job' => 'HR', 'consent' => true])['body']['data']['id'];
        $intruder = $this->newUser();
        $this->assertSame(404, $intruder['client']->get("/cv-reviews/{$id}")['status']);
        $this->assertSame(404, $intruder['client']->delete("/cv-reviews/{$id}")['status']);
        $this->assertCount(0, $intruder['client']->get('/cv-reviews')['body']['data']);
    }
}
