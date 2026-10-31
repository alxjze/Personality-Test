<?php

declare(strict_types=1);

namespace App\Services;

use App\App;
use App\Core\HttpException;
use App\Domain\CareerCatalog;
use App\Domain\ReflectionQuestions;

/**
 * Validates reflection answers and builds a deterministic, rule-based career report.
 * No AI is involved, so the report works without an AI key and is reproducible.
 */
final class CareerReflectionService
{
    public function __construct(App $app)
    {
    }

    /**
     * @param mixed $answers raw answers object from the client
     * @return array<string, int|string> sanitized answers
     */
    public function validateAnswers(mixed $answers): array
    {
        if (!is_array($answers)) {
            throw HttpException::validation(['answers' => 'Jawaban refleksi wajib dikirim.']);
        }
        $index = ReflectionQuestions::index();
        $clean = [];
        $errors = [];
        foreach ($index as $id => $q) {
            $v = $answers[$id] ?? null;
            if ($q['type'] === 'likert') {
                if (!is_int($v) && !(is_string($v) && ctype_digit($v))) {
                    $errors[$id] = 'Pertanyaan ini wajib dijawab.';
                    continue;
                }
                $v = (int) $v;
                if ($v < 1 || $v > 5) {
                    $errors[$id] = 'Jawaban harus bernilai 1–5.';
                    continue;
                }
                $clean[$id] = $v;
            } elseif ($q['type'] === 'choice') {
                $allowed = array_column($q['options'], 'value');
                if (!is_string($v) || !in_array($v, $allowed, true)) {
                    if ($q['required']) {
                        $errors[$id] = 'Silakan pilih salah satu opsi.';
                    }
                    continue;
                }
                $clean[$id] = $v;
            } elseif ($q['type'] === 'text') {
                $text = is_string($v) ? trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '') : '';
                if (mb_strlen($text) > (int) $q['max_length']) {
                    $errors[$id] = 'Maksimal ' . $q['max_length'] . ' karakter.';
                    continue;
                }
                $clean[$id] = $text;
            }
        }
        if ($errors !== []) {
            throw HttpException::validation($errors, 'Masih ada pertanyaan yang belum dijawab dengan benar.');
        }
        return $clean;
    }

    /**
     * @param array<string, int|string> $answers validated answers
     * @return array<string, mixed>
     */
    public function buildReport(array $answers): array
    {
        $index = ReflectionQuestions::index();

        // 1) Dimension scores (0–100) from Likert answers.
        $sums = [];
        $counts = [];
        foreach ($index as $id => $q) {
            if ($q['type'] !== 'likert') {
                continue;
            }
            $dim = $q['dimension'];
            $sums[$dim] = ($sums[$dim] ?? 0) + (int) $answers[$id];
            $counts[$dim] = ($counts[$dim] ?? 0) + 1;
        }
        $dim = [];
        foreach ($sums as $d => $sum) {
            $dim[$d] = (int) round((($sum / $counts[$d]) - 1) / 4 * 100);
        }

        $interests = $this->ranked(CareerCatalog::INTEREST_LABELS, $dim);
        $skills = $this->ranked(CareerCatalog::SKILL_LABELS, $dim);
        $envs = $this->ranked(CareerCatalog::ENV_LABELS, $dim);
        $values = [];
        foreach (CareerCatalog::VALUE_LABELS as $k => $label) {
            $values[] = ['key' => $k, 'label' => $label, 'score' => $dim[$k] ?? 0];
        }
        usort($values, fn ($a, $b) => $b['score'] <=> $a['score']);

        // 2) Career areas.
        $areas = [];
        foreach (CareerCatalog::areas() as $area) {
            $total = 0;
            $weightSum = 0;
            $contrib = [];
            foreach ($area['weights'] as $d => $w) {
                $s = $dim[$d] ?? 0;
                $total += $s * $w;
                $weightSum += $w;
                $contrib[$d] = $s * $w;
            }
            arsort($contrib);
            $why = [];
            foreach (array_slice(array_keys($contrib), 0, 3) as $d) {
                if (($dim[$d] ?? 0) >= 60) {
                    $why[] = $this->dimensionPhrase($d);
                }
            }
            $areas[] = [
                'id' => $area['id'],
                'name' => $area['name'],
                'score' => (int) round($total / max(1, $weightSum)),
                'description' => $area['description'],
                'why' => $why,
                'example_roles' => $area['roles'],
                'skills_to_explore' => $area['skills'],
            ];
        }
        usort($areas, fn ($a, $b) => $b['score'] <=> $a['score']);
        $topAreas = array_slice($areas, 0, 3);

        // 3) Strengths: top perceived skills with score >= 50 (at most 4).
        $strengths = array_values(array_filter($skills, fn ($s) => $s['score'] >= 50));
        $strengths = array_slice($strengths, 0, 4);
        $growthSkills = array_slice(array_reverse($skills), 0, 2);

        // 4) Preferences that are clearly leaned into (>= 70) — fall back to top 2.
        $prefs = array_values(array_filter($envs, fn ($e) => $e['score'] >= 70));
        if (count($prefs) < 2) {
            $prefs = array_slice($envs, 0, 2);
        }

        $goalFocus = (string) ($answers['goal_focus'] ?? 'explore');
        $goal = [
            'focus' => $goalFocus,
            'focus_label' => ReflectionQuestions::GOAL_FOCUS[$goalFocus] ?? $goalFocus,
            'text' => (string) ($answers['goal_text'] ?? ''),
            'clarity' => $dim['goal_clarity'] ?? 0,
            'readiness' => $dim['goal_readiness'] ?? 0,
            'experience' => $dim['goal_experience'] ?? 0,
        ];

        return [
            'version' => ReflectionQuestions::VERSION,
            'generated_at' => gmdate('c'),
            'method' => 'rule_based',
            'disclaimer' => 'Laporan ini disusun dari jawaban refleksi dirimu menggunakan aturan sederhana. Ini bukan tes psikologi tervalidasi atau diagnosis, melainkan titik awal untuk eksplorasi karier.',
            'summary' => $this->summary($interests, $strengths, $prefs, $values, $topAreas, $goal),
            'tags' => array_map(fn ($a) => $a['name'], $topAreas),
            'interests' => $interests,
            'strengths' => $strengths,
            'growth_skills' => $growthSkills,
            'work_preferences' => $prefs,
            'all_preferences' => $envs,
            'values' => array_slice($values, 0, 3),
            'all_values' => $values,
            'career_areas' => $topAreas,
            'other_areas' => array_map(fn ($a) => ['id' => $a['id'], 'name' => $a['name'], 'score' => $a['score']], array_slice($areas, 3)),
            'reflection_questions' => $this->reflectionQuestions($topAreas, $values, $goal, $prefs),
            'development' => $this->development($growthSkills, $topAreas, $goal),
            'next_steps' => $this->nextSteps($topAreas, $goal),
            'goal' => $goal,
        ];
    }

    /** Short plain-text context used by the AI Career Assistant. */
    public function contextSummary(array $result): string
    {
        $areas = implode(', ', array_map(fn ($a) => $a['name'] . ' (' . $a['score'] . ')', $result['career_areas'] ?? []));
        $strengths = implode(', ', array_map(fn ($s) => $s['label'], $result['strengths'] ?? []));
        $interests = implode(', ', array_map(fn ($s) => $s['label'], array_slice($result['interests'] ?? [], 0, 3)));
        $values = implode(', ', array_map(fn ($v) => $v['label'], $result['values'] ?? []));
        $prefs = implode(', ', array_map(fn ($p) => $p['label'], $result['work_preferences'] ?? []));
        $goal = $result['goal'] ?? [];
        $lines = [
            "Area karier teratas (skor kecocokan refleksi 0–100): {$areas}",
            "Minat paling menonjol: {$interests}",
            "Kekuatan yang dirasakan: " . ($strengths ?: 'belum terlihat menonjol'),
            "Nilai kerja utama: {$values}",
            "Preferensi lingkungan kerja: {$prefs}",
            'Fokus 6–12 bulan: ' . ($goal['focus_label'] ?? '-'),
            'Kejelasan arah karier: ' . ($goal['clarity'] ?? '-') . '/100, kesiapan rekrutmen: ' . ($goal['readiness'] ?? '-') . '/100',
        ];
        if (!empty($goal['text'])) {
            $lines[] = 'Tujuan menurut pengguna: ' . $goal['text'];
        }
        return implode("\n", $lines);
    }

    /** @param array<string, array{0:string,1:string}> $labels */
    private function ranked(array $labels, array $dim): array
    {
        $out = [];
        foreach ($labels as $k => [$label, $desc]) {
            $out[] = ['key' => $k, 'label' => $label, 'description' => $desc, 'score' => $dim[$k] ?? 0];
        }
        usort($out, fn ($a, $b) => $b['score'] <=> $a['score']);
        return $out;
    }

    private function dimensionPhrase(string $d): string
    {
        if (isset(CareerCatalog::INTEREST_LABELS[$d])) {
            return 'Minat ' . mb_strtolower(CareerCatalog::INTEREST_LABELS[$d][0]) . ' yang tinggi';
        }
        if (isset(CareerCatalog::SKILL_LABELS[$d])) {
            return 'Merasa kuat dalam ' . mb_strtolower(CareerCatalog::SKILL_LABELS[$d][0]);
        }
        if (isset(CareerCatalog::ENV_LABELS[$d])) {
            return 'Menyukai ' . mb_strtolower(CareerCatalog::ENV_LABELS[$d][0]);
        }
        if (isset(CareerCatalog::VALUE_LABELS[$d])) {
            return 'Menghargai ' . mb_strtolower(CareerCatalog::VALUE_LABELS[$d]);
        }
        return $d;
    }

    private function summary(array $interests, array $strengths, array $prefs, array $values, array $areas, array $goal): string
    {
        $topInterest = mb_strtolower($interests[0]['label']);
        $secondInterest = mb_strtolower($interests[1]['label']);
        $s = "Dari jawabanmu, minat yang paling menonjol adalah aktivitas yang {$topInterest}, disusul {$secondInterest}. ";
        if ($strengths !== []) {
            $list = $this->joinList(array_map(fn ($x) => mb_strtolower($x['label']), array_slice($strengths, 0, 3)));
            $s .= "Kamu merasa cukup kuat dalam {$list}. ";
        } else {
            $s .= 'Saat ini kamu belum menilai satu keterampilan pun sebagai kekuatan yang menonjol — itu wajar, dan justru bisa menjadi titik awal untuk mengenali kemampuanmu lewat pengalaman nyata. ';
        }
        $prefList = $this->joinList(array_map(fn ($x) => mb_strtolower($x['label']), $prefs));
        $s .= "Dalam bekerja, kamu cenderung menghargai {$prefList}, dan nilai yang paling penting bagimu adalah " . mb_strtolower($values[0]['label']) . '. ';
        $areaList = $this->joinList(array_map(fn ($a) => $a['name'], $areas));
        $s .= "Kombinasi ini membuat area {$areaList} layak kamu eksplorasi lebih jauh.";
        if (($goal['clarity'] ?? 0) < 50) {
            $s .= ' Karena arah kariermu masih terasa belum jelas, anggap hasil ini sebagai peta awal — bukan jawaban akhir.';
        }
        return $s;
    }

    private function reflectionQuestions(array $areas, array $values, array $goal, array $prefs): array
    {
        $q = [
            'Dari area ' . $areas[0]['name'] . ', peran mana yang paling membuatmu penasaran — dan apa alasannya?',
            'Kapan terakhir kali kamu merasa benar-benar "hidup" saat mengerjakan sesuatu? Aktivitas apa yang sedang kamu lakukan saat itu?',
            'Nilai "' . mb_strtolower($values[0]['label']) . '" tampak penting bagimu. Seperti apa wujud nyatanya dalam pekerjaan impianmu?',
            'Lingkungan dengan ' . mb_strtolower($prefs[0]['label']) . ' terasa cocok untukmu. Pengalaman apa yang membuatmu menyimpulkan hal itu?',
        ];
        if (($goal['experience'] ?? 0) < 50) {
            $q[] = 'Pengalaman kecil apa (proyek, volunteer, magang singkat) yang bisa kamu coba dalam 1–2 bulan ke depan untuk menguji minatmu?';
        } else {
            $q[] = 'Dari pengalaman yang sudah kamu miliki, bagian mana yang paling ingin kamu ulangi — dan bagian mana yang ingin kamu hindari?';
        }
        return $q;
    }

    private function development(array $growthSkills, array $areas, array $goal): array
    {
        $items = [];
        foreach ($growthSkills as $g) {
            $items[] = [
                'title' => 'Latih ' . mb_strtolower($g['label']),
                'description' => 'Kamu menilai keterampilan ini relatif lebih rendah dibanding yang lain. Pilih satu kegiatan kecil — kursus singkat, proyek kelompok, atau tugas sukarela — yang memberi kesempatan melatihnya secara rutin.',
            ];
        }
        $skillsToExplore = $areas[0]['skills_to_explore'][0] ?? null;
        if ($skillsToExplore) {
            $items[] = [
                'title' => 'Bangun dasar untuk ' . $areas[0]['name'],
                'description' => "Mulailah dari \"{$skillsToExplore}\". Cari materi gratis atau kursus singkat, lalu buat satu hasil kerja kecil yang bisa kamu masukkan ke CV atau portofolio.",
            ];
        }
        if (($goal['readiness'] ?? 0) < 60) {
            $items[] = [
                'title' => 'Tingkatkan kesiapan rekrutmen',
                'description' => 'Rapikan CV agar menonjolkan pencapaian, lalu latih jawaban wawancara dengan metode STAR (Situation, Task, Action, Result).',
            ];
        }
        return $items;
    }

    private function nextSteps(array $areas, array $goal): array
    {
        $roles = $this->joinList(array_slice($areas[0]['example_roles'], 0, 2), 'atau');
        return [
            [
                'title' => 'Eksplorasi 2–3 peran yang menarik',
                'description' => "Baca deskripsi pekerjaan untuk peran seperti {$roles}. Catat keterampilan yang paling sering diminta.",
                'action' => ['label' => 'Tanya AI Career Assistant', 'href' => '/career-assistant'],
            ],
            [
                'title' => 'Sesuaikan CV dengan peran incaran',
                'description' => 'Gunakan kata kunci dari deskripsi pekerjaan dan tonjolkan pengalaman yang relevan — tanpa melebih-lebihkan.',
                'action' => ['label' => 'Buka CV Reviewer', 'href' => '/cv-reviewer'],
            ],
            [
                'title' => 'Latihan wawancara untuk peran tersebut',
                'description' => 'Latih jawaban dengan struktur STAR dan minta umpan balik agar lebih percaya diri.',
                'action' => ['label' => 'Mulai Latihan Interview', 'href' => '/interview-preparation'],
            ],
            [
                'title' => 'Bicara dengan orang yang menjalaninya',
                'description' => 'Cari 1–2 orang yang bekerja di area ' . $areas[0]['name'] . ' (alumni, LinkedIn, komunitas) dan ajak ngobrol singkat tentang keseharian kerja mereka.',
                'action' => null,
            ],
        ];
    }

    private function joinList(array $items, string $last = 'dan'): string
    {
        $items = array_values($items);
        $n = count($items);
        if ($n === 0) {
            return '';
        }
        if ($n === 1) {
            return $items[0];
        }
        return implode(', ', array_slice($items, 0, -1)) . " {$last} " . $items[$n - 1];
    }
}
