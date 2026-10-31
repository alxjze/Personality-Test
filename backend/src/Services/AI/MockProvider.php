<?php

declare(strict_types=1);

namespace App\Services\AI;

/**
 * Development/demo provider used when no AI key is configured.
 *
 * Responses are produced by simple heuristics and templates. They are ALWAYS flagged
 * `simulated: true` and the UI labels them "Simulasi" — they must never be presented
 * as real AI output.
 */
final class MockProvider implements AiProvider
{
    public function name(): string
    {
        return 'mock';
    }

    public function isSimulated(): bool
    {
        return true;
    }

    public function complete(string $system, array $messages, array $options = []): AiResult
    {
        $feature = $options['feature'] ?? 'assistant';
        $input = $options['mock'] ?? [];
        $text = match ($feature) {
            'cv_review' => json_encode($this->cvReview($input), JSON_UNESCAPED_UNICODE),
            'interview_questions' => json_encode($this->interviewQuestions($input), JSON_UNESCAPED_UNICODE),
            'interview_feedback' => json_encode($this->interviewFeedback($input), JSON_UNESCAPED_UNICODE),
            default => $this->assistant($messages, $input),
        };
        return new AiResult((string) $text, 'mock', 'simulasi-lokal', true);
    }

    private function assistant(array $messages, array $input): string
    {
        $last = '';
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if ($messages[$i]['role'] === 'user') {
                $last = mb_strtolower($messages[$i]['content']);
                break;
            }
        }
        $areas = $input['top_areas'] ?? [];
        $intro = "[Simulasi] Ini adalah respons contoh karena layanan AI belum dikonfigurasi — bukan jawaban dari model AI sungguhan.\n\n";

        if (preg_match('/\bcv\b|resume|riwayat hidup/u', $last)) {
            $body = "Beberapa langkah umum untuk memperkuat CV:\n1. Sesuaikan CV dengan satu target posisi dan gunakan kata kunci dari deskripsi pekerjaan.\n2. Tulis pengalaman dengan pola kata kerja aktif + apa yang kamu lakukan + hasilnya.\n3. Cantumkan hanya keterampilan yang benar-benar bisa kamu buktikan.\n\nKamu juga bisa mencoba fitur CV Reviewer untuk analisis yang lebih spesifik.";
        } elseif (preg_match('/interview|wawancara/u', $last)) {
            $body = "Untuk persiapan wawancara:\n1. Siapkan 3–4 cerita pengalaman menggunakan metode STAR (Situation, Task, Action, Result).\n2. Pelajari perusahaan dan peran yang dilamar.\n3. Latih jawaban dengan suara keras, lalu perbaiki bagian yang terasa kurang jelas.\n\nFitur Persiapan Interview bisa membantumu berlatih per pertanyaan.";
        } elseif ($areas !== []) {
            $list = implode(', ', $areas);
            $body = "Berdasarkan hasil refleksimu, area yang bisa kamu eksplorasi antara lain {$list}.\nLangkah yang bisa kamu ambil:\n1. Pilih satu peran dari area tersebut dan baca 5 lowongan untuk melihat keterampilan yang sering diminta.\n2. Ambil satu kursus singkat atau proyek kecil untuk menguji minatmu.\n3. Ajak ngobrol satu orang yang sudah bekerja di bidang itu.\n\nApa yang paling ingin kamu ketahui lebih dulu?";
        } else {
            $body = "Aku bisa membantu soal eksplorasi karier, CV, atau persiapan wawancara. Agar saran lebih personal, coba isi Refleksi Karier terlebih dahulu.\n\nCeritakan sedikit tentang latar belakang pendidikan dan bidang yang sedang kamu pertimbangkan.";
        }
        return $intro . $body;
    }

    private function cvReview(array $input): array
    {
        $cv = (string) ($input['cv_text'] ?? '');
        $target = (string) ($input['target_job'] ?? 'posisi target');
        $jd = mb_strtolower((string) ($input['job_description'] ?? ''));
        $lower = mb_strtolower($cv);
        $words = max(1, str_word_count($lower));

        $sections = [
            'pendidikan' => '/pendidikan|education/u',
            'pengalaman' => '/pengalaman|experience|magang|internship/u',
            'keterampilan' => '/keterampilan|skill|kemampuan/u',
            'organisasi/proyek' => '/organisasi|proyek|project|volunteer/u',
            'kontak' => '/@|\+62|linkedin/u',
        ];
        $found = [];
        foreach ($sections as $name => $re) {
            if (preg_match($re, $lower)) {
                $found[] = $name;
            }
        }
        $lines = array_values(array_filter(array_map('trim', preg_split('/\R/u', $cv) ?: [])));
        $bulletLines = array_values(array_filter($lines, fn ($l) => preg_match('/^([-•*▪●]|\d+[.)])\s*/u', $l)));
        $numbers = preg_match_all('/\d+\s?(%|persen|orang|peserta|juta|ribu|x)/u', $lower);

        $jdWords = array_unique(array_filter(preg_split('/[^\p{L}\p{N}+#]+/u', $jd) ?: [], fn ($w) => mb_strlen($w) > 4));
        $matched = [];
        $missing = [];
        foreach (array_slice($jdWords, 0, 40) as $w) {
            if (str_contains($lower, $w)) {
                $matched[] = $w;
            } else {
                $missing[] = $w;
            }
        }

        $structure = min(20, 6 + count($found) * 3);
        $relevance = $jd === '' ? 10 : min(20, 5 + (int) round(15 * count($matched) / max(1, count($matched) + count($missing))));
        $clarity = min(20, $words > 120 ? 14 : 9);
        $bullets = min(20, 6 + min(8, count($bulletLines)) + min(6, $numbers * 2));
        $skills = in_array('keterampilan', $found, true) ? 14 : 8;

        $rewrites = [];
        foreach (array_slice($bulletLines, 0, 2) as $b) {
            $clean = preg_replace('/^([-•*▪●]|\d+[.)])\s*/u', '', $b);
            $rewrites[] = [
                'original' => $clean,
                'improved' => 'Mengelola/menjalankan ' . lcfirst((string) $clean) . ' sehingga [hasil terukur, mis. jumlah atau persentase].',
                'reason' => 'Contoh pola kata kerja aktif + hasil. Lengkapi bagian dalam kurung siku dengan data nyatamu.',
            ];
        }

        return [
            'summary' => "[Simulasi] Analisis heuristik sederhana untuk posisi {$target}. CV memuat bagian: " . ($found ? implode(', ', $found) : 'belum terdeteksi bagian standar') . '. Hasil ini bukan dari model AI.',
            'criteria' => [
                ['key' => 'structure', 'score' => $structure, 'note' => 'Dihitung dari jumlah bagian standar yang terdeteksi.'],
                ['key' => 'relevance', 'score' => $relevance, 'note' => $jd === '' ? 'Tanpa deskripsi pekerjaan, relevansi dinilai netral.' : 'Dihitung dari kecocokan kata kunci dengan deskripsi pekerjaan.'],
                ['key' => 'clarity', 'score' => $clarity, 'note' => 'Diperkirakan dari panjang dan kelengkapan isi.'],
                ['key' => 'bullets', 'score' => $bullets, 'note' => 'Dihitung dari jumlah bullet dan hasil kuantitatif yang tertulis.'],
                ['key' => 'skills', 'score' => $skills, 'note' => 'Berdasarkan ada/tidaknya bagian keterampilan.'],
            ],
            'strengths' => array_values(array_filter([
                count($found) >= 3 ? 'Struktur CV sudah memuat beberapa bagian penting.' : null,
                $numbers > 0 ? 'Sudah ada pencapaian yang dikuantifikasi.' : null,
                count($bulletLines) >= 3 ? 'Pengalaman sudah ditulis dalam bentuk poin yang mudah dipindai.' : null,
            ])) ?: ['CV sudah memberikan gambaran awal tentang latar belakangmu.'],
            'improvements' => array_values(array_filter([
                $numbers === 0 ? ['area' => 'Dampak', 'suggestion' => 'Tambahkan hasil konkret (angka, skala, atau dampak) pada pengalaman yang memang kamu miliki.', 'priority' => 'tinggi'] : null,
                !in_array('keterampilan', $found, true) ? ['area' => 'Keterampilan', 'suggestion' => 'Tambahkan bagian keterampilan yang relevan dengan posisi target.', 'priority' => 'sedang'] : null,
                ['area' => 'Penyesuaian', 'suggestion' => "Sesuaikan ringkasan profil dengan posisi {$target}.", 'priority' => 'sedang'],
            ])),
            'skill_relevance' => [
                'matched' => array_slice(array_values($matched), 0, 8),
                'missing' => array_slice(array_values($missing), 0, 8),
                'note' => 'Daftar ini hanya pencocokan kata, bukan pemahaman makna.',
            ],
            'bullet_rewrites' => $rewrites,
            'questions_for_user' => ['Apa hasil paling konkret dari pengalaman terpentingmu?'],
        ];
    }

    private function interviewQuestions(array $input): array
    {
        $role = (string) ($input['job_position'] ?? 'posisi ini');
        $type = (string) ($input['interview_type'] ?? 'behavioral');
        $count = (int) ($input['count'] ?? 5);
        $bank = [
            'behavioral' => [
                ['Ceritakan tentang proyek yang paling menantang yang pernah kamu kerjakan.', 'Problem solving', 'Gunakan STAR dan fokus pada peranmu sendiri.'],
                ['Ceritakan saat kamu harus bekerja sama dengan orang yang sulit.', 'Kolaborasi', 'Tunjukkan empati dan langkah konkret yang kamu ambil.'],
                ['Ceritakan saat kamu gagal mencapai target. Apa yang kamu pelajari?', 'Refleksi diri', 'Akui kesalahan, lalu tekankan pembelajarannya.'],
                ['Ceritakan saat kamu mengambil inisiatif tanpa diminta.', 'Inisiatif', 'Jelaskan dampak dari inisiatifmu.'],
                ['Bagaimana kamu mengatur prioritas saat tenggat waktu bertabrakan?', 'Manajemen waktu', 'Beri contoh situasi nyata.'],
                ['Ceritakan saat kamu harus mempelajari hal baru dengan cepat.', 'Kemampuan belajar', 'Sebutkan cara belajar dan hasilnya.'],
            ],
            'hr' => [
                ["Mengapa kamu tertarik dengan posisi {$role}?", 'Motivasi', 'Hubungkan minatmu dengan kebutuhan peran.'],
                ['Ceritakan tentang dirimu secara singkat.', 'Komunikasi', 'Gunakan alur masa lalu–sekarang–masa depan dalam 1–2 menit.'],
                ['Apa kelebihan dan kekurangan terbesarmu?', 'Kesadaran diri', 'Sertakan contoh dan upaya perbaikan.'],
                ['Di mana kamu melihat dirimu 3 tahun lagi?', 'Orientasi karier', 'Tunjukkan rencana yang realistis.'],
                ['Apa yang kamu ketahui tentang perusahaan kami?', 'Riset', 'Sebutkan hal spesifik yang kamu pelajari.'],
                ['Bagaimana ekspektasimu terhadap lingkungan kerja?', 'Kecocokan budaya', 'Jujur namun fleksibel.'],
            ],
            'technical' => [
                ["Keterampilan apa yang paling penting untuk posisi {$role}, dan bagaimana kamu menguasainya?", 'Kompetensi inti', 'Beri bukti dari proyek/pengalaman.'],
                ['Jelaskan satu proyek yang menunjukkan kemampuan teknismu.', 'Pengalaman teknis', 'Jelaskan masalah, pendekatan, dan hasil.'],
                ['Tools apa yang biasa kamu gunakan dan mengapa?', 'Penguasaan tools', 'Sebutkan hanya tools yang benar-benar kamu kuasai.'],
                ['Bagaimana kamu memastikan kualitas hasil kerjamu?', 'Kualitas kerja', 'Sebutkan proses pengecekan yang kamu lakukan.'],
                ['Bagaimana pendekatanmu menghadapi masalah yang belum pernah kamu temui?', 'Problem solving', 'Ceritakan langkah sistematis.'],
                ['Bagaimana kamu mengikuti perkembangan di bidang ini?', 'Pembelajaran berkelanjutan', 'Sebutkan sumber belajar konkret.'],
            ],
        ];
        $list = array_slice($bank[$type] ?? $bank['behavioral'], 0, max(1, min(6, $count)));
        return ['questions' => array_map(fn ($q) => ['question' => $q[0], 'focus' => $q[1], 'tip' => '[Simulasi] ' . $q[2]], $list)];
    }

    private function interviewFeedback(array $input): array
    {
        $a = mb_strtolower((string) ($input['answer'] ?? ''));
        $has = fn (string $re) => (bool) preg_match($re, $a);
        $s = $has('/\b(saat|ketika|waktu itu|pada saat|di tempat|semester|tahun)\b/u');
        $t = $has('/\b(tugas|tanggung jawab|target|tujuan|diminta|bertugas)\b/u');
        $ac = $has('/\b(saya (melakukan|membuat|mengajak|menyusun|memimpin|menganalisis|menghubungi|memutuskan)|langkah|cara saya)\b/u');
        $r = $has('/\b(hasil|berhasil|sehingga|akhirnya|meningkat|menurun|dampak)\b|\d+\s?%/u');
        $count = (int) $s + (int) $t + (int) $ac + (int) $r;
        $words = str_word_count($a);
        return [
            'rating' => $count >= 4 && $words >= 60 ? 'kuat' : ($count >= 2 ? 'cukup' : 'perlu_diperbaiki'),
            'summary' => "[Simulasi] Penilaian berbasis kata kunci sederhana, bukan analisis AI. Terdeteksi {$count} dari 4 elemen STAR.",
            'star' => [
                'situation' => ['present' => $s, 'comment' => $s ? 'Konteks situasi terlihat.' : 'Tambahkan konteks: kapan dan di mana kejadiannya.'],
                'task' => ['present' => $t, 'comment' => $t ? 'Tugas/tanggung jawab disebutkan.' : 'Jelaskan apa tugas atau targetmu.'],
                'action' => ['present' => $ac, 'comment' => $ac ? 'Ada langkah yang kamu lakukan.' : 'Uraikan langkah konkret yang KAMU lakukan.'],
                'result' => ['present' => $r, 'comment' => $r ? 'Hasil disebutkan.' : 'Tutup dengan hasil atau pembelajaran yang nyata.'],
            ],
            'strengths' => $words >= 60 ? ['Jawaban cukup lengkap dari sisi panjang.'] : ['Jawaban sudah langsung ke inti.'],
            'improvements' => $words < 60 ? ['Kembangkan jawaban menjadi 1–2 menit bicara (sekitar 120–200 kata).'] : ['Pastikan setiap bagian STAR tersampaikan secara berurutan.'],
            'improved_outline' => "Situasi: [konteks singkat]\nTugas: [tanggung jawabmu]\nAksi: [2–3 langkah konkret yang kamu lakukan]\nHasil: [dampak atau pembelajaran yang nyata]",
        ];
    }
}
