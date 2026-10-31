<?php

declare(strict_types=1);

namespace App\Domain;

/**
 * Career reflection questionnaire (single source of truth, served to the frontend).
 *
 * IMPORTANT: this is a self-reflection exercise loosely inspired by common career-development
 * frameworks (e.g. interest areas, work values). It is NOT a validated psychometric test and
 * must never be presented as a diagnosis or as a definitive answer about someone's future.
 */
final class ReflectionQuestions
{
    public const VERSION = '2026.10';

    public const LIKERT = [
        ['value' => 1, 'label' => 'Sangat tidak sesuai'],
        ['value' => 2, 'label' => 'Tidak sesuai'],
        ['value' => 3, 'label' => 'Netral'],
        ['value' => 4, 'label' => 'Sesuai'],
        ['value' => 5, 'label' => 'Sangat sesuai'],
    ];

    public const GOAL_FOCUS = [
        'first_job' => 'Mendapatkan pekerjaan pertama',
        'internship' => 'Mendapatkan magang',
        'switch' => 'Pindah ke bidang karier lain',
        'grow' => 'Berkembang di pekerjaan saat ini',
        'study' => 'Melanjutkan studi atau sertifikasi',
        'explore' => 'Masih ingin mengeksplorasi pilihan',
    ];

    /** @return list<array<string, mixed>> */
    public static function categories(): array
    {
        return [
            [
                'id' => 'interests',
                'title' => 'Minat Aktivitas',
                'description' => 'Seberapa sesuai aktivitas berikut dengan hal yang kamu nikmati?',
                'questions' => [
                    self::q('int_realistic_1', 'Memperbaiki, merakit, atau mengoperasikan alat dan perangkat.', 'int_realistic'),
                    self::q('int_investigative_1', 'Menganalisis data atau memecahkan masalah yang rumit.', 'int_investigative'),
                    self::q('int_artistic_1', 'Menciptakan ide, desain, tulisan, atau karya baru.', 'int_artistic'),
                    self::q('int_social_1', 'Membantu, mengajar, atau mendampingi orang lain berkembang.', 'int_social'),
                    self::q('int_enterprising_1', 'Memimpin, meyakinkan, atau menggerakkan orang lain.', 'int_enterprising'),
                    self::q('int_conventional_1', 'Mengatur dan merencanakan pekerjaan secara terstruktur.', 'int_conventional'),
                    self::q('int_realistic_2', 'Bekerja dengan hal-hal konkret yang hasilnya bisa langsung terlihat.', 'int_realistic'),
                    self::q('int_investigative_2', 'Meneliti suatu topik sampai benar-benar paham.', 'int_investigative'),
                    self::q('int_artistic_2', 'Mengekspresikan gagasan dengan cara yang kreatif dan orisinal.', 'int_artistic'),
                    self::q('int_social_2', 'Berinteraksi dan membangun hubungan dengan banyak orang.', 'int_social'),
                    self::q('int_enterprising_2', 'Mengembangkan ide bisnis atau melihat peluang baru.', 'int_enterprising'),
                    self::q('int_conventional_2', 'Mengelola data, dokumen, atau angka dengan rapi dan teliti.', 'int_conventional'),
                ],
            ],
            [
                'id' => 'skills',
                'title' => 'Keterampilan yang Dirasakan',
                'description' => 'Nilailah seberapa kamu merasa mampu — bukan seberapa ingin. Tidak ada jawaban benar atau salah.',
                'questions' => [
                    self::q('sk_analytical', 'Saya mampu mengolah informasi dan menarik kesimpulan yang logis.', 'sk_analytical'),
                    self::q('sk_communication', 'Saya mampu menyampaikan ide dengan jelas, baik lisan maupun tulisan.', 'sk_communication'),
                    self::q('sk_creativity', 'Saya mudah menemukan pendekatan atau solusi yang tidak biasa.', 'sk_creativity'),
                    self::q('sk_organization', 'Saya terbiasa mengatur waktu, prioritas, dan detail pekerjaan.', 'sk_organization'),
                    self::q('sk_digital', 'Saya cepat mempelajari dan menggunakan tools digital atau teknologi baru.', 'sk_digital'),
                    self::q('sk_leadership', 'Saya nyaman mengambil inisiatif dan mengoordinasikan orang lain.', 'sk_leadership'),
                    self::q('sk_empathy', 'Saya peka memahami perasaan dan kebutuhan orang lain.', 'sk_empathy'),
                    self::q('sk_numeracy', 'Saya nyaman bekerja dengan angka, statistik, atau perhitungan.', 'sk_numeracy'),
                ],
            ],
            [
                'id' => 'environment',
                'title' => 'Preferensi Lingkungan Kerja',
                'description' => 'Bayangkan tempat kerja yang membuatmu bisa bekerja paling baik.',
                'questions' => [
                    self::q('env_structure', 'Saya lebih nyaman dengan prosedur dan target yang jelas.', 'env_structure'),
                    self::q('env_flexibility', 'Saya lebih suka pekerjaan yang fleksibel dan memberi ruang bereksperimen.', 'env_flexibility'),
                    self::q('env_team', 'Saya lebih bersemangat bekerja dalam tim dibanding sendirian.', 'env_team'),
                    self::q('env_independent', 'Saya bekerja paling baik ketika diberi otonomi untuk mengerjakan sendiri.', 'env_independent'),
                    self::q('env_fastpace', 'Saya menikmati lingkungan kerja yang dinamis dan serba cepat.', 'env_fastpace'),
                    self::q('env_people_facing', 'Saya ingin pekerjaan yang banyak berhubungan langsung dengan orang (klien, pengguna, rekan).', 'env_people_facing'),
                ],
            ],
            [
                'id' => 'values',
                'title' => 'Nilai dalam Pekerjaan',
                'description' => 'Hal apa yang paling penting bagimu dalam sebuah pekerjaan?',
                'questions' => [
                    self::q('val_stability', 'Kestabilan dan keamanan kerja sangat penting bagi saya.', 'val_stability'),
                    self::q('val_impact', 'Saya ingin pekerjaan yang berdampak nyata bagi orang lain atau masyarakat.', 'val_impact'),
                    self::q('val_growth', 'Kesempatan belajar dan berkembang lebih penting daripada posisi saat ini.', 'val_growth'),
                    self::q('val_autonomy', 'Saya ingin punya kebebasan menentukan cara saya bekerja.', 'val_autonomy'),
                    self::q('val_income', 'Penghasilan dan peluang finansial menjadi pertimbangan utama saya.', 'val_income'),
                    self::q('val_balance', 'Keseimbangan antara pekerjaan dan kehidupan pribadi sangat penting bagi saya.', 'val_balance'),
                    self::q('val_recognition', 'Saya termotivasi oleh pengakuan dan pencapaian yang terlihat.', 'val_recognition'),
                ],
            ],
            [
                'id' => 'goals',
                'title' => 'Tujuan Karier',
                'description' => 'Bagian terakhir: di mana posisimu sekarang dan ke mana kamu ingin melangkah.',
                'questions' => [
                    self::q('goal_clarity', 'Saya sudah punya gambaran jelas tentang bidang karier yang ingin saya tekuni.', 'goal_clarity'),
                    self::q('goal_readiness', 'Saya merasa siap menghadapi proses rekrutmen (CV, tes, wawancara).', 'goal_readiness'),
                    self::q('goal_experience', 'Saya sudah punya pengalaman (magang, organisasi, proyek) yang relevan dengan karier yang saya inginkan.', 'goal_experience'),
                    [
                        'id' => 'goal_focus',
                        'type' => 'choice',
                        'text' => 'Apa fokus utamamu dalam 6–12 bulan ke depan?',
                        'required' => true,
                        'options' => array_map(
                            fn ($k, $v) => ['value' => $k, 'label' => $v],
                            array_keys(self::GOAL_FOCUS),
                            array_values(self::GOAL_FOCUS),
                        ),
                    ],
                    [
                        'id' => 'goal_text',
                        'type' => 'text',
                        'text' => 'Ceritakan singkat tujuan atau karier yang sedang kamu pertimbangkan (opsional).',
                        'required' => false,
                        'max_length' => 300,
                        'placeholder' => 'Contoh: Saya tertarik ke HR atau people analytics, tapi belum yakin mulai dari mana.',
                    ],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function payload(): array
    {
        return [
            'version' => self::VERSION,
            'likert' => self::LIKERT,
            'categories' => self::categories(),
            'disclaimer' => 'Refleksi ini adalah alat bantu eksplorasi diri, bukan tes psikologi tervalidasi atau diagnosis profesional.',
        ];
    }

    /** @return array<string, array<string, mixed>> question id => question */
    public static function index(): array
    {
        $out = [];
        foreach (self::categories() as $cat) {
            foreach ($cat['questions'] as $q) {
                $out[$q['id']] = $q + ['category' => $cat['id']];
            }
        }
        return $out;
    }

    private static function q(string $id, string $text, string $dimension): array
    {
        return ['id' => $id, 'type' => 'likert', 'text' => $text, 'dimension' => $dimension, 'required' => true];
    }
}
