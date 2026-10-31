<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Repositories\CvReviewRepository;
use App\Services\ConsentService;
use App\Services\CvFileStorage;
use App\Services\CVReviewService;
use App\Services\PdfTextExtractor;

final class CvReviewController extends Controller
{
    private const MIN_TEXT = 150;
    private const MAX_TEXT = 20000;

    public function store(Request $r): Response
    {
        $userId = $r->userId();
        $v = Validator::make($r->all());
        $target = $v->string('target_job', 'Target posisi', 2, 150);
        $jd = $v->string('job_description', 'Deskripsi pekerjaan', 0, 5000, false);
        if (!$v->bool('consent')) {
            $v->addError('consent', 'Persetujuan diperlukan sebelum CV dikirim ke layanan AI untuk dianalisis.');
        }

        $file = $r->files['file'] ?? null;
        $hasFile = is_array($file) && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
        $cvText = null;
        $tmpPath = null;
        $originalName = null;
        if ($hasFile) {
            $tmpPath = $this->validatePdf($file, $v);
            $originalName = mb_substr(basename((string) ($file['name'] ?? 'cv.pdf')), 0, 200);
        } else {
            $cvText = $v->string('cv_text', 'Teks CV', self::MIN_TEXT, self::MAX_TEXT);
        }
        $v->validate();

        $this->limit('cv', 'u' . $userId);
        if ($hasFile && $tmpPath !== null) {
            $cvText = $this->app->make(PdfTextExtractor::class)->extract($tmpPath);
            if (mb_strlen($cvText) < self::MIN_TEXT) {
                throw HttpException::validation(['file' => 'Teks di PDF tidak terbaca (kemungkinan hasil scan/gambar). Silakan tempel teks CV secara langsung.']);
            }
            if (mb_strlen($cvText) > self::MAX_TEXT) {
                throw HttpException::validation(['file' => 'CV terlalu panjang untuk dianalisis (maks. sekitar 20.000 karakter).']);
            }
        }

        // Explicit, logged consent for this CV processing.
        $consent = $this->app->make(ConsentService::class);
        $consent->record($userId, ConsentService::CV_PROCESSING);

        $this->allowLongRequest();
        $storage = $this->app->make(CvFileStorage::class);
        $storedPath = null;
        try {
            if ($hasFile && $tmpPath !== null) {
                $storedPath = $storage->store($userId, $tmpPath);
            }
            $review = $this->app->make(CVReviewService::class)->review(
                $userId,
                (string) $cvText,
                (string) $target,
                $jd ?: null,
                $hasFile ? 'upload' : 'paste',
                $storedPath,
                $originalName,
            );
        } catch (\Throwable $e) {
            $storage->delete($storedPath); // don't keep files for failed reviews
            throw $e;
        }
        return Response::created($review);
    }

    /** @param array<string, mixed> $file */
    private function validatePdf(array $file, Validator $v): ?string
    {
        $err = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        $max = (int) $this->app->config->get('upload.max_bytes');
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE || (int) ($file['size'] ?? 0) > $max) {
            $v->addError('file', 'Ukuran file maksimal ' . round($max / 1048576, 1) . ' MB.');
            return null;
        }
        if ($err !== UPLOAD_ERR_OK || !is_string($file['tmp_name'] ?? null) || !is_uploaded_file($file['tmp_name'])) {
            $v->addError('file', 'Upload file gagal. Silakan coba lagi.');
            return null;
        }
        $tmp = $file['tmp_name'];
        $name = strtolower((string) ($file['name'] ?? ''));
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($tmp) ?: '';
        $head = (string) file_get_contents($tmp, false, null, 0, 5);
        if (!str_ends_with($name, '.pdf') || $mime !== 'application/pdf' || $head !== '%PDF-') {
            $v->addError('file', 'Format file harus PDF.');
            return null;
        }
        return $tmp;
    }

    public function index(Request $r): Response
    {
        return Response::ok($this->app->make(CvReviewRepository::class)->listForUser($r->userId()));
    }

    public function show(Request $r): Response
    {
        $row = $this->app->make(CvReviewRepository::class)->findForUser($r->intParam('id'), $r->userId());
        if ($row === null) {
            throw HttpException::notFound('Hasil review CV tidak ditemukan.');
        }
        return Response::ok($row);
    }

    public function destroy(Request $r): Response
    {
        $repo = $this->app->make(CvReviewRepository::class);
        $raw = $repo->rawForUser($r->intParam('id'), $r->userId());
        if ($raw === null) {
            throw HttpException::notFound('Hasil review CV tidak ditemukan.');
        }
        $this->app->make(CvFileStorage::class)->delete($raw['file_path']);
        $repo->deleteForUser((int) $raw['id'], $r->userId());
        return Response::ok(['deleted' => true]);
    }
}
