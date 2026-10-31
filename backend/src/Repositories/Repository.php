<?php

declare(strict_types=1);

namespace App\Repositories;

use App\App;
use App\Core\Database;

abstract class Repository
{
    protected Database $db;

    public function __construct(App $app)
    {
        $this->db = $app->db;
    }

    protected static function encode(mixed $value): string
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE);
    }

    protected static function decode(?string $json): mixed
    {
        if ($json === null || $json === '') {
            return null;
        }
        try {
            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }
    }

    /** Converts a UTC DATETIME string to ISO-8601 (Z) for the frontend. */
    protected static function iso(?string $dt): ?string
    {
        return $dt ? str_replace(' ', 'T', $dt) . 'Z' : null;
    }
}
