<?php

declare(strict_types=1);

namespace App\Domain;

/**
 * Labels and career-area definitions used by the rule-based reflection report.
 * Weights express how strongly each reflected dimension relates to an area (editorial, not empirical).
 */
final class CareerCatalog
{
    public const INTEREST_LABELS = [
        'int_realistic' => ['Praktis & Teknis', 'Menikmati pekerjaan konkret: alat, sistem, atau hasil yang nyata.'],
        'int_investigative' => ['Analitis & Investigatif', 'Menikmati menganalisis, meneliti, dan memecahkan masalah.'],
        'int_artistic' => ['Kreatif & Ekspresif', 'Menikmati menciptakan ide, karya, dan cara baru.'],
        'int_social' => ['Sosial & Membantu', 'Menikmati membantu, mengajar, dan mendampingi orang.'],
        'int_enterprising' => ['Memimpin & Menggerakkan', 'Menikmati memengaruhi orang dan mengejar peluang.'],
        'int_conventional' => ['Terstruktur & Teliti', 'Menikmati keteraturan, data, dan proses yang rapi.'],
    ];

    public const SKILL_LABELS = [
        'sk_analytical' => ['Berpikir analitis', 'Kamu merasa mampu mengolah informasi dan menarik kesimpulan yang logis.'],
        'sk_communication' => ['Komunikasi', 'Kamu merasa mampu menyampaikan ide dengan jelas kepada orang lain.'],
        'sk_creativity' => ['Kreativitas', 'Kamu merasa mudah menemukan pendekatan yang segar dan tidak biasa.'],
        'sk_organization' => ['Organisasi & manajemen waktu', 'Kamu merasa terbiasa mengatur prioritas dan detail pekerjaan.'],
        'sk_digital' => ['Literasi digital', 'Kamu merasa cepat beradaptasi dengan tools dan teknologi baru.'],
        'sk_leadership' => ['Inisiatif & kepemimpinan', 'Kamu merasa nyaman mengambil peran dan mengoordinasikan orang.'],
        'sk_empathy' => ['Empati', 'Kamu merasa peka terhadap perasaan dan kebutuhan orang lain.'],
        'sk_numeracy' => ['Kemampuan numerik', 'Kamu merasa nyaman bekerja dengan angka dan perhitungan.'],
    ];

    public const ENV_LABELS = [
        'env_structure' => ['Struktur yang jelas', 'Kamu cenderung bekerja lebih baik dengan prosedur dan target yang jelas.'],
        'env_flexibility' => ['Fleksibilitas', 'Kamu cenderung menyukai ruang untuk bereksperimen dan cara kerja yang luwes.'],
        'env_team' => ['Kolaborasi tim', 'Kamu cenderung lebih bersemangat ketika bekerja bersama tim.'],
        'env_independent' => ['Otonomi', 'Kamu cenderung bekerja paling baik ketika diberi kepercayaan untuk mandiri.'],
        'env_fastpace' => ['Ritme dinamis', 'Kamu cenderung menikmati lingkungan yang bergerak cepat.'],
        'env_people_facing' => ['Interaksi dengan orang', 'Kamu cenderung ingin banyak berhubungan langsung dengan orang.'],
    ];

    public const VALUE_LABELS = [
        'val_stability' => 'Stabilitas & keamanan kerja',
        'val_impact' => 'Dampak bagi orang lain',
        'val_growth' => 'Belajar & berkembang',
        'val_autonomy' => 'Kebebasan & otonomi',
        'val_income' => 'Penghasilan & peluang finansial',
        'val_balance' => 'Keseimbangan hidup',
        'val_recognition' => 'Pengakuan & pencapaian',
    ];

    /** @return list<array<string, mixed>> */
    public static function areas(): array
    {
        return [
            [
                'id' => 'people_psychology',
                'name' => 'People & Psychology',
                'description' => 'Bidang yang berfokus pada manusia di dunia kerja: rekrutmen, pengembangan, dan pengalaman karyawan.',
                'weights' => ['int_social' => 3, 'sk_empathy' => 2, 'sk_communication' => 2, 'env_people_facing' => 1, 'val_impact' => 1],
                'roles' => ['HR Generalist', 'Talent Acquisition / Recruiter', 'People Development / L&D', 'Employee Experience Specialist'],
                'skills' => ['Wawancara berbasis kompetensi', 'Dasar psikologi industri & organisasi', 'Fasilitasi dan komunikasi interpersonal'],
            ],
            [
                'id' => 'technology_data',
                'name' => 'Technology & Data',
                'description' => 'Bidang yang mengolah data dan teknologi untuk membantu organisasi mengambil keputusan.',
                'weights' => ['int_investigative' => 2, 'sk_analytical' => 2, 'sk_digital' => 2, 'sk_numeracy' => 2, 'int_conventional' => 1],
                'roles' => ['Data Analyst', 'People Analytics Analyst', 'Business Intelligence Analyst', 'QA / Software Tester'],
                'skills' => ['SQL dan spreadsheet tingkat lanjut', 'Statistik dasar', 'Visualisasi data (mis. Looker Studio, Power BI)'],
            ],
            [
                'id' => 'creative_communication',
                'name' => 'Creative & Communication',
                'description' => 'Bidang yang mengubah ide menjadi pesan, konten, atau pengalaman yang bermakna.',
                'weights' => ['int_artistic' => 3, 'sk_creativity' => 2, 'sk_communication' => 2, 'env_flexibility' => 1],
                'roles' => ['Content Strategist', 'Copywriter / UX Writer', 'UI/UX Designer', 'Brand & Marketing Communication'],
                'skills' => ['Membangun portofolio karya', 'Prinsip desain dan UX writing', 'Storytelling berbasis data audiens'],
            ],
            [
                'id' => 'business_management',
                'name' => 'Business & Management',
                'description' => 'Bidang yang menggerakkan tim dan ide bisnis menuju hasil yang terukur.',
                'weights' => ['int_enterprising' => 3, 'sk_leadership' => 2, 'sk_organization' => 1, 'sk_communication' => 1, 'env_fastpace' => 1, 'val_income' => 1],
                'roles' => ['Business Analyst', 'Associate Product Manager', 'Project Coordinator', 'Business Development'],
                'skills' => ['Analisis kebutuhan bisnis', 'Dasar manajemen proyek', 'Presentasi dan negosiasi'],
            ],
            [
                'id' => 'research_education',
                'name' => 'Research & Education',
                'description' => 'Bidang yang menggabungkan rasa ingin tahu dengan keinginan berbagi pengetahuan.',
                'weights' => ['int_investigative' => 2, 'int_social' => 2, 'sk_analytical' => 1, 'sk_communication' => 1, 'val_growth' => 1, 'val_impact' => 1],
                'roles' => ['Research Assistant', 'UX Researcher', 'Instructional Designer', 'Pengajar / Tutor'],
                'skills' => ['Metodologi penelitian', 'Penulisan ilmiah populer', 'Desain pembelajaran'],
            ],
            [
                'id' => 'operations_finance',
                'name' => 'Operations & Finance',
                'description' => 'Bidang yang menjaga organisasi berjalan rapi, efisien, dan akuntabel.',
                'weights' => ['int_conventional' => 3, 'sk_organization' => 2, 'sk_numeracy' => 2, 'env_structure' => 1, 'val_stability' => 1],
                'roles' => ['Operations Officer', 'Finance / Accounting Staff', 'Supply Chain Analyst', 'Quality & Compliance Officer'],
                'skills' => ['Spreadsheet dan pelaporan', 'Dasar akuntansi dan keuangan', 'Perbaikan proses (process improvement)'],
            ],
            [
                'id' => 'engineering_technical',
                'name' => 'Engineering & Technical',
                'description' => 'Bidang yang dekat dengan sistem, perangkat, dan pemecahan masalah teknis secara langsung.',
                'weights' => ['int_realistic' => 3, 'sk_analytical' => 1, 'sk_digital' => 1, 'sk_numeracy' => 1, 'env_structure' => 1],
                'roles' => ['IT Support / Network Engineer', 'Technical Support Specialist', 'Production / Field Engineer', 'Quality Control'],
                'skills' => ['Troubleshooting sistematis', 'Sertifikasi teknis sesuai bidang', 'Keselamatan & standar kerja (K3)'],
            ],
        ];
    }
}
