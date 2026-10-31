<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Repositories\UserRepository;
use App\Services\AuthService;

final class AuthController extends Controller
{
    public function csrf(Request $r): Response
    {
        return Response::ok(['csrf_token' => $this->app->session->csrfToken()]);
    }

    public function me(Request $r): Response
    {
        $id = $this->app->session->get('user_id');
        $user = is_int($id) ? $this->app->make(UserRepository::class)->findById($id) : null;
        return Response::ok(['user' => $user, 'csrf_token' => $this->app->session->csrfToken()]);
    }

    public function register(Request $r): Response
    {
        $this->limit('register', $r->ip);
        $v = Validator::make($r->all());
        $name = $v->string('name', 'Nama', 2, 100);
        $email = $v->email();
        $password = $v->password('password');
        if (!$v->bool('accept_privacy')) {
            $v->addError('accept_privacy', 'Kamu perlu menyetujui Kebijakan Privasi untuk membuat akun.');
        }
        $v->validate();
        $user = $this->app->make(AuthService::class)->register((string) $name, (string) $email, (string) $password);
        return Response::created(['user' => $user, 'csrf_token' => $this->app->session->csrfToken()]);
    }

    public function login(Request $r): Response
    {
        $v = Validator::make($r->all());
        $email = $v->email();
        $password = $r->input('password');
        if (!is_string($password) || $password === '') {
            $v->addError('password', 'Password wajib diisi.');
        }
        $v->validate();
        $this->limit('login', $r->ip . '|' . $email);
        $user = $this->app->make(AuthService::class)->attempt((string) $email, (string) $password);
        return Response::ok(['user' => $user, 'csrf_token' => $this->app->session->csrfToken()]);
    }

    public function logout(Request $r): Response
    {
        $this->app->make(AuthService::class)->logout();
        return Response::ok(['logged_out' => true]);
    }

    public function forgot(Request $r): Response
    {
        $v = Validator::make($r->all());
        $email = $v->email();
        $v->validate();
        $this->limit('forgot', $r->ip);
        $this->app->make(AuthService::class)->requestPasswordReset((string) $email);
        return Response::ok(['message' => 'Jika email terdaftar, kami telah mengirim tautan untuk mengatur ulang password.']);
    }

    public function reset(Request $r): Response
    {
        $v = Validator::make($r->all());
        $token = $v->string('token', 'Token', 64, 64);
        $password = $v->password('password', 'Password baru');
        $v->validate();
        if (!ctype_xdigit((string) $token)) {
            throw HttpException::badRequest('Tautan reset tidak valid.', 'invalid_token');
        }
        $this->limit('forgot', $r->ip);
        $this->app->make(AuthService::class)->resetPassword((string) $token, (string) $password);
        return Response::ok(['message' => 'Password berhasil diperbarui. Silakan masuk dengan password baru.']);
    }
}
