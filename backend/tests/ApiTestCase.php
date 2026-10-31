<?php

declare(strict_types=1);

namespace Tests;

use App\Domain\ReflectionQuestions;
use PHPUnit\Framework\TestCase;

abstract class ApiTestCase extends TestCase
{
    protected function newUser(?HttpClient $c = null, string $password = 'Rahasia123'): array
    {
        $c ??= new HttpClient();
        $email = 'u' . bin2hex(random_bytes(5)) . '@example.com';
        $res = $c->post('/auth/register', ['name' => 'Tester', 'email' => $email, 'password' => $password, 'accept_privacy' => true]);
        $this->assertSame(201, $res['status'], json_encode($res['body']));
        return ['client' => $c, 'email' => $email, 'password' => $password, 'user' => $res['body']['data']['user']];
    }

    protected function completeAnswers(int $seed = 0): array
    {
        $answers = [];
        $i = $seed;
        foreach (ReflectionQuestions::index() as $id => $q) {
            if ($q['type'] === 'likert') {
                $answers[$id] = ($i++ % 5) + 1;
            }
        }
        $answers['goal_focus'] = 'first_job';
        $answers['goal_text'] = 'Ingin ke bidang HR.';
        return $answers;
    }

    /** Builds a tiny, valid text-based PDF for upload tests. */
    protected static function makePdf(array $lines): string
    {
        $content = "BT /F1 11 Tf 50 780 Td 14 TL\n";
        foreach ($lines as $line) {
            $content .= '(' . str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $line) . ") Tj T*\n";
        }
        $content .= 'ET';
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            "<< /Length " . strlen($content) . " >>\nstream\n{$content}\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];
        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $obj) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1) . " 0 obj\n{$obj}\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        foreach ($offsets as $o) {
            $pdf .= sprintf("%010d 00000 n \n", $o);
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
        $path = tempnam(sys_get_temp_dir(), 'cv') . '.pdf';
        file_put_contents($path, $pdf);
        return $path;
    }

    protected const SAMPLE_CV = "Budi Santoso - budi@example.com\nPENDIDIKAN: S1 Psikologi, Universitas Contoh 2021-2025\nPENGALAMAN\n- Magang HR di PT Contoh, membantu rekrutmen 40 kandidat\n- Ketua divisi acara himpunan, mengoordinasikan 15 orang\nKETERAMPILAN: Excel, wawancara, komunikasi, analisis data dasar";
}
