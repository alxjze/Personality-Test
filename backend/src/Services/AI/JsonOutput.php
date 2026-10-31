<?php

declare(strict_types=1);

namespace App\Services\AI;

/**
 * Extracts a JSON object from an LLM response (tolerates code fences / leading prose).
 */
final class JsonOutput
{
    /** @return array<string, mixed> */
    public static function parse(string $text): array
    {
        $t = trim($text);
        $t = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $t) ?? $t;
        $start = strpos($t, '{');
        $end = strrpos($t, '}');
        if ($start === false || $end === false || $end <= $start) {
            throw AiException::badOutput();
        }
        $data = json_decode(substr($t, $start, $end - $start + 1), true);
        if (!is_array($data)) {
            throw AiException::badOutput();
        }
        return $data;
    }

    public static function str(mixed $v, int $max = 2000): string
    {
        if (!is_string($v) && !is_numeric($v)) {
            return '';
        }
        return mb_substr(trim((string) $v), 0, $max);
    }

    /** @return list<string> */
    public static function strList(mixed $v, int $maxItems = 10, int $maxLen = 600): array
    {
        if (!is_array($v)) {
            return [];
        }
        $out = [];
        foreach ($v as $item) {
            $s = self::str($item, $maxLen);
            if ($s !== '') {
                $out[] = $s;
            }
            if (count($out) >= $maxItems) {
                break;
            }
        }
        return $out;
    }

    public static function int(mixed $v, int $min, int $max): int
    {
        $n = is_numeric($v) ? (int) round((float) $v) : $min;
        return max($min, min($max, $n));
    }
}
