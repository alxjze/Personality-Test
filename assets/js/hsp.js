// Tes HSP — Highly Sensitive Person (skala kepekaan, terinspirasi Elaine Aron).
// 21 pertanyaan Likert 1-5, 7 item per subskala:
//   EOE = Ease of Excitation (mudah terstimulasi)
//   LST = Low Sensory Threshold (ambang sensori rendah)
//   AES = Aesthetic Sensitivity (kepekaan estetika)
(function () {
  const HSP_QUESTIONS = [
    // EOE — Mudah Terstimulasi
    { dim: "EOE", reverse: false, text: "Saya mudah merasa kewalahan ketika banyak hal terjadi sekaligus." },
    { dim: "EOE", reverse: false, text: "Perubahan dalam hidup membuat saya cukup goyah." },
    { dim: "EOE", reverse: false, text: "Saya merasa tidak nyaman saat harus melakukan banyak hal dalam waktu singkat." },
    { dim: "EOE", reverse: false, text: "Saya berusaha keras menghindari situasi yang membuat saya kesal atau kewalahan." },
    { dim: "EOE", reverse: false, text: "Ketika orang lain merasa tidak nyaman, saya biasanya tahu apa yang membuatnya nyaman." },
    { dim: "EOE", reverse: false, text: "Saya mudah terpengaruh oleh suasana hati orang di sekitar saya." },
    { dim: "EOE", reverse: false, text: "Saya butuh menyendiri untuk memulihkan diri setelah hari yang sibuk." },
    // LST — Ambang Sensori Rendah
    { dim: "LST", reverse: false, text: "Saya sangat terganggu oleh suara keras atau bising." },
    { dim: "LST", reverse: false, text: "Cahaya yang terlalu terang membuat saya tidak nyaman." },
    { dim: "LST", reverse: false, text: "Saya mudah terganggu oleh label baju, tekstur kain, atau hal kecil yang menyentuh kulit." },
    { dim: "LST", reverse: false, text: "Kafein memberi efek yang cukup kuat pada tubuh saya." },
    { dim: "LST", reverse: false, text: "Saya peka terhadap rasa lapar yang mengganggu konsentrasi dan suasana hati." },
    { dim: "LST", reverse: false, text: "Aroma atau bau tertentu terasa sangat kuat bagi saya." },
    { dim: "LST", reverse: false, text: "Saya cepat merasa lelah oleh keramaian dan hiruk-pikuk." },
    // AES — Kepekaan Estetika
    { dim: "AES", reverse: false, text: "Saya sangat tersentuh oleh seni, musik, atau keindahan alam." },
    { dim: "AES", reverse: false, text: "Saya menikmati aroma, rasa, suara, dan karya seni yang halus." },
    { dim: "AES", reverse: false, text: "Kehidupan batin saya kaya dan penuh perenungan." },
    { dim: "AES", reverse: false, text: "Saya memperhatikan detail-detail halus yang sering luput dari orang lain." },
    { dim: "AES", reverse: false, text: "Saya mudah terharu hingga menangis oleh momen yang mengharukan." },
    { dim: "AES", reverse: false, text: "Saya menghargai keindahan dalam hal-hal sederhana sehari-hari." },
    { dim: "AES", reverse: false, text: "Saya sering merenungkan makna di balik peristiwa yang saya alami." },
  ];

  const HSP_LIKERT = [
    { value: 1, label: "Sangat tidak sesuai" },
    { value: 2, label: "Tidak sesuai" },
    { value: 3, label: "Netral" },
    { value: 4, label: "Sesuai" },
    { value: 5, label: "Sangat sesuai" },
  ];

  const HSP_DIMS = {
    EOE: { name: "Mudah Terstimulasi", en: "Ease of Excitation" },
    LST: { name: "Ambang Sensori Rendah", en: "Low Sensory Threshold" },
    AES: { name: "Kepekaan Estetika", en: "Aesthetic Sensitivity" },
  };

  // Interpretasi per subskala berdasar band skor (personalisasi laporan).
  const HSP_DIM_BANDS = {
    EOE: {
      high: "Kamu sangat mudah terstimulasi — banyak hal sekaligus cepat membuatmu kewalahan, dan kamu butuh jeda untuk memproses.",
      med: "Kamu kadang merasa kewalahan pada situasi yang padat, tapi umumnya masih bisa mengelolanya.",
      low: "Kamu jarang merasa kewalahan meski banyak hal terjadi sekaligus. Kamu tahan terhadap kesibukan dan tekanan.",
    },
    LST: {
      high: "Indramu sangat peka — suara, cahaya, tekstur, dan aroma terasa jauh lebih kuat bagimu daripada kebanyakan orang.",
      med: "Kamu cukup peka terhadap rangsangan sensori tertentu, meski tidak selalu terganggu olehnya.",
      low: "Ambang sensorimu tinggi — kamu tidak mudah terganggu oleh kebisingan, cahaya, atau rangsangan fisik lain.",
    },
    AES: {
      high: "Kamu sangat tersentuh oleh keindahan, seni, dan nuansa halus. Kehidupan batinmu kaya dan reflektif.",
      med: "Kamu mengapresiasi keindahan dan makna, meski tidak selalu larut mendalam di dalamnya.",
      low: "Kamu cenderung praktis dan tidak terlalu terpaku pada nuansa estetika atau perenungan mendalam.",
    },
  };

  function hspScores(answers) {
    const sums = { EOE: 0, LST: 0, AES: 0 };
    const counts = { EOE: 0, LST: 0, AES: 0 };
    HSP_QUESTIONS.forEach(function (q, i) {
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
    // Skor total = rata-rata ketiga subskala.
    scores.TOTAL = Math.round((scores.EOE + scores.LST + scores.AES) / 3);
    return scores;
  }

  // Level hasil berdasar skor total.
  const HSP_LEVELS = [
    {
      min: 60, monogram: "HSP", name: "Sangat Sensitif (HSP)",
      tagline: "Dunia terasa lebih dalam dan lebih hidup bagimu.",
      desc: "Kamu memproses pengalaman lebih dalam daripada kebanyakan orang. Indramu tajam, empatimu kuat, dan kamu menangkap nuansa yang tak terlihat oleh orang lain — sebuah anugerah sekaligus tanggung jawab untuk menjaga diri.",
      premium: {
        strengths: ["Empati dan intuisi yang sangat tajam", "Kepekaan estetika dan apresiasi mendalam", "Teliti terhadap detail halus", "Kesadaran diri dan refleksi yang kaya"],
        weaknesses: ["Mudah kewalahan oleh stimulasi berlebih", "Rentan menyerap emosi orang lain", "Butuh waktu pemulihan lebih lama", "Cenderung menghindari konflik dan keramaian"],
        careers: ["Konselor / terapis", "Seniman, penulis, musisi", "Peneliti & analis mendalam", "Perawat, guru, pekerja sosial"],
        relationship: "Kamu pasangan yang penuh perhatian dan mendalam, peka terhadap kebutuhan yang tak terucap. Tantanganmu: mengomunikasikan batas dan kebutuhan akan waktu menyendiri tanpa merasa bersalah. Pasangan yang memahami ritme energimu akan sangat berarti.",
        communication: "Kamu menangkap nuansa emosi yang tak terucap. Latih menyuarakan kebutuhanmu akan jeda dan ketenangan secara langsung, tanpa merasa bersalah.",
        workStyle: "Kamu berkembang di lingkungan kerja yang tenang, bermakna, dan tidak kelebihan stimulasi. Ruang terbuka yang bising atau multitasking ekstrem cepat menguras energimu.",
        wellbeing: "Pemulihan bukan kemewahan bagimu, melainkan kebutuhan. Jadwalkan waktu sunyi harian sebelum tangki energimu benar-benar kosong.",
        tips: ["Jadwalkan waktu tenang harian untuk 'mengosongkan' stimulasi", "Kurangi paparan berita/media yang memicu kewalahan", "Kenali dan hormati batas energimu — istirahat sebelum penuh", "Ubah kepekaanmu jadi karya: menulis, seni, atau membantu orang lain"],
        actionPlan: ["Minggu 1 — Buat 'zona tenang' harian 20 menit tanpa layar", "Minggu 2 — Kurangi satu sumber over-stimulasi (mis. notifikasi)", "Minggu 3 — Latih menyampaikan satu batas dengan tenang", "Minggu 4 — Salurkan kepekaanmu ke satu karya atau kegiatan bermakna"],
      },
    },
    {
      min: 40, monogram: "CS", name: "Cukup Sensitif",
      tagline: "Kamu peka, namun cukup tahan terhadap stimulasi.",
      desc: "Kamu menunjukkan kepekaan di beberapa situasi, tapi umumnya mampu menyeimbangkannya dengan baik. Kamu bisa menikmati kedalaman rasa tanpa mudah kewalahan — perpaduan yang fleksibel.",
      premium: {
        strengths: ["Empati yang baik namun tetap berbatas sehat", "Mampu menikmati keindahan tanpa mudah lelah", "Cukup tahan terhadap tekanan sehari-hari", "Fleksibel antara ramai dan menyendiri"],
        weaknesses: ["Kadang meremehkan kebutuhan istirahat sendiri", "Bisa kewalahan pada situasi ekstrem", "Sensitivitas naik-turun tergantung kondisi"],
        careers: ["Manajer tim yang empatik", "Desainer / kreator", "Pendidik", "Profesi layanan yang seimbang"],
        relationship: "Kamu hadir dengan hangat namun tetap mandiri secara emosional. Kamu bisa mendukung pasangan tanpa kehilangan diri — kekuatan yang membuat hubungan sehat dan seimbang.",
        communication: "Kamu peka namun tetap tegas. Manfaatkan empatimu untuk memahami orang lain tanpa kehilangan batas sehatmu sendiri.",
        workStyle: "Kamu fleksibel — bisa menikmati lingkungan dinamis maupun tenang, selama ada keseimbangan antara stimulasi dan pemulihan.",
        wellbeing: "Kamu umumnya seimbang; tetap kenali situasi ekstrem yang bisa memicu kewalahan dan siapkan jeda untuknya.",
        tips: ["Kenali situasi spesifik yang memicu kewalahan bagimu", "Tetap sisihkan waktu memulihkan energi walau merasa 'baik-baik saja'", "Manfaatkan kepekaanmu di momen yang membutuhkan empati"],
        actionPlan: ["Minggu 1 — Catat situasi spesifik yang paling menguras energimu", "Minggu 2 — Sisipkan jeda singkat di hari-hari yang padat", "Minggu 3 — Manfaatkan kepekaanmu di momen yang butuh empati", "Minggu 4 — Evaluasi ritme energi yang paling cocok untukmu"],
      },
    },
    {
      min: 0, monogram: "SR", name: "Sensitivitas Rendah",
      tagline: "Kamu tangguh dan tidak mudah terusik.",
      desc: "Kamu cenderung tahan terhadap stimulasi dan tidak mudah kewalahan oleh lingkungan. Ketahananmu membuatmu stabil dalam situasi yang membuat orang lain kelelahan — kekuatan tersendiri.",
      premium: {
        strengths: ["Tahan terhadap kebisingan dan keramaian", "Stabil dalam situasi menekan", "Tidak mudah larut dalam drama emosional", "Mudah beradaptasi dengan lingkungan baru"],
        weaknesses: ["Kadang kurang menangkap sinyal halus orang lain", "Bisa terlihat 'tebal' terhadap suasana", "Perlu usaha lebih untuk memperdalam empati"],
        careers: ["Peran operasional bertempo tinggi", "Lapangan / layanan darurat", "Sales & negosiasi", "Manajemen situasi krisis"],
        relationship: "Kamu pasangan yang stabil dan tidak mudah panik. Melatih untuk lebih jeli membaca kebutuhan emosional pasangan akan memperkaya kedekatanmu.",
        communication: "Kamu stabil dan tidak mudah larut. Latih lebih jeli menangkap sinyal halus emosi orang lain agar mereka merasa benar-benar dipahami.",
        workStyle: "Kamu tahan terhadap lingkungan bertempo tinggi dan penuh stimulasi yang membuat orang lain kelelahan — sebuah keunggulan nyata.",
        wellbeing: "Ketahananmu adalah aset; tetap sisihkan waktu untuk memperdalam koneksi dan menemukan makna, bukan hanya menyelesaikan tugas.",
        tips: ["Latih mendengarkan aktif dan bertanya tentang perasaan", "Perhatikan bahasa tubuh dan nada, bukan hanya kata-kata", "Sesekali perlambat untuk menikmati detail dan keindahan"],
        actionPlan: ["Minggu 1 — Tanyakan perasaan seseorang dan dengarkan sepenuhnya", "Minggu 2 — Perhatikan bahasa tubuh & nada, bukan hanya kata", "Minggu 3 — Luangkan waktu menikmati satu hal indah dengan sengaja", "Minggu 4 — Refleksikan momen yang terasa paling bermakna"],
      },
    },
  ];

  function hspLevel(scores) {
    const t = scores.TOTAL;
    for (const lv of HSP_LEVELS) {
      if (t >= lv.min) return lv;
    }
    return HSP_LEVELS[HSP_LEVELS.length - 1];
  }

  window.TESTS = window.TESTS || {};
  window.TESTS["hsp"] = {
    id: "hsp",
    title: "Tes HSP — Highly Sensitive Person",
    short: "HSP (Kepekaan)",
    tagline: "Seberapa peka dan sensitif dirimu terhadap dunia sekitar?",
    productName: "Laporan Premium HSP",
    price: 49000,
    priceStrike: 99000,
    greeting: "Jawablah sesuai pengalamanmu yang sebenarnya — bukan yang kamu harapkan.",
    questions: HSP_QUESTIONS,
    likert: HSP_LIKERT,
    computeScores: hspScores,
    getResult: function (scores) {
      const lv = hspLevel(scores);
      const order = ["EOE", "LST", "AES"];

      const dimensionInsights = order.map(function (d) {
        const band = window.psiBand(scores[d]);
        return {
          name: HSP_DIMS[d].name, en: HSP_DIMS[d].en, pct: scores[d],
          band: band.label, text: HSP_DIM_BANDS[d][band.key],
        };
      });

      const sorted = order.slice().sort(function (a, b) { return scores[b] - scores[a]; });
      const top = sorted[0];
      const summary =
        "Skor kepekaan totalmu " + scores.TOTAL + "%, menempatkanmu pada kategori '" + lv.name + "'. " +
        "Aspek yang paling menonjol adalah " + HSP_DIMS[top].name + " (" + scores[top] + "%). " +
        "Laporan di bawah menguraikan apa artinya bagi cara kerjamu, relasimu, dan kesejahteraanmu sehari-hari.";

      return {
        monogram: lv.monogram,
        name: lv.name,
        tagline: lv.tagline,
        desc: lv.desc + " Skor kepekaan totalmu: " + scores.TOTAL + "%.",
        summary: summary,
        barsTitle: "Skor tiga aspek kepekaanmu",
        bars: order.map(function (d) {
          return { name: HSP_DIMS[d].name, en: HSP_DIMS[d].en, pct: scores[d] };
        }),
        dimensionInsights: dimensionInsights,
        premium: lv.premium,
      };
    },
  };
})();
