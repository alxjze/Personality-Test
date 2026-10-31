<?php

declare(strict_types=1);

namespace Tests;

/**
 * Minimal cookie-aware HTTP client that mimics the SPA (session cookie + CSRF header).
 */
final class HttpClient
{
    private string $cookieFile;
    private ?string $csrf = null;

    public function __construct()
    {
        $this->cookieFile = tempnam(sys_get_temp_dir(), 'psk-cookie-');
    }

    public function __destruct()
    {
        @unlink($this->cookieFile);
    }

    public function csrf(): string
    {
        if ($this->csrf === null) {
            $this->csrf = $this->get('/auth/csrf')['body']['data']['csrf_token'];
        }
        return $this->csrf;
    }

    public function setCsrf(?string $token): void
    {
        $this->csrf = $token;
    }

    public function get(string $path): array
    {
        return $this->request('GET', $path);
    }

    public function post(string $path, array $json = [], bool $withCsrf = true): array
    {
        return $this->request('POST', $path, $json, $withCsrf);
    }

    public function put(string $path, array $json = []): array
    {
        return $this->request('PUT', $path, $json);
    }

    public function delete(string $path, array $json = []): array
    {
        return $this->request('DELETE', $path, $json);
    }

    /** @param array<string, mixed> $fields */
    public function multipart(string $path, array $fields): array
    {
        return $this->request('POST', $path, null, true, $fields);
    }

    public function request(string $method, string $path, ?array $json = null, bool $withCsrf = true, ?array $multipart = null): array
    {
        $ch = curl_init(TEST_BASE_URL . $path);
        $headers = ['Accept: application/json'];
        if ($method !== 'GET' && $withCsrf) {
            $headers[] = 'X-CSRF-Token: ' . $this->csrf();
        }
        $opts = [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_COOKIEJAR => $this->cookieFile,
            CURLOPT_COOKIEFILE => $this->cookieFile,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HEADER => true,
        ];
        if ($multipart !== null) {
            $opts[CURLOPT_POSTFIELDS] = $multipart;
        } elseif ($json !== null && $method !== 'GET') {
            $headers[] = 'Content-Type: application/json';
            $opts[CURLOPT_POSTFIELDS] = json_encode($json);
        }
        $opts[CURLOPT_HTTPHEADER] = $headers;
        curl_setopt_array($ch, $opts);
        $raw = (string) curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);
        $rawHeaders = substr($raw, 0, $headerSize);
        $body = json_decode(substr($raw, $headerSize), true);
        // Keep CSRF in sync after login/register (session regenerated).
        if (is_array($body) && isset($body['data']['csrf_token'])) {
            $this->csrf = $body['data']['csrf_token'];
        }
        return ['status' => $status, 'body' => $body, 'headers' => $rawHeaders, 'raw' => substr($raw, $headerSize)];
    }
}
