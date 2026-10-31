<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Cookie-based PHP session with hardened settings.
 * Same-origin SPA + HttpOnly cookie + SameSite=Lax + CSRF header token.
 */
final class Session
{
    private bool $started = false;

    public function __construct(private readonly Config $config, private readonly ?Database $db = null)
    {
    }

    public function start(): void
    {
        if ($this->started || session_status() === PHP_SESSION_ACTIVE) {
            $this->started = true;
            return;
        }
        $lifetime = (int) $this->config->get('session.lifetime');
        if ($this->db !== null && $this->config->get('session.driver') === 'database') {
            session_set_save_handler(new DbSessionHandler($this->db, $lifetime), true);
        } else {
            $savePath = (string) $this->config->get('session.save_path');
            if ($savePath === '') {
                $savePath = rtrim((string) $this->config->get('app.storage'), '/') . '/sessions';
            }
            if (!is_dir($savePath)) {
                @mkdir($savePath, 0700, true);
            }
            session_save_path($savePath);
        }
        ini_set('session.gc_probability', '1');
        ini_set('session.gc_divisor', '100');
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_trans_sid', '0');
        ini_set('session.gc_maxlifetime', (string) $lifetime);
        ini_set('session.sid_length', '48');
        ini_set('session.sid_bits_per_character', '6');
        session_name((string) $this->config->get('session.name'));
        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path' => '/',
            'secure' => (bool) $this->config->get('session.secure'),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
        $this->started = true;

        // Absolute idle timeout enforcement.
        $now = time();
        $last = (int) ($_SESSION['_last_seen'] ?? $now);
        if ($now - $last > $lifetime) {
            $this->destroy();
            session_start();
        }
        $_SESSION['_last_seen'] = $now;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $this->start();
        return $_SESSION[$key] ?? $default;
    }

    public function set(string $key, mixed $value): void
    {
        $this->start();
        $_SESSION[$key] = $value;
    }

    public function forget(string $key): void
    {
        $this->start();
        unset($_SESSION[$key]);
    }

    /** Prevent session fixation on privilege change (login/register). */
    public function regenerate(): void
    {
        $this->start();
        session_regenerate_id(true);
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }

    public function csrfToken(): string
    {
        $this->start();
        if (empty($_SESSION['_csrf']) || !is_string($_SESSION['_csrf'])) {
            $_SESSION['_csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf'];
    }

    public function destroy(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return;
        }
        $_SESSION = [];
        $params = session_get_cookie_params();
        if (!headers_sent()) {
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'secure' => $params['secure'],
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
        }
        session_destroy();
    }
}
