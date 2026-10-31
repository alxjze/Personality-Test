<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Repositories\ConversationRepository;
use App\Services\CareerAssistantService;
use App\Services\ConsentService;

final class AssistantController extends Controller
{
    public function chat(Request $r): Response
    {
        $v = Validator::make($r->all());
        $message = $v->string('message', 'Pesan', 1, 2000);
        $convId = $r->input('conversation_id');
        if ($convId !== null && !(is_int($convId) || (is_string($convId) && ctype_digit($convId)))) {
            $v->addError('conversation_id', 'Percakapan tidak valid.');
        }
        $v->validate();
        $userId = $r->userId();
        $this->app->make(ConsentService::class)->requireAiConsent($userId, $v->bool('consent'));
        $this->limit('assistant', 'u' . $userId);
        $this->allowLongRequest();
        $data = $this->app->make(CareerAssistantService::class)->chat($userId, (string) $message, $convId === null ? null : (int) $convId);
        return Response::ok($data);
    }

    public function conversations(Request $r): Response
    {
        return Response::ok($this->app->make(ConversationRepository::class)->listForUser($r->userId()));
    }

    public function show(Request $r): Response
    {
        $repo = $this->app->make(ConversationRepository::class);
        $conv = $repo->findForUser($r->intParam('id'), $r->userId());
        if ($conv === null) {
            throw HttpException::notFound('Percakapan tidak ditemukan.');
        }
        $conv['messages'] = $repo->messages($conv['id']);
        return Response::ok($conv);
    }

    public function destroy(Request $r): Response
    {
        if (!$this->app->make(ConversationRepository::class)->deleteForUser($r->intParam('id'), $r->userId())) {
            throw HttpException::notFound('Percakapan tidak ditemukan.');
        }
        return Response::ok(['deleted' => true]);
    }
}
