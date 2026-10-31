<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Typed application configuration built from environment variables.
 * Secrets (DB password, AI key) live only in env / .env — never in code or the database.
 */
final class Config
{
    /** @param array<string, mixed> $data */
    private function __construct(private array $data)
    {
    }

    public static function fromEnv(string $appRoot): self
    {
        $env = Env::get('APP_ENV', 'production');
        $isProd = $env === 'production';

        return new self([
            'app' => [
                'env' => $env,
                'debug' => Env::bool('APP_DEBUG', false) && !$isProd,
                'url' => rtrim(Env::get('APP_URL', 'http://localhost:5173') ?? '', '/'),
                'root' => $appRoot,
                'storage' => Env::get('STORAGE_PATH', $appRoot . '/storage'),
                'timezone' => Env::get('APP_TIMEZONE', 'Asia/Jakarta'),
                'trusted_ip_header' => Env::get('TRUSTED_IP_HEADER', ''),
            ],
            'db' => [
                'host' => Env::get('DB_HOST', '127.0.0.1'),
                'port' => Env::int('DB_PORT', 3306),
                'name' => Env::get('DB_DATABASE', 'psikologia'),
                'user' => Env::get('DB_USERNAME', 'root'),
                'pass' => Env::get('DB_PASSWORD', ''),
                'socket' => Env::get('DB_SOCKET', ''),
            ],
            'session' => [
                'name' => Env::get('SESSION_NAME', 'psk_session'),
                'lifetime' => Env::int('SESSION_LIFETIME_MINUTES', 60 * 24 * 7) * 60,
                'secure' => Env::bool('SESSION_SECURE_COOKIE', $isProd),
                'save_path' => Env::get('SESSION_SAVE_PATH', ''),
                'driver' => Env::get('SESSION_DRIVER', 'database'),
            ],
            'ai' => [
                'provider' => strtolower(Env::get('AI_PROVIDER', 'mock') ?? 'mock'),
                'model' => Env::get('AI_MODEL', ''),
                'api_key' => Env::get('AI_API_KEY', ''),
                'base_url' => Env::get('AI_BASE_URL', ''),
                'timeout' => Env::int('AI_TIMEOUT_SECONDS', 90),
                'max_tokens' => Env::int('AI_MAX_TOKENS', 8000),
                'effort' => Env::get('AI_EFFORT', 'medium'),
            ],
            'mail' => [
                'driver' => Env::get('MAIL_DRIVER', 'log'),
                'from' => Env::get('MAIL_FROM', 'no-reply@psikologia.id'),
                'from_name' => Env::get('MAIL_FROM_NAME', 'Psikologia Career'),
            ],
            'upload' => [
                'max_bytes' => Env::int('CV_MAX_BYTES', 2 * 1024 * 1024),
                // false on stateless platforms (Vercel): only the analysis is stored, not the PDF.
                'store_files' => Env::bool('CV_STORE_FILES', true),
            ],
            'rate' => [
                'login' => [Env::int('RL_LOGIN_MAX', 8), 15 * 60],
                'register' => [Env::int('RL_REGISTER_MAX', 6), 60 * 60],
                'forgot' => [Env::int('RL_FORGOT_MAX', 4), 60 * 60],
                'reflection_preview' => [Env::int('RL_REFLECTION_MAX', 30), 60 * 60],
                'assistant' => [Env::int('RL_ASSISTANT_MAX', 20), 10 * 60],
                'cv' => [Env::int('RL_CV_MAX', 6), 60 * 60],
                'interview' => [Env::int('RL_INTERVIEW_MAX', 40), 60 * 60],
            ],
            'consent' => [
                'ai_processing_version' => '2026-10',
                'cv_processing_version' => '2026-10',
                'privacy_version' => '2026-10',
            ],
        ]);
    }

    public function get(string $path, mixed $default = null): mixed
    {
        $cur = $this->data;
        foreach (explode('.', $path) as $seg) {
            if (!is_array($cur) || !array_key_exists($seg, $cur)) {
                return $default;
            }
            $cur = $cur[$seg];
        }
        return $cur;
    }

    public function isProduction(): bool
    {
        return $this->get('app.env') === 'production';
    }
}
