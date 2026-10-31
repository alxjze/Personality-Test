<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Repositories\InterviewRepository;
use App\Services\ConsentService;
use App\Services\InterviewPreparationService;

final class InterviewController extends Controller
{
    public function types(Request $r): Response
    {
        $out = [];
        foreach (InterviewPreparationService::TYPES as $k => $label) {
            $out[] = ['value' => $k, 'label' => $label];
        }
        return Response::ok($out);
    }

    public function store(Request $r): Response
    {
        $v = Validator::make($r->all());
        $position = $v->string('job_position', 'Posisi', 2, 150);
        $type = $v->in('interview_type', 'Jenis interview', array_keys(InterviewPreparationService::TYPES));
        $count = $r->input('question_count', 5);
        if (!is_numeric($count) || (int) $count < 3 || (int) $count > 6) {
            $v->addError('question_count', 'Jumlah pertanyaan 3–6.');
        }
        $v->validate();
        $userId = $r->userId();
        $this->app->make(ConsentService::class)->requireAiConsent($userId, $v->bool('consent'));
        $this->limit('interview', 'u' . $userId);
        $this->allowLongRequest();
        $session = $this->app->make(InterviewPreparationService::class)->create($userId, (string) $position, (string) $type, (int) $count);
        return Response::created($session);
    }

    public function answer(Request $r): Response
    {
        $v = Validator::make($r->all());
        $answer = $v->string('answer', 'Jawaban', 20, 3000);
        $idx = $r->input('question_index');
        if (!is_int($idx) && !(is_string($idx) && ctype_digit($idx))) {
            $v->addError('question_index', 'Pertanyaan tidak valid.');
        }
        $v->validate();
        $userId = $r->userId();
        $this->app->make(ConsentService::class)->requireAiConsent($userId, $v->bool('consent'));
        $this->limit('interview', 'u' . $userId);
        $this->allowLongRequest();
        $session = $this->app->make(InterviewPreparationService::class)->answer($userId, $r->intParam('id'), (int) $idx, (string) $answer);
        return Response::ok($session);
    }

    public function index(Request $r): Response
    {
        return Response::ok($this->app->make(InterviewRepository::class)->listForUser($r->userId()));
    }

    public function show(Request $r): Response
    {
        $row = $this->app->make(InterviewRepository::class)->findForUser($r->intParam('id'), $r->userId());
        if ($row === null) {
            throw HttpException::notFound('Sesi latihan tidak ditemukan.');
        }
        return Response::ok($row);
    }

    public function destroy(Request $r): Response
    {
        if (!$this->app->make(InterviewRepository::class)->deleteForUser($r->intParam('id'), $r->userId())) {
            throw HttpException::notFound('Sesi latihan tidak ditemukan.');
        }
        return Response::ok(['deleted' => true]);
    }
}
