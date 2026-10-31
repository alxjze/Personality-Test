<?php

declare(strict_types=1);

namespace App\Core;

final class Request
{
    /** @var array<string, string> */
    public array $params = [];

    /** @var array<string, mixed> attributes set by middleware (e.g. authenticated user) */
    public array $attributes = [];

    /** @var array<string, mixed>|null */
    private ?array $jsonBody = null;

    /**
     * @param array<string, mixed> $query
     * @param array<string, mixed> $post
     * @param array<string, mixed> $files
     * @param array<string, string> $headers
     */
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        public readonly array $post,
        public readonly array $files,
        public readonly array $headers,
        private readonly string $rawBody,
        public readonly string $ip,
    ) {
    }

    public static function fromGlobals(Config $config): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $path = '/' . trim(rawurldecode($path), '/');
        // The API is served under /api on the same domain; strip that prefix.
        if ($path === '/api' || str_starts_with($path, '/api/')) {
            $path = substr($path, 4) ?: '/';
        }
        if ($path === '') {
            $path = '/';
        }

        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$name] = (string) $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['content-type'] = (string) $_SERVER['CONTENT_TYPE'];
        }

        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        $trusted = (string) $config->get('app.trusted_ip_header', '');
        if ($trusted !== '') {
            $h = strtolower($trusted);
            if (!empty($headers[$h])) {
                $candidate = trim(explode(',', $headers[$h])[0]);
                if (filter_var($candidate, FILTER_VALIDATE_IP)) {
                    $ip = $candidate;
                }
            }
        }

        return new self(
            $method,
            $path,
            $_GET,
            $_POST,
            $_FILES,
            $headers,
            (string) file_get_contents('php://input'),
            $ip,
        );
    }

    public function header(string $name): ?string
    {
        return $this->headers[strtolower($name)] ?? null;
    }

    /** @return array<string, mixed> */
    public function json(): array
    {
        if ($this->jsonBody !== null) {
            return $this->jsonBody;
        }
        $ct = strtolower($this->header('content-type') ?? '');
        if ($this->rawBody === '' || !str_contains($ct, 'application/json')) {
            return $this->jsonBody = [];
        }
        try {
            $data = json_decode($this->rawBody, true, 64, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw HttpException::badRequest('Format JSON tidak valid.', 'invalid_json');
        }
        return $this->jsonBody = is_array($data) ? $data : [];
    }

    /** Merged input: JSON body or form fields. */
    public function input(string $key, mixed $default = null): mixed
    {
        $json = $this->json();
        if (array_key_exists($key, $json)) {
            return $json[$key];
        }
        return $this->post[$key] ?? $default;
    }

    /** @return array<string, mixed> */
    public function all(): array
    {
        return array_merge($this->post, $this->json());
    }

    public function user(): array
    {
        $user = $this->attributes['user'] ?? null;
        if (!is_array($user)) {
            throw HttpException::unauthorized();
        }
        return $user;
    }

    public function userId(): int
    {
        return (int) $this->user()['id'];
    }

    public function intParam(string $name): int
    {
        $v = $this->params[$name] ?? '';
        if (!ctype_digit($v) || (int) $v < 1) {
            throw HttpException::notFound();
        }
        return (int) $v;
    }
}
