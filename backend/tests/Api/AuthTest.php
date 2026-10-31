<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\ApiTestCase;
use Tests\HttpClient;

final class AuthTest extends ApiTestCase
{
    public function testHealth(): void
    {
        $res = (new HttpClient())->get('/health');
        $this->assertSame(200, $res['status']);
        $this->assertTrue($res['body']['data']['database']);
        $this->assertSame('simulated', $res['body']['data']['ai_mode']);
    }

    public function testRegisterSucceedsAndStartsSession(): void
    {
        $u = $this->newUser();
        $me = $u['client']->get('/auth/me');
        $this->assertSame($u['email'], $me['body']['data']['user']['email']);
        $this->assertArrayNotHasKey('password_hash', $me['body']['data']['user']);
    }

    public function testSessionCookieIsHttpOnlyAndLax(): void
    {
        $res = (new HttpClient())->get('/auth/csrf');
        $this->assertMatchesRegularExpression('/Set-Cookie: psk_session=[^;]+;.*HttpOnly/i', $res['headers']);
        $this->assertMatchesRegularExpression('/SameSite=Lax/i', $res['headers']);
    }

    public function testDuplicateEmailIsRejected(): void
    {
        $u = $this->newUser();
        $res = (new HttpClient())->post('/auth/register', ['name' => 'Xavier', 'email' => strtoupper($u['email']), 'password' => 'Rahasia123', 'accept_privacy' => true]);
        $this->assertSame(422, $res['status']);
        $this->assertArrayHasKey('email', $res['body']['error']['fields']);
    }

    public function testRegisterValidation(): void
    {
        $res = (new HttpClient())->post('/auth/register', ['name' => '', 'email' => 'bukan-email', 'password' => 'pendek', 'accept_privacy' => false]);
        $this->assertSame(422, $res['status']);
        $fields = $res['body']['error']['fields'];
        foreach (['name', 'email', 'password', 'accept_privacy'] as $f) {
            $this->assertArrayHasKey($f, $fields);
        }
    }

    public function testLoginSucceedsWithCorrectPassword(): void
    {
        $u = $this->newUser();
        $c = new HttpClient();
        $res = $c->post('/auth/login', ['email' => $u['email'], 'password' => $u['password']]);
        $this->assertSame(200, $res['status']);
        $this->assertSame(200, $c->get('/dashboard')['status']);
    }

    public function testWrongPasswordIsRejected(): void
    {
        $u = $this->newUser();
        $res = (new HttpClient())->post('/auth/login', ['email' => $u['email'], 'password' => 'SalahSekali1']);
        $this->assertSame(401, $res['status']);
        $this->assertSame('invalid_credentials', $res['body']['error']['code']);
    }

    public function testUnknownEmailGetsSameError(): void
    {
        $res = (new HttpClient())->post('/auth/login', ['email' => 'tidakada@example.com', 'password' => 'Rahasia123']);
        $this->assertSame(401, $res['status']);
        $this->assertSame('Email atau password salah.', $res['body']['error']['message']);
    }

    public function testLogoutEndsSession(): void
    {
        $u = $this->newUser();
        $c = $u['client'];
        $this->assertSame(200, $c->post('/auth/logout')['status']);
        $this->assertNull($c->get('/auth/me')['body']['data']['user']);
        $this->assertSame(401, $c->get('/dashboard')['status']);
    }

    public function testProtectedRoutesRequireLogin(): void
    {
        $c = new HttpClient();
        foreach (['/dashboard', '/profile', '/reflections', '/assistant/conversations', '/cv-reviews', '/interviews'] as $path) {
            $res = $c->get($path);
            $this->assertSame(401, $res['status'], $path);
            $this->assertSame('unauthenticated', $res['body']['error']['code']);
        }
    }

    public function testMutationsRequireCsrfToken(): void
    {
        $res = (new HttpClient())->post('/auth/login', ['email' => 'a@b.co', 'password' => 'x'], false);
        $this->assertSame(419, $res['status']);
        $c = new HttpClient();
        $c->csrf();
        $c->setCsrf('forged-token');
        $this->assertSame(419, $c->post('/auth/login', ['email' => 'a@b.co', 'password' => 'x'])['status']);
    }

    public function testPasswordResetFlow(): void
    {
        $u = $this->newUser();
        $c = new HttpClient();
        $res = $c->post('/auth/forgot-password', ['email' => $u['email']]);
        $this->assertSame(200, $res['status']);
        // Unknown email returns the same response (no enumeration).
        $same = $c->post('/auth/forgot-password', ['email' => 'tidakada@example.com']);
        $this->assertSame($res['body']['data']['message'], $same['body']['data']['message']);

        $log = (string) file_get_contents(TEST_STORAGE . '/logs/app-' . gmdate('Y-m-d') . '.log');
        $this->assertGreaterThan(0, preg_match_all('/reset-password\\?token=([a-f0-9]{64})/', $log, $m));
        $token = end($m[1]);

        $this->assertSame(400, $c->post('/auth/reset-password', ['token' => str_repeat('a', 64), 'password' => 'BaruSekali9'])['status']);
        $this->assertSame(200, $c->post('/auth/reset-password', ['token' => $token, 'password' => 'BaruSekali9'])['status']);
        // Token is single-use.
        $this->assertSame(400, $c->post('/auth/reset-password', ['token' => $token, 'password' => 'BaruSekali9'])['status']);
        $this->assertSame(401, (new HttpClient())->post('/auth/login', ['email' => $u['email'], 'password' => $u['password']])['status']);
        $this->assertSame(200, (new HttpClient())->post('/auth/login', ['email' => $u['email'], 'password' => 'BaruSekali9'])['status']);
        // Old sessions were invalidated.
        $this->assertSame(401, $u['client']->get('/dashboard')['status']);
    }

    public function testErrorsDoNotLeakInternals(): void
    {
        $res = (new HttpClient())->get('/reflections/abc');
        $this->assertSame(401, $res['status']);
        $res = (new HttpClient())->get('/tidak-ada');
        $this->assertSame(404, $res['status']);
        $this->assertStringNotContainsString('.php', $res['raw']);
    }
}
