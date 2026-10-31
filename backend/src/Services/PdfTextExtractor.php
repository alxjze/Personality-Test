<?php

declare(strict_types=1);

namespace App\Services;

use App\App;
use App\Core\HttpException;
use Smalot\PdfParser\Parser;

final class PdfTextExtractor
{
    public function __construct(App $app)
    {
    }

    public function extract(string $path): string
    {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($path);
            $text = $pdf->getText();
        } catch (\Throwable) {
            throw HttpException::validation(['file' => 'PDF tidak dapat dibaca. Pastikan file tidak rusak atau terkunci password, atau tempel teks CV secara langsung.']);
        }
        $text = preg_replace("/[ \t]+/u", ' ', $text) ?? $text;
        $text = preg_replace("/\n{3,}/u", "\n\n", $text) ?? $text;
        return trim($text);
    }
}
