<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Domain\ReflectionQuestions;
use App\Repositories\ReflectionRepository;
use App\Services\CareerReflectionService;

final class ReflectionController extends Controller
{
    public function questions(Request $r): Response
    {
        return Response::ok(ReflectionQuestions::payload());
    }

    /** Guest-friendly: computes the report without storing anything. */
    public function preview(Request $r): Response
    {
        $this->limit('reflection_preview', $r->ip);
        $svc = $this->app->make(CareerReflectionService::class);
        $answers = $svc->validateAnswers($r->input('answers'));
        return Response::ok(['result' => $svc->buildReport($answers), 'saved' => false]);
    }

    public function store(Request $r): Response
    {
        $svc = $this->app->make(CareerReflectionService::class);
        $answers = $svc->validateAnswers($r->input('answers'));
        $result = $svc->buildReport($answers);
        $repo = $this->app->make(ReflectionRepository::class);
        $id = $repo->create($r->userId(), $answers, $result);
        return Response::created($repo->findForUser($id, $r->userId()));
    }

    public function index(Request $r): Response
    {
        return Response::ok($this->app->make(ReflectionRepository::class)->listForUser($r->userId()));
    }

    public function latest(Request $r): Response
    {
        return Response::ok($this->app->make(ReflectionRepository::class)->latestForUser($r->userId()));
    }

    public function show(Request $r): Response
    {
        $row = $this->app->make(ReflectionRepository::class)->findForUser($r->intParam('id'), $r->userId());
        if ($row === null) {
            throw HttpException::notFound('Hasil refleksi tidak ditemukan.');
        }
        return Response::ok($row);
    }

    public function destroy(Request $r): Response
    {
        if (!$this->app->make(ReflectionRepository::class)->deleteForUser($r->intParam('id'), $r->userId())) {
            throw HttpException::notFound('Hasil refleksi tidak ditemukan.');
        }
        return Response::ok(['deleted' => true]);
    }
}
