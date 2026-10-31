<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Repositories\ProfileRepository;
use App\Repositories\UserRepository;
use App\Services\AccountService;
use App\Services\AuthService;
use App\Services\ConsentService;

final class ProfileController extends Controller
{
    public function show(Request $r): Response
    {
        return Response::ok([
            'user' => $r->user(),
            'profile' => $this->app->make(ProfileRepository::class)->findByUser($r->userId()),
        ]);
    }

    public function update(Request $r): Response
    {
        $v = Validator::make($r->all());
        $name = $v->string('name', 'Nama', 2, 100);
        $education = $v->string('education', 'Pendidikan', 0, 150, false);
        $position = $v->string('current_position', 'Posisi saat ini', 0, 150, false);
        $goal = $v->string('career_goal', 'Tujuan karier', 0, 1000, false);
        $v->validate();
        $userId = $r->userId();
        $this->app->make(UserRepository::class)->updateName($userId, (string) $name);
        $this->app->make(ProfileRepository::class)->upsert($userId, $education ?: null, $position ?: null, $goal ?: null, []);
        return Response::ok([
            'user' => $this->app->make(UserRepository::class)->findById($userId),
            'profile' => $this->app->make(ProfileRepository::class)->findByUser($userId),
        ]);
    }

    public function password(Request $r): Response
    {
        $v = Validator::make($r->all());
        $current = $r->input('current_password');
        $new = $v->password('new_password', 'Password baru');
        $v->validate();
        $auth = $this->app->make(AuthService::class);
        if (!is_string($current) || !$auth->verifyPassword($r->userId(), $current)) {
            throw HttpException::validation(['current_password' => 'Password saat ini salah.']);
        }
        $this->app->make(UserRepository::class)->updatePassword($r->userId(), AuthService::hash((string) $new));
        // Sign out other sessions, keep this one (regenerated).
        $this->app->db->run('DELETE FROM sessions WHERE user_id = ?', [$r->userId()]);
        $auth->loginById($r->userId());
        return Response::ok(['message' => 'Password berhasil diperbarui.', 'csrf_token' => $this->app->session->csrfToken()]);
    }

    public function consents(Request $r): Response
    {
        return Response::ok($this->app->make(ConsentService::class)->status($r->userId()));
    }

    public function updateConsent(Request $r): Response
    {
        $v = Validator::make($r->all());
        $type = $v->in('type', 'Jenis persetujuan', [ConsentService::AI_PROCESSING]);
        $v->validate();
        $svc = $this->app->make(ConsentService::class);
        if ($v->bool('granted')) {
            if (!$svc->has($r->userId(), (string) $type)) {
                $svc->record($r->userId(), (string) $type);
            }
        } else {
            $svc->revoke($r->userId(), (string) $type);
        }
        return Response::ok($svc->status($r->userId()));
    }

    public function deleteData(Request $r): Response
    {
        $this->app->make(AccountService::class)->deletePersonalData($r->userId());
        return Response::ok(['deleted' => true]);
    }

    public function destroy(Request $r): Response
    {
        $password = $r->input('password');
        if (!is_string($password) || !$this->app->make(AuthService::class)->verifyPassword($r->userId(), $password)) {
            throw HttpException::validation(['password' => 'Password salah. Akun tidak dihapus.']);
        }
        $this->app->make(AccountService::class)->deleteAccount($r->userId());
        $this->app->session->destroy();
        return Response::ok(['deleted' => true]);
    }
}
