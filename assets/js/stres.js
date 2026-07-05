// Tes Tingkat Stres — adaptasi konsep Perceived Stress Scale (PSS).
// 12 pertanyaan Likert frekuensi 1-5, dua aspek:
//   TKN = Tekanan yang dirasakan (7 item)
//   KDL = Rasa kendali / kemampuan mengatasi (5 item; skor tinggi = lebih terkendali)
// Level stres dihitung dari gabungan: (TKN + (100 - KDL)) / 2.
(function () {
  const STR_QUESTIONS = [
    // TKN — Tekanan yang Dirasakan
    { dim: "TKN", reverse: false, text: "Sebulan terakhir, saya merasa kewalahan oleh banyaknya hal yang harus diurus." },
    { dim: "TKN", reverse: false, text: "Saya sulit benar-benar rileks, bahkan saat punya waktu luang." },
    { dim: "TKN", reverse: false, text: "Saya mudah tersinggung atau marah karena hal-hal kecil." },
    { dim: "TKN", reverse: false, text: "Pikiran tentang pekerjaan atau tugas menghantui saya bahkan saat istirahat." },
    { dim: "TKN", reverse: false, text: "Tidur saya terganggu karena memikirkan banyak hal." },
    { dim: "TKN", reverse: false, text: "Saya merasa tuntutan hidup melebihi kemampuan saya mengatasinya." },
    { dim: "TKN", reverse: false, text: "Saya merasa gugup atau tegang tanpa sebab yang jelas." },
    // KDL — Rasa Kendali
    { dim: "KDL", reverse: false, text: "Saya merasa mampu mengendalikan hal-hal penting dalam hidup saya." },
    { dim: "KDL", reverse: false, text: "Saya yakin bisa menangani masalah pribadi saya dengan baik." },
    { dim: "KDL", reverse: false, text: "Saya merasa keadaan secara umum berjalan sesuai keinginan saya." },
    { dim: "KDL", reverse: false, text: "Saya bisa meredakan kejengkelan dengan cukup mudah." },
    { dim: "KDL", reverse: false, text: "Ketika kesulitan menumpuk, saya tahu langkah apa yang harus diambil." },
  ];

  const STR_LIKERT = [
    { value: 1, label: "Tidak pernah" },
    { value: 2, label: "Jarang" },
    { value: 3, label: "Kadang-kadang" },
    { value: 4, label: "Sering" },
    { value: 5, label: "Sangat sering" },
  ];

  const STR_DIMS = {
    TKN: { name: "Tekanan yang Dirasakan", en: "Perceived Pressure" },
    KDL: { name: "Rasa Kendali", en: "Sense of Control" },
  };

  const STR_DIM_BANDS = {
    TKN: {
      high: "Tekanan yang kamu rasakan sedang tinggi — kewalahan, tegang, dan sulit rileks muncul cukup sering dalam kesehariannmu.",
      med: "Kamu merasakan tekanan dalam kadar sedang — ada hari-hari berat, namun belum mendominasi hidupmu.",
      low: "Tekanan yang kamu rasakan rendah — kesehariannmu relatif tenang dan jarang terasa mencekik.",
    },
    KDL: {
      high: "Rasa kendalimu kuat — kamu yakin mampu menghadapi masalah dan tahu langkah yang harus diambil.",
      med: "Rasa kendalimu cukup baik — umumnya kamu mampu mengatasi, meski sesekali merasa kewalahan.",
      low: "Rasa kendalimu sedang rapuh — masalah terasa lebih besar dari kapasitasmu saat ini. Ini sinyal untuk mencari dukungan, bukan kelemahan.",
    },
  };

  function strScores(answers) {
    const sums = { TKN: 0, KDL: 0 };
    const counts = { TKN: 0, KDL: 0 };
    STR_QUESTIONS.forEach(function (q, i) {
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
    // Level stres: tekanan tinggi & kendali rendah = stres tinggi.
    scores.TOTAL = Math.round((scores.TKN + (100 - scores.KDL)) / 2);
    return scores;
  }

  const STR_LEVELS = [
    {
      min: 65, monogram: "ST", name: "Tingkat Stres Tinggi",
      tagline: "Bebanmu sedang berat — dan kamu tidak harus memikulnya sendirian.",
      desc: "Skormu menunjukkan tekanan yang tinggi dengan ruang pemulihan yang menipis. Ini bukan vonis, melainkan tanda peringatan dini yang berharga: tubuh dan pikiranmu meminta jeda serta dukungan. Catatan penting: hasil ini bersifat edukatif, bukan diagnosis — bila stres terasa berkepanjangan, berbicara dengan psikolog profesional adalah langkah yang bijak.",
      premium: {
        strengths: ["Kesadaran diri untuk memeriksa kondisimu — langkah pertama yang banyak orang lewatkan", "Daya tahan yang sudah teruji oleh beban selama ini", "Kepekaan tinggi terhadap sinyal tubuh dan lingkungan"],
        weaknesses: ["Cadangan energi yang menipis membuat hal kecil terasa besar", "Sulit membedakan prioritas saat semua terasa mendesak", "Kualitas tidur dan pemulihan sedang terganggu"],
        careers: ["Prioritaskan pemulihan sebelum keputusan karier besar", "Diskusikan penyesuaian beban dengan atasan bila memungkinkan", "Hindari menambah komitmen baru bulan ini", "Pertimbangkan dukungan profesional (psikolog/konselor)"],
        relationship: "Saat stres tinggi, orang terdekat sering menerima sisa emosi kita. Beri tahu mereka kondisimu dengan jujur — 'aku sedang penuh, bukan marah padamu' — kalimat sederhana yang menyelamatkan banyak hubungan.",
        communication: "Tunda percakapan penting saat amarah atau lelah memuncak. Gunakan format sederhana: ceritakan fakta, rasakan, butuh — 'Deadline menumpuk, aku kewalahan, aku butuh bantuan untuk X.'",
        workStyle: "Kurangi multitasking — otak yang stres bekerja jauh lebih baik dengan satu fokus. Pecah pekerjaan menjadi potongan 25 menit, dan rayakan tiap potongan yang selesai.",
        wellbeing: "Pemulihan adalah prioritas utamamu sekarang: tidur cukup yang konsisten, gerak tubuh ringan setiap hari, dan satu momen tenang tanpa layar. Bila keluhan berlanjut lebih dari beberapa minggu, jangan ragu mencari bantuan profesional.",
        tips: ["Tulis 3 hal yang paling membebani, lalu tandai mana yang bisa dilepas/ditunda", "Terapkan jam tidur tetap selama 2 minggu ke depan", "Batasi kafein dan doomscrolling menjelang malam", "Ceritakan kondisimu pada satu orang yang kamu percaya"],
        actionPlan: ["Minggu 1 — Tetapkan jam tidur konsisten dan satu jeda 10 menit tanpa layar per hari", "Minggu 2 — Lepas atau tunda satu komitmen yang bisa menunggu", "Minggu 3 — Tambahkan gerak ringan 20 menit (jalan kaki cukup) tiap hari", "Minggu 4 — Evaluasi skala stresmu; bila belum membaik, jadwalkan sesi dengan profesional"],
      },
    },
    {
      min: 40, monogram: "SS", name: "Tingkat Stres Sedang",
      tagline: "Kamu masih memegang kemudi — saatnya memperkuat pertahanan.",
      desc: "Skormu menunjukkan tekanan yang nyata namun masih terkelola. Ini fase yang menentukan: kebiasaan yang kamu bangun sekarang menentukan apakah stresmu menurun atau menumpuk. Hasil ini bersifat edukatif, bukan diagnosis klinis.",
      premium: {
        strengths: ["Masih punya cadangan energi untuk melakukan perubahan", "Mampu mengenali sumber tekanan secara spesifik", "Rasa kendali yang cukup untuk menata ulang prioritas"],
        weaknesses: ["Rentan menormalisasi tekanan hingga tak terasa lagi", "Pemulihan sering dikorbankan saat jadwal padat", "Sinyal awal kelelahan mudah diabaikan"],
        careers: ["Tinjau ulang beban: mana yang memberi energi vs menguras", "Negosiasikan tenggat yang realistis sebelum menyanggupi", "Bangun blok fokus tanpa interupsi di jam produktifmu", "Investasikan waktu pada keterampilan yang mengurangi beban berulang"],
        relationship: "Jangan tunggu 'sempat' untuk hadir bagi orang tersayang — kebersamaan justru penyangga stres terbaik. Jadwalkan momen kecil rutin yang tak bisa diganggu pekerjaan.",
        communication: "Latih mengatakan 'saya cek dulu kapasitas saya' sebelum mengiyakan permintaan baru. Jeda 10 detik itu mencegah komitmen yang kelak menjadi sumber stres.",
        workStyle: "Kamu masih produktif, tapi perhatikan pola: jika akhir pekan selalu jadi pelunas utang tidur, bebanmu sudah melebihi kapasitas berkelanjutan. Sisipkan pemulihan ke dalam ritme mingguan, bukan hanya saat libur.",
        wellbeing: "Perkuat tiga fondasi: tidur teratur, gerak rutin, dan koneksi sosial yang bergizi. Ketiganya adalah imun stresmu — lebih murah dirawat daripada diperbaiki.",
        tips: ["Audit mingguan: apa 2 sumber stres terbesar dan 1 langkah kecil untuk masing-masing", "Lindungi satu malam per minggu sebagai 'malam bebas kerja'", "Batasi notifikasi di luar jam kerja"],
        actionPlan: ["Minggu 1 — Petakan sumber stres terbesar dan pilih satu untuk ditangani", "Minggu 2 — Terapkan satu malam bebas kerja dan lihat efeknya", "Minggu 3 — Bangun ritual pemulihan harian 15 menit (jalan, napas, jurnal)", "Minggu 4 — Tinjau ulang: apakah skala stresmu menurun? Sesuaikan strategi"],
      },
    },
    {
      min: 0, monogram: "SR", name: "Tingkat Stres Rendah",
      tagline: "Fondasimu kokoh — rawat dan bagikan ketenangan itu.",
      desc: "Skormu menunjukkan tekanan yang rendah dan rasa kendali yang sehat. Kamu punya modal berharga: ketenangan. Fase ini adalah waktu terbaik untuk memperkuat kebiasaan baik dan membangun cadangan untuk masa yang lebih menantang. Hasil ini bersifat edukatif, bukan diagnosis klinis.",
      premium: {
        strengths: ["Keseimbangan hidup yang terjaga", "Rasa kendali yang sehat atas keadaan", "Kapasitas mental tersedia untuk bertumbuh", "Bisa menjadi penopang bagi orang sekitar"],
        weaknesses: ["Kenyamanan bisa membuat lengah pada perubahan beban", "Rutinitas pemulihan bisa kendur karena merasa 'aman'", "Kadang kurang berempati pada yang sedang kewalahan"],
        careers: ["Waktu yang tepat mengambil tantangan pertumbuhan baru", "Bangun keterampilan yang selama ini tertunda", "Ambil peran mentoring bagi rekan yang lebih muda", "Rancang sistem kerja yang menjaga keseimbangan ini"],
        relationship: "Ketenanganmu adalah hadiah bagi orang sekitar — jadilah ruang aman bagi mereka yang sedang berat, tanpa buru-buru memberi solusi. Kehadiranmu yang stabil sudah menolong.",
        communication: "Gunakan kapasitasmu yang lega untuk mendengarkan lebih dalam. Orang yang sedang stres tidak butuh nasihat cepat — mereka butuh didengar sampai selesai.",
        workStyle: "Dengan beban yang terkendali, ini momentum untuk kerja bermakna: proyek yang menantang, belajar hal baru, atau memperbaiki sistem yang selama ini ditambal. Pertumbuhan terbaik terjadi dari fondasi yang tenang.",
        wellbeing: "Jangan menunggu stres datang untuk merawat diri. Kebiasaan yang kamu jaga sekarang — tidur, gerak, koneksi — adalah asuransi untuk fase hidup yang lebih berat nanti.",
        tips: ["Pertahankan ritual pemulihan meski merasa baik-baik saja", "Tulis 'resep ketenanganmu' — apa yang selama ini berhasil — untuk dipakai saat masa sulit", "Cek kondisi orang terdekat yang mungkin sedang kewalahan"],
        actionPlan: ["Minggu 1 — Dokumentasikan kebiasaan yang membuat hidupmu seimbang", "Minggu 2 — Ambil satu tantangan pertumbuhan yang bermakna", "Minggu 3 — Jadilah pendengar bagi satu orang yang sedang berat", "Minggu 4 — Rancang 'protokol masa sulit' berdasarkan resep ketenanganmu"],
      },
    },
  ];

  function strLevel(scores) {
    const t = scores.TOTAL;
    for (const lv of STR_LEVELS) {
      if (t >= lv.min) return lv;
    }
    return STR_LEVELS[STR_LEVELS.length - 1];
  }

  window.TESTS = window.TESTS || {};
  window.TESTS["stres"] = {
    id: "stres",
    title: "Tes Tingkat Stres",
    short: "Tingkat Stres",
    tagline: "Seberapa berat tekanan yang kamu rasakan sebulan terakhir?",
    productName: "Laporan Premium Tingkat Stres",
    price: 49000,
    priceStrike: 99000,
    greeting: "Jawab berdasarkan seberapa sering kamu mengalaminya dalam sebulan terakhir.",
    questions: STR_QUESTIONS,
    likert: STR_LIKERT,
    computeScores: strScores,
    getResult: function (scores) {
      const lv = strLevel(scores);
      const order = ["TKN", "KDL"];

      const dimensionInsights = order.map(function (d) {
        const band = window.psiBand(scores[d]);
        return {
          name: STR_DIMS[d].name, en: STR_DIMS[d].en, pct: scores[d],
          band: band.label, text: STR_DIM_BANDS[d][band.key],
        };
      });

      const summary =
        "Skor stres gabunganmu " + scores.TOTAL + "%, berada pada kategori '" + lv.name + "'. " +
        "Tekanan yang kamu rasakan " + scores.TKN + "%, sementara rasa kendalimu " + scores.KDL + "%. " +
        "Laporan di bawah berisi langkah-langkah praktis untuk menjaga — atau memulihkan — keseimbanganmu. " +
        "Ingat: hasil ini edukatif, bukan diagnosis klinis.";

      return {
        monogram: lv.monogram,
        name: lv.name,
        tagline: lv.tagline,
        desc: lv.desc,
        summary: summary,
        barsTitle: "Dua aspek stresmu",
        bars: order.map(function (d) {
          return { name: STR_DIMS[d].name, en: STR_DIMS[d].en, pct: scores[d] };
        }),
        dimensionInsights: dimensionInsights,
        premium: lv.premium,
      };
    },
  };
})();
