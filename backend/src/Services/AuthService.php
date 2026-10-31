<?php

declare(strict_types=1);

namespace App\Services;

use App\App;
use App\Core\HttpException;
use App\Repositories\PasswordResetRepository;
use App\Repositories\UserRepository;

final class AuthService
{
    private UserRepository $users;

    public function __construct(private readonly App $app)
    {
        $this->users = $app->make(UserRepository::class);
    }

    public static function hash(string $password): string
    {
        $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
        return password_hash($password, $algo);
    }

    public function register(string $name, string $email, string $password): array
    {
        if ($this->users->emailExists($email)) {
            throw HttpException::validation(['email' => 'Email ini sudah terdaftar. Silakan masuk.'], 'Email sudah terdaftar.');
        }
        try {
            $id = $this->users->create($name, $email, self::hash($password));
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') { // race on unique email
                throw HttpException::validation(['email' => 'Email ini sudah terdaftar. Silakan masuk.'], 'Email sudah terdaftar.');
            }
            throw $e;
        }
        $this->app->make(ConsentService::class)->record($id, ConsentService::PRIVACY_POLICY);
        $this->loginById($id);
        return $this->users->findById($id);
    }

    public function attempt(string $email, string $password): array
    {
        $row = $this->users->findAuthByEmail($email);
        // Always run a hash verification to reduce user-enumeration timing differences.
        $hash = $row['password_hash'] ?? self::hash('timing-equalizer-' . bin2hex(random_bytes(4)));
        $ok = password_verify($password, $hash);
        if (!$row || !$ok) {
            throw new HttpException(401, 'invalid_credentials', 'Email atau password salah.');
        }
        if (password_needs_rehash($row['password_hash'], defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT)) {
            $this->users->updatePassword((int) $row['id'], self::hash($password));
        }
        $this->loginById((int) $row['id']);
        return $this->users->findById((int) $row['id']);
    }

    public function loginById(int $id): void
    {
        $this->app->session->regenerate();
        $this->app->session->set('user_id', $id);
    }

    public function logout(): void
    {
        $this->app->session->destroy();
    }

    public function verifyPassword(int $userId, string $password): bool
    {
        $row = $this->users->findAuthById($userId);
        return $row !== null && password_verify($password, $row['password_hash']);
    }

    /** Always succeeds from the caller's perspective (no account enumeration). */
    public function requestPasswordReset(string $email): void
    {
        $row = $this->users->findAuthByEmail($email);
        if (!$row) {
            return;
        }
        $token = bin2hex(random_bytes(32));
        $this->app->make(PasswordResetRepository::class)->create((int) $row['id'], hash('sha256', $token), 60 * 60);
        $url = $this->app->config->get('app.url') . '/reset-password?token=' . $token;
        $body = "Halo {$row['name']},\n\nKami menerima permintaan untuk mengatur ulang password akun Psikologia Career-mu.\n"
            . "Buka tautan berikut dalam 60 menit:\n{$url}\n\nJika kamu tidak meminta ini, abaikan email ini — password-mu tidak akan berubah.\n\nSalam,\nTim Psikologia Career";
        $this->app->make(Mailer::class)->send($row['email'], 'Atur ulang password Psikologia Career', $body);
    }

    public function resetPassword(string $token, string $password): void
    {
        $resets = $this->app->make(PasswordResetRepository::class);
        $row = $resets->findValid(hash('sha256', $token));
        if (!$row) {
            throw HttpException::badRequest('Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.', 'invalid_token');
        }
        $this->users->updatePassword((int) $row['user_id'], self::hash($password));
        $resets->markUsed((int) $row['id']);
        // Invalidate all existing sessions for this user.
        $this->app->db->run('DELETE FROM sessions WHERE user_id = ?', [(int) $row['user_id']]);
    }
}
