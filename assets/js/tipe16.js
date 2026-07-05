// Tes 16 Tipe Kepribadian (kerangka dikotomi Jung: E/I, S/N, T/F, J/P).
// 28 pertanyaan Likert 1-5, 7 item per dikotomi.
// Skor pct per dimensi = kecenderungan ke kutub pertama (E, S, T, J);
// reverse: true berarti item mengukur kutub kedua (I, N, F, P).
(function () {
  const T16_QUESTIONS = [
    // EI — Sumber Energi
    { dim: "EI", reverse: false, text: "Saya merasa segar setelah menghabiskan waktu bersama banyak orang." },
    { dim: "EI", reverse: true,  text: "Saya butuh waktu sendiri untuk memulihkan energi setelah bersosialisasi." },
    { dim: "EI", reverse: false, text: "Saya cenderung berpikir sambil berbicara." },
    { dim: "EI", reverse: true,  text: "Saya lebih suka mendengarkan daripada menjadi pusat pembicaraan." },
    { dim: "EI", reverse: false, text: "Saya mudah berkenalan dengan orang asing di tempat baru." },
    { dim: "EI", reverse: true,  text: "Kelompok kecil yang akrab lebih nyaman bagi saya daripada pesta besar." },
    { dim: "EI", reverse: false, text: "Saya sering menjadi orang yang memulai rencana kumpul-kumpul." },
    // SN — Cara Menyerap Informasi
    { dim: "SN", reverse: false, text: "Saya lebih percaya pada fakta dan pengalaman nyata daripada teori." },
    { dim: "SN", reverse: true,  text: "Saya lebih tertarik pada kemungkinan masa depan daripada kenyataan saat ini." },
    { dim: "SN", reverse: false, text: "Saya memperhatikan detail praktis yang sering dilewatkan orang lain." },
    { dim: "SN", reverse: true,  text: "Saya senang membayangkan konsep dan makna di balik sesuatu." },
    { dim: "SN", reverse: false, text: "Petunjuk langkah demi langkah membuat saya bekerja lebih baik." },
    { dim: "SN", reverse: true,  text: "Saya sering melamunkan ide-ide yang belum tentu praktis." },
    { dim: "SN", reverse: false, text: "Saya menilai sesuatu dari apa yang terbukti berhasil." },
    // TF — Cara Mengambil Keputusan
    { dim: "TF", reverse: false, text: "Saat mengambil keputusan, logika lebih penting bagi saya daripada perasaan." },
    { dim: "TF", reverse: true,  text: "Saya mempertimbangkan dampak keputusan pada perasaan orang lain terlebih dahulu." },
    { dim: "TF", reverse: false, text: "Saya lebih memilih jujur apa adanya daripada menjaga perasaan." },
    { dim: "TF", reverse: true,  text: "Kritik yang tajam mudah melukai hati saya." },
    { dim: "TF", reverse: false, text: "Perdebatan argumen terasa menstimulasi, bukan menegangkan." },
    { dim: "TF", reverse: true,  text: "Keharmonisan kelompok lebih penting daripada memenangkan argumen." },
    { dim: "TF", reverse: false, text: "Saya menilai ide dari konsistensi logisnya, bukan popularitasnya." },
    // JP — Gaya Menjalani Hidup
    { dim: "JP", reverse: false, text: "Saya merasa tenang ketika semuanya sudah terjadwal dan terencana." },
    { dim: "JP", reverse: true,  text: "Saya suka membiarkan pilihan tetap terbuka selama mungkin." },
    { dim: "JP", reverse: false, text: "Saya menyelesaikan tugas jauh sebelum tenggat." },
    { dim: "JP", reverse: true,  text: "Tekanan menjelang tenggat justru memunculkan performa terbaik saya." },
    { dim: "JP", reverse: false, text: "Daftar tugas yang tercentang memberi saya kepuasan tersendiri." },
    { dim: "JP", reverse: true,  text: "Rencana yang berubah mendadak terasa seperti petualangan yang menyenangkan." },
    { dim: "JP", reverse: false, text: "Saya lebih suka memutuskan segera daripada menggantung." },
  ];

  const T16_LIKERT = [
    { value: 1, label: "Sangat tidak sesuai" },
    { value: 2, label: "Tidak sesuai" },
    { value: 3, label: "Netral" },
    { value: 4, label: "Sesuai" },
    { value: 5, label: "Sangat sesuai" },
  ];

  // pct = kecenderungan ke kutub pertama (huruf kiri).
  const T16_DIMS = {
    EI: { name: "Kecenderungan Ekstraversi", en: "E–I", first: "E", second: "I" },
    SN: { name: "Kecenderungan Penginderaan", en: "S–N", first: "S", second: "N" },
    TF: { name: "Kecenderungan Logika", en: "T–F", first: "T", second: "F" },
    JP: { name: "Kecenderungan Keteraturan", en: "J–P", first: "J", second: "P" },
  };

  const T16_DIM_BANDS = {
    EI: {
      high: "Kamu jelas seorang ekstrover (E) — energi datang dari interaksi, dan kamu berpikir paling jernih sambil berbicara dengan orang lain.",
      med: "Kamu ambivert — bisa menikmati keramaian maupun kesendirian; huruf E/I-mu bisa bergeser tergantung konteks.",
      low: "Kamu jelas seorang introver (I) — energi datang dari ruang tenang, dan kamu berpikir mendalam sebelum berbicara.",
    },
    SN: {
      high: "Kamu bertipe penginderaan (S) — realistis, praktis, dan berpijak pada fakta serta pengalaman nyata.",
      med: "Kamu menyeimbangkan fakta dan imajinasi — praktis saat dibutuhkan, terbuka pada kemungkinan saat ada ruang.",
      low: "Kamu bertipe intuisi (N) — digerakkan gambaran besar, pola, dan kemungkinan yang belum terlihat orang lain.",
    },
    TF: {
      high: "Kamu pengambil keputusan berbasis logika (T) — objektif, analitis, dan berorientasi pada konsistensi.",
      med: "Kamu menimbang logika dan perasaan secara seimbang — kepala dan hati sama-sama diajak bicara.",
      low: "Kamu pengambil keputusan berbasis rasa (F) — empati dan nilai-nilai pribadi memandu pilihanmu.",
    },
    JP: {
      high: "Kamu bertipe terencana (J) — menyukai struktur, kepastian, dan kepuasan menuntaskan sesuatu.",
      med: "Kamu cukup luwes — bisa terstruktur saat penting, spontan saat memungkinkan.",
      low: "Kamu bertipe fleksibel (P) — spontan, adaptif, dan menyukai pilihan yang tetap terbuka.",
    },
  };

  function t16Scores(answers) {
    const sums = { EI: 0, SN: 0, TF: 0, JP: 0 };
    const counts = { EI: 0, SN: 0, TF: 0, JP: 0 };
    T16_QUESTIONS.forEach(function (q, i) {
      let v = answers[i];
      if (v == null) return;
      if (q.reverse) v = 6 - v;
      sums[q.dim] += v;
      counts[q.dim] += 1;
    });
    const scores = {};
    for (const dim of Object.keys(sums)) {
      const avg = counts[dim] ? sums[dim] / counts[dim] : 3;
      scores[dim] = Math.round(((avg - 1) / 4) * 100);
    }
    return scores;
  }

  function t16Type(scores) {
    return (scores.EI >= 50 ? "E" : "I") + (scores.SN >= 50 ? "S" : "N") +
           (scores.TF >= 50 ? "T" : "F") + (scores.JP >= 50 ? "J" : "P");
  }

  // Nama & deskripsi 16 tipe.
  const T16_TYPES = {
    INTJ: { name: "Sang Perancang", tagline: "Pemikir strategis dengan rencana untuk segalanya.",
      desc: "Kamu melihat dunia sebagai sistem yang bisa dipahami dan diperbaiki. Mandiri, visioner, dan menuntut standar tinggi — kamu bekerja diam-diam menuju tujuan jangka panjang yang sudah kamu petakan jauh hari." },
    INTP: { name: "Sang Pemikir", tagline: "Penjelajah ide yang haus akan logika dan kemungkinan.",
      desc: "Rasa ingin tahumu nyaris tak berbatas. Kamu membongkar konsep hingga ke akarnya, menikmati paradoks, dan lebih peduli pada kebenaran ide daripada penerimaan sosial." },
    ENTJ: { name: "Sang Komandan", tagline: "Pemimpin tegas yang mengubah visi menjadi eksekusi.",
      desc: "Kamu lahir untuk mengorganisir — orang, sumber daya, dan strategi. Ketegasan dan kejelasan arahmu membuat orang lain mengikuti, meski kadang kamu perlu memperlambat langkah untuk mereka." },
    ENTP: { name: "Sang Penantang", tagline: "Pendebat cerdas yang menguji setiap asumsi.",
      desc: "Bagimu, ide adalah arena bermain. Kamu cepat melihat celah argumen, senang memantik diskusi, dan paling hidup saat menghadapi masalah yang belum pernah dipecahkan orang." },
    INFJ: { name: "Sang Penasihat", tagline: "Idealis tenang dengan intuisi yang dalam tentang manusia.",
      desc: "Kamu memahami orang lebih dalam dari yang mereka sadari. Perpaduan visi dan empati membuatmu langka: kamu memperjuangkan makna, bukan sekadar hasil." },
    INFP: { name: "Sang Mediator", tagline: "Pemimpi puitis yang digerakkan oleh nilai-nilai luhur.",
      desc: "Dunia batinmu kaya dan penuh idealisme. Kamu setia pada nilai-nilaimu, peka terhadap keindahan dan penderitaan, dan ingin hidupmu berarti bagi sesuatu yang lebih besar." },
    ENFJ: { name: "Sang Pembimbing", tagline: "Penggerak hati yang menumbuhkan orang di sekitarnya.",
      desc: "Kamu punya bakat langka melihat potensi orang dan membuat mereka mempercayainya. Karismamu bukan untuk panggung — melainkan untuk mengangkat orang lain." },
    ENFP: { name: "Sang Penyemangat", tagline: "Jiwa bebas yang menularkan antusiasme ke mana pun pergi.",
      desc: "Energi, imajinasi, dan kehangatanmu membuat orang betah. Kamu melihat kemungkinan dalam segala hal — tantanganmu hanyalah memilih satu dan menuntaskannya." },
    ISTJ: { name: "Sang Pengawal", tagline: "Penjaga tanggung jawab yang tak pernah ingkar.",
      desc: "Kata-katamu adalah jaminan. Teliti, logis, dan berdedikasi, kamu adalah fondasi yang membuat keluarga, tim, dan institusi tetap berdiri." },
    ISFJ: { name: "Sang Pelindung", tagline: "Pengayom hangat yang bekerja tanpa banyak suara.",
      desc: "Kamu merawat orang-orangmu dengan ketekunan yang jarang disadari — mengingat detail kecil, menjaga tradisi, dan selalu hadir saat dibutuhkan." },
    ESTJ: { name: "Sang Pengelola", tagline: "Organisator andal yang membuat segalanya berjalan.",
      desc: "Kamu percaya pada tatanan, kerja keras, dan hasil nyata. Saat orang lain berdiskusi, kamu sudah menyusun langkah — dan memastikan semuanya selesai tepat waktu." },
    ESFJ: { name: "Sang Perangkul", tagline: "Perekat sosial yang membuat semua orang merasa dilihat.",
      desc: "Kamu peka terhadap kebutuhan orang di sekitarmu dan bergerak cepat memenuhinya. Harmoni bukan basa-basi bagimu — itu adalah karya yang kamu rawat setiap hari." },
    ISTP: { name: "Sang Perajin", tagline: "Pemecah masalah tenang yang belajar lewat tangan.",
      desc: "Kamu paling hidup saat membongkar cara kerja sesuatu — mesin, sistem, atau situasi. Tenang di tengah krisis, kamu bertindak efisien tanpa drama." },
    ISFP: { name: "Sang Seniman", tagline: "Penjelajah rasa yang hidup di momen ini.",
      desc: "Kamu mengekspresikan diri lewat tindakan dan karya, bukan kata-kata besar. Lembut namun teguh pada nilai, kamu menemukan keindahan di tempat yang dilewatkan orang." },
    ESTP: { name: "Sang Dinamo", tagline: "Pengambil aksi yang berpikir paling cepat di lapangan.",
      desc: "Kamu belajar dengan terjun langsung. Energik, taktis, dan berani ambil risiko terukur — saat rencana gagal, justru kamulah yang paling berguna." },
    ESFP: { name: "Sang Penghibur", tagline: "Pusat kehangatan yang membuat hidup terasa pesta.",
      desc: "Ke mana pun kamu pergi, suasana ikut hidup. Spontan, murah hati, dan jeli menikmati momen — kamu mengingatkan orang bahwa hidup untuk dirayakan." },
  };

  // Konten premium per kelompok temperamen.
  function t16Group(type) {
    if (type.indexOf("N") === 1 && type.indexOf("T") === 2) return "NT";
    if (type.indexOf("N") === 1) return "NF";
    if (type.indexOf("J") === 3) return "SJ";
    return "SP";
  }

  const T16_PREMIUM = {
    NT: {
      strengths: ["Pemikiran strategis dan analitis yang tajam", "Standar intelektual tinggi", "Mandiri dan visioner", "Cepat memahami sistem yang kompleks"],
      weaknesses: ["Bisa terkesan dingin atau terlalu kritis", "Tidak sabar pada inefisiensi dan basa-basi", "Cenderung meremehkan faktor emosi"],
      careers: ["Strategi & konsultan manajemen", "Insinyur / arsitek perangkat lunak", "Peneliti & ilmuwan", "Founder / product manager"],
      relationship: "Kamu menunjukkan cinta lewat kesetiaan dan solusi, bukan kata-kata manis. Pasangan yang menghargai kemandirianmu dan bisa berdiskusi setara adalah pasangan idealmu. Ingat: perasaan tidak harus 'masuk akal' untuk valid.",
      communication: "Komunikasimu langsung dan berbasis argumen. Latih membungkus kritik dengan konteks dan apresiasi — orang mendengar lebih baik saat merasa dihargai, bukan diuji.",
      workStyle: "Kamu unggul pada pekerjaan yang menuntut analisis mendalam dan otonomi. Micromanagement dan rapat tanpa agenda adalah musuh produktivitasmu.",
      wellbeing: "Kamu hidup banyak di kepala; stres muncul sebagai overthinking. Aktivitas fisik rutin dan tenggat 'berhenti berpikir' membantumu tetap seimbang.",
      tips: ["Validasi perasaan orang sebelum menawarkan solusi", "Rayakan progres, jangan hanya mengejar kesempurnaan", "Jadwalkan interaksi sosial yang bermakna, bukan sekadar fungsional"],
      actionPlan: ["Minggu 1 — Dengarkan satu keluhan tanpa langsung memberi solusi", "Minggu 2 — Beri apresiasi spesifik pada satu orang setiap hari", "Minggu 3 — Selesaikan satu proyek sampai 'cukup baik', bukan sempurna", "Minggu 4 — Evaluasi relasi mana yang perlu kamu hangatkan kembali"],
    },
    NF: {
      strengths: ["Empati dan intuisi tentang manusia", "Idealisme yang menggerakkan", "Komunikasi yang menyentuh dan autentik", "Kemampuan menumbuhkan orang lain"],
      weaknesses: ["Mudah kecewa saat realita tak seindah ideal", "Cenderung mengorbankan diri untuk orang lain", "Sensitif berlebihan terhadap kritik"],
      careers: ["Konselor / psikolog", "Pengajar & pengembangan SDM", "Penulis / kreator konten", "Organisasi sosial & advokasi"],
      relationship: "Kamu mencari kedalaman, bukan kesenangan permukaan. Kamu memberi banyak — pastikan kamu juga menerima. Pasangan yang menghargai dunia batinmu akan mendapatkan kesetiaan yang langka.",
      communication: "Kamu berbicara dari hati dan menangkap yang tersirat. Tantanganmu: menyampaikan ketidaksetujuan secara langsung tanpa merasa merusak hubungan.",
      workStyle: "Kamu butuh pekerjaan yang selaras dengan nilai-nilaimu. Gaji besar tanpa makna akan menggerogotimu; misi yang kamu percayai melipatgandakan energimu.",
      wellbeing: "Kamu menyerap emosi lingkungan. Batasi paparan konflik dan berita negatif, dan miliki ruang aman untuk mengisi ulang idealismemu.",
      tips: ["Tetapkan batas sebelum kelelahan, bukan sesudahnya", "Terjemahkan ideal besar menjadi satu langkah kecil hari ini", "Terima bahwa kritik pada karyamu bukan kritik pada dirimu"],
      actionPlan: ["Minggu 1 — Katakan 'tidak' pada satu permintaan yang menguras energi", "Minggu 2 — Wujudkan satu ide idealismu dalam aksi kecil nyata", "Minggu 3 — Minta masukan dan latih menerimanya dengan tenang", "Minggu 4 — Refleksikan: apa yang membuatmu merasa paling bermakna bulan ini?"],
    },
    SJ: {
      strengths: ["Andal, konsisten, dan bertanggung jawab", "Terorganisir dan teliti", "Setia pada komitmen dan orang", "Menjaga stabilitas di tengah perubahan"],
      weaknesses: ["Kurang nyaman dengan perubahan mendadak", "Bisa kaku pada aturan dan kebiasaan", "Cenderung memendam kebutuhan sendiri demi kewajiban"],
      careers: ["Manajemen operasional & administrasi", "Keuangan, audit, dan hukum", "Kesehatan & pendidikan", "Layanan publik"],
      relationship: "Kamu menunjukkan cinta lewat kehadiran yang konsisten dan tindakan nyata. Pasanganmu selalu tahu posisimu — sebuah rasa aman yang langka. Sesekali, kejutkan mereka: spontanitas kecil menghidupkan hubungan.",
      communication: "Komunikasimu jelas dan dapat dipegang. Latih menyampaikan perasaan, bukan hanya informasi — orang terdekatmu ingin tahu isi hatimu, bukan sekadar jadwalmu.",
      workStyle: "Kamu unggul dalam struktur yang jelas: peran, prosedur, dan tenggat. Kamu adalah tulang punggung tim — pastikan kontribusimu terlihat, jangan hanya diam mengerjakan.",
      wellbeing: "Stresmu datang dari perubahan di luar kendali dan beban tanggung jawab. Latih melepaskan yang bukan tugasmu, dan jadwalkan istirahat seserius kamu menjadwalkan kerja.",
      tips: ["Coba satu hal baru kecil setiap minggu untuk melenturkan adaptasi", "Delegasikan — dunia tidak runtuh tanpa kontrolmu", "Suarakan kebutuhanmu; orang tak bisa menebak isi kepalamu"],
      actionPlan: ["Minggu 1 — Ubah satu rutinitas kecil dan amati bahwa semuanya baik-baik saja", "Minggu 2 — Delegasikan satu tanggung jawab sepenuhnya", "Minggu 3 — Sampaikan satu kebutuhan pribadimu pada orang terdekat", "Minggu 4 — Jadwalkan satu hari tanpa agenda dan nikmati"],
    },
    SP: {
      strengths: ["Adaptif dan tangkas dalam situasi berubah", "Praktis dan berorientasi aksi", "Tenang menghadapi krisis", "Menikmati momen dan menularkannya"],
      weaknesses: ["Mudah bosan pada rutinitas dan perencanaan panjang", "Cenderung menunda hal administratif", "Bisa impulsif dalam keputusan besar"],
      careers: ["Wirausaha & sales", "Kreatif: desain, seni, produksi", "Teknik lapangan & layanan darurat", "Olahraga, kuliner, pariwisata"],
      relationship: "Kamu membawa keseruan dan kehadiran penuh di momen bersama. Tantanganmu adalah komitmen jangka panjang yang terasa mengikat — pasangan yang memberi ruang gerak akan mendapatkan sisi terbaikmu.",
      communication: "Gaya komunikasimu hidup dan langsung. Latih mendengarkan sampai selesai untuk topik yang serius — tidak semua percakapan butuh solusi cepat atau candaan.",
      workStyle: "Kamu paling produktif dengan variasi, kebebasan bergerak, dan hasil yang terlihat cepat. Pekerjaan meja dengan rutinitas panjang menguras semangatmu.",
      wellbeing: "Kamu mengatasi stres dengan aksi dan hiburan — waspadai pelarian berlebihan. Sesekali duduklah dengan perasaanmu alih-alih mengalihkannya.",
      tips: ["Pasang sistem otomatis untuk hal rutin (tagihan, tabungan)", "Sebelum keputusan besar, beri jeda 24 jam", "Tuntaskan satu proyek lama sebelum memulai yang baru"],
      actionPlan: ["Minggu 1 — Otomatiskan satu urusan rutin yang sering tertunda", "Minggu 2 — Selesaikan satu urusan lama yang menggantung", "Minggu 3 — Praktikkan jeda 24 jam pada satu keputusan impulsif", "Minggu 4 — Refleksikan momen paling hidup bulan ini dan cara memperbanyaknya"],
    },
  };

  window.TESTS = window.TESTS || {};
  window.TESTS["tipe16"] = {
    id: "tipe16",
    title: "Tes 16 Tipe Kepribadian",
    short: "16 Tipe",
    tagline: "Temukan empat huruf yang menggambarkan caramu memandang dunia.",
    productName: "Laporan Premium 16 Tipe",
    price: 49000,
    priceStrike: 99000,
    greeting: "Pilih yang paling menggambarkan dirimu sehari-hari — bukan dirimu di hari terbaik.",
    questions: T16_QUESTIONS,
    likert: T16_LIKERT,
    computeScores: t16Scores,
    getResult: function (scores) {
      const type = t16Type(scores);
      const info = T16_TYPES[type];
      const order = ["EI", "SN", "TF", "JP"];

      const dimensionInsights = order.map(function (d) {
        const band = window.psiBand(scores[d]);
        return {
          name: T16_DIMS[d].name, en: T16_DIMS[d].en, pct: scores[d],
          band: band.label, text: T16_DIM_BANDS[d][band.key],
        };
      });

      // Preferensi paling kuat = jarak terjauh dari titik tengah 50.
      let strongest = order[0], strongestGap = -1;
      order.forEach(function (d) {
        const gap = Math.abs(scores[d] - 50);
        if (gap > strongestGap) { strongestGap = gap; strongest = d; }
      });
      const strongLetter = scores[strongest] >= 50 ? T16_DIMS[strongest].first : T16_DIMS[strongest].second;
      const summary =
        "Tipe kepribadianmu adalah " + type + " — " + info.name + ". " +
        "Preferensimu yang paling menonjol adalah huruf " + strongLetter +
        " (" + T16_DIMS[strongest].en + "), yang paling kuat mewarnai caramu berpikir dan bertindak. " +
        "Laporan di bawah menguraikan arti kombinasi keempat hurufmu untuk kerja, relasi, dan pengembangan dirimu.";

      return {
        monogram: type.slice(0, 2),
        name: type + " — " + info.name,
        tagline: info.tagline,
        desc: info.desc,
        summary: summary,
        barsTitle: "Kecenderunganmu pada empat dikotomi",
        bars: order.map(function (d) {
          return { name: T16_DIMS[d].name, en: T16_DIMS[d].en, pct: scores[d] };
        }),
        dimensionInsights: dimensionInsights,
        premium: T16_PREMIUM[t16Group(type)],
      };
    },
  };
})();
