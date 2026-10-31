<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Small, explicit validator. Collects all field errors then throws a 422.
 */
final class Validator
{
    /** @var array<string, string> */
    private array $errors = [];

    /** @param array<string, mixed> $data */
    public function __construct(private readonly array $data)
    {
    }

    /** @param array<string, mixed> $data */
    public static function make(array $data): self
    {
        return new self($data);
    }

    public function string(string $field, string $label, int $min = 1, int $max = 255, bool $required = true): ?string
    {
        $v = $this->data[$field] ?? null;
        if ($v === null || (is_string($v) && trim($v) === '')) {
            if ($required) {
                $this->errors[$field] = "{$label} wajib diisi.";
            }
            return null;
        }
        if (!is_string($v) && !is_numeric($v)) {
            $this->errors[$field] = "{$label} tidak valid.";
            return null;
        }
        $v = trim((string) $v);
        // strip control chars except newline/tab
        $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
        $len = mb_strlen($v);
        if ($len < $min) {
            $this->errors[$field] = "{$label} minimal {$min} karakter.";
        } elseif ($len > $max) {
            $this->errors[$field] = "{$label} maksimal {$max} karakter.";
        }
        return $v;
    }

    public function email(string $field = 'email'): ?string
    {
        $v = $this->string($field, 'Email', 3, 191);
        if ($v !== null && !isset($this->errors[$field]) && !filter_var($v, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Format email tidak valid.';
        }
        return $v !== null ? mb_strtolower($v) : null;
    }

    public function password(string $field, string $label = 'Password'): ?string
    {
        $v = $this->data[$field] ?? null;
        if (!is_string($v) || $v === '') {
            $this->errors[$field] = "{$label} wajib diisi.";
            return null;
        }
        if (strlen($v) < 8) {
            $this->errors[$field] = "{$label} minimal 8 karakter.";
        } elseif (strlen($v) > 200) {
            $this->errors[$field] = "{$label} terlalu panjang.";
        } elseif (!preg_match('/[A-Za-z]/', $v) || !preg_match('/\d/', $v)) {
            $this->errors[$field] = "{$label} harus mengandung huruf dan angka.";
        }
        return $v;
    }

    public function bool(string $field): bool
    {
        $v = $this->data[$field] ?? false;
        return $v === true || $v === 1 || $v === '1' || $v === 'true' || $v === 'on';
    }

    /** @param list<string> $allowed */
    public function in(string $field, string $label, array $allowed, bool $required = true): ?string
    {
        $v = $this->data[$field] ?? null;
        if ($v === null || $v === '') {
            if ($required) {
                $this->errors[$field] = "{$label} wajib dipilih.";
            }
            return null;
        }
        if (!is_string($v) || !in_array($v, $allowed, true)) {
            $this->errors[$field] = "{$label} tidak valid.";
            return null;
        }
        return $v;
    }

    public function addError(string $field, string $message): void
    {
        $this->errors[$field] = $message;
    }

    public function fails(): bool
    {
        return $this->errors !== [];
    }

    public function validate(): void
    {
        if ($this->errors !== []) {
            throw HttpException::validation($this->errors);
        }
    }
}
