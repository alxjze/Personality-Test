// Tes DISC — gaya kerja & perilaku dalam tim.
// 20 pertanyaan Likert 1-5, 5 item per gaya:
//   D = Dominance, I = Influence, S = Steadiness, C = Conscientiousness
(function () {
  const DISC_QUESTIONS = [
    // D — Dominance
    { dim: "D", reverse: false, text: "Saya suka memegang kendali dan mengambil keputusan dengan cepat." },
    { dim: "D", reverse: false, text: "Tantangan yang sulit justru membakar semangat saya." },
    { dim: "D", reverse: false, text: "Saya langsung ke inti masalah tanpa banyak basa-basi." },
    { dim: "D", reverse: false, text: "Saya nyaman mengambil risiko demi hasil yang besar." },
    { dim: "D", reverse: false, text: "Dalam kelompok, saya secara alami mengambil peran pemimpin." },
    // I — Influence
    { dim: "I", reverse: false, text: "Saya mudah membangun semangat orang-orang di sekitar saya." },
    { dim: "I", reverse: false, text: "Saya senang bertemu orang baru dan memperluas jaringan." },
    { dim: "I", reverse: false, text: "Saya cukup persuasif dalam meyakinkan orang lain." },
    { dim: "I", reverse: false, text: "Suasana kerja yang menyenangkan sama pentingnya dengan hasil." },
    { dim: "I", reverse: false, text: "Saya berpikir paling jernih saat berdiskusi dengan orang lain." },
    // S — Steadiness
    { dim: "S", reverse: false, text: "Saya lebih suka lingkungan kerja yang stabil dan dapat diprediksi." },
    { dim: "S", reverse: false, text: "Saya pendengar yang sabar bagi rekan-rekan saya." },
    { dim: "S", reverse: false, text: "Saya setia dan bertahan lama dalam tim atau organisasi." },
    { dim: "S", reverse: false, text: "Perubahan mendadak membuat saya butuh waktu untuk menyesuaikan diri." },
    { dim: "S", reverse: false, text: "Saya menghindari konflik dan mengutamakan kerja sama." },
    // C — Conscientiousness
    { dim: "C", reverse: false, text: "Saya memeriksa detail dan data sebelum mengambil keputusan." },
    { dim: "C", reverse: false, text: "Standar kualitas saya tinggi — kadang sampai perfeksionis." },
    { dim: "C", reverse: false, text: "Saya lebih suka bekerja dengan prosedur dan standar yang jelas." },
    { dim: "C", reverse: false, text: "Ketepatan lebih penting bagi saya daripada kecepatan." },
    { dim: "C", reverse: false, text: "Saya tidak nyaman menyampaikan sesuatu tanpa persiapan matang." },
  ];

  const DISC_LIKERT = [
    { value: 1, label: "Sangat tidak sesuai" },
    { value: 2, label: "Tidak sesuai" },
    { value: 3, label: "Netral" },
    { value: 4, label: "Sesuai" },
    { value: 5, label: "Sangat sesuai" },
  ];

  const DISC_DIMS = {
    D: { name: "Dominan", en: "Dominance" },
    I: { name: "Memengaruhi", en: "Influence" },
    S: { name: "Stabil", en: "Steadiness" },
    C: { name: "Cermat", en: "Conscientiousness" },
  };

  const DISC_DIM_BANDS = {
    D: {
      high: "Dorongan hasilmu kuat — kamu tegas, cepat memutuskan, dan tak gentar pada tantangan maupun konflik.",
      med: "Kamu bisa tegas saat dibutuhkan, namun tidak merasa harus selalu memegang kendali.",
      low: "Kamu tidak terdorong untuk mendominasi — lebih nyaman berkontribusi tanpa harus memimpin arah.",
    },
    I: {
      high: "Energi sosialmu tinggi — kamu antusias, persuasif, dan pandai menggerakkan orang lewat semangat.",
      med: "Kamu cukup komunikatif dan bisa mencairkan suasana, meski tak selalu menjadi pusat energi.",
      low: "Kamu lebih banyak bekerja daripada berbicara — pengaruhmu lewat substansi, bukan panggung.",
    },
    S: {
      high: "Kamu penopang tim yang sabar dan konsisten — kehadiranmu menstabilkan orang-orang di sekitarmu.",
      med: "Kamu cukup sabar dan kooperatif, namun tetap bisa bergerak cepat saat situasi menuntut.",
      low: "Kamu menyukai tempo cepat dan variasi — stabilitas yang terlalu lama justru terasa stagnan.",
    },
    C: {
      high: "Ketelitianmu tinggi — kamu bekerja dengan data, standar, dan presisi yang bisa diandalkan.",
      med: "Kamu memperhatikan kualitas tanpa terjebak kesempurnaan — cukup teliti, tetap pragmatis.",
      low: "Kamu bergerak berdasar intuisi dan kecepatan — detail administratif bukan zona favoritmu.",
    },
  };

  function discScores(answers) {
    const sums = { D: 0, I: 0, S: 0, C: 0 };
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    DISC_QUESTIONS.forEach(function (q, i) {
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

  const DISC_ARCHETYPES = {
    D: {
      monogram: "D", name: "Sang Pengarah",
      tagline: "Digerakkan hasil, tak gentar tantangan.",
      desc: "Kamu adalah motor yang mendorong segalanya maju. Tegas, cepat, dan berorientasi target — saat orang lain masih menimbang, kamu sudah bergerak. Tantangan besar bukan ancaman bagimu, melainkan undangan.",
      premium: {
        strengths: ["Pengambilan keputusan yang cepat dan tegas", "Berani mengambil tanggung jawab dan risiko", "Fokus kuat pada hasil dan target", "Tidak mudah menyerah di bawah tekanan"],
        weaknesses: ["Bisa terkesan menekan atau tidak sabaran", "Kurang mendengarkan sebelum memutuskan", "Cenderung mengabaikan detail dan proses"],
        careers: ["Kepemimpinan & manajemen umum", "Wirausaha & business development", "Manajemen proyek bertempo tinggi", "Penjualan enterprise & negosiasi"],
        relationship: "Ketegasanmu memberi rasa aman, tapi bisa terasa mendikte bagi orang terdekat. Latih bertanya sebelum memutuskan untuk berdua — dilibatkan adalah bentuk rasa hormat yang paling mereka rasakan.",
        communication: "Gaya bicaramu langsung dan efisien — aset dalam krisis, tapi bisa melukai dalam keseharian. Tambahkan konteks dan tanya pendapat sebelum menyimpulkan; kamu akan didengar lebih sukarela.",
        workStyle: "Kamu unggul saat diberi target jelas dan wewenang penuh. Birokrasi panjang dan konsensus bertele-tele menguras energimu — carilah peran dengan otonomi dan akuntabilitas nyata.",
        wellbeing: "Kamu mengukur diri dari pencapaian, sehingga sulit benar-benar berhenti. Ingat: pemulihan adalah bagian dari strategi, bukan kelemahan. Atlet terbaik pun punya hari istirahat.",
        tips: ["Dengarkan sampai selesai sebelum merespons", "Delegasikan hasil, bukan hanya tugas — beri orang ruang caranya sendiri", "Rayakan progres tim secara verbal, bukan hanya menuntut target berikutnya"],
        actionPlan: ["Minggu 1 — Dalam tiap rapat, bertanya dulu sebelum menyatakan pendapat", "Minggu 2 — Delegasikan satu keputusan penuh pada anggota tim", "Minggu 3 — Beri apresiasi spesifik pada tiga orang", "Minggu 4 — Jadwalkan satu hari penuh tanpa kerja dan patuhi"],
      },
    },
    I: {
      monogram: "I", name: "Sang Penginspirasi",
      tagline: "Menggerakkan orang lewat semangat dan cerita.",
      desc: "Energimu menular. Kamu membujuk bukan dengan tekanan, melainkan antusiasme — membuat orang percaya pada ide, pada tim, dan pada diri mereka sendiri. Di tanganmu, pekerjaan terasa seperti gerakan bersama.",
      premium: {
        strengths: ["Komunikasi yang hidup dan persuasif", "Membangun jaringan dan koneksi dengan cepat", "Optimisme yang mengangkat moral tim", "Kreatif dalam melempar dan menjual ide"],
        weaknesses: ["Kurang fokus pada detail dan tindak lanjut", "Bisa terlalu banyak berjanji karena antusias", "Menghindari percakapan yang tidak menyenangkan"],
        careers: ["Marketing, branding & komunikasi", "Public speaking & pelatihan", "Sales relasional & kemitraan", "Community & event management"],
        relationship: "Kehangatanmu membuat orang merasa istimewa — pastikan orang terdekatmu mendapat versi terbaikmu, bukan sisa energi sosialmu. Kehadiran yang konsisten lebih berharga daripada pesona yang sesekali.",
        communication: "Kamu pencerita alami. Imbangi dengan mendengarkan aktif dan mencatat komitmen — karisma membuka pintu, tapi tindak lanjut yang membuatmu dipercaya.",
        workStyle: "Kamu berkembang di lingkungan kolaboratif yang dinamis dan penuh interaksi. Pekerjaan administratif yang sunyi menguras semangatmu — pasangkan dirimu dengan rekan yang kuat di detail.",
        wellbeing: "Kebutuhanmu akan apresiasi bisa membuatmu terlalu banyak mengiyakan. Belajarlah bahwa dicintai dan selalu menyenangkan orang adalah dua hal yang berbeda.",
        tips: ["Catat setiap komitmen dan tepati — reputasimu ada di sana", "Sisakan energi sosial untuk orang-orang terpenting", "Hadapi satu percakapan sulit yang kamu tunda"],
        actionPlan: ["Minggu 1 — Tulis semua janji yang belum ditepati dan cicil selesaikan", "Minggu 2 — Lakukan satu percakapan sulit yang selama ini dihindari", "Minggu 3 — Praktikkan mendengarkan tanpa menyela dalam tiap diskusi", "Minggu 4 — Evaluasi komitmen mana yang layak diteruskan atau dilepas"],
      },
    },
    S: {
      monogram: "S", name: "Sang Penopang",
      tagline: "Kekuatan tenang yang membuat tim tetap utuh.",
      desc: "Kamu adalah jangkar tim — sabar, konsisten, dan bisa diandalkan dalam jangka panjang. Saat badai datang, orang berpaling padamu bukan karena kamu paling keras, melainkan karena kamu paling teguh.",
      premium: {
        strengths: ["Kesabaran dan konsistensi yang langka", "Pendengar yang membuat orang merasa aman", "Loyalitas tinggi pada tim dan organisasi", "Penengah alami dalam konflik"],
        weaknesses: ["Sulit menolak dan menyuarakan keberatan", "Kurang nyaman dengan perubahan cepat", "Kebutuhannya sendiri sering dikorbankan"],
        careers: ["Human resources & people operations", "Layanan kesehatan & pendidikan", "Customer success & support", "Operasional dengan ritme yang stabil"],
        relationship: "Kamu pasangan dan sahabat yang setia serta menenangkan. Tantanganmu: menyuarakan ketidaknyamanan sebelum menumpuk jadi jarak. Konflik kecil yang jujur lebih sehat daripada damai yang pura-pura.",
        communication: "Kamu mendengarkan lebih baik daripada siapa pun, tapi suaramu sendiri sering tak terdengar. Latih menyampaikan posisi dengan kalimat langsung: 'Saya keberatan karena…' — tim justru menghargainya.",
        workStyle: "Kamu paling produktif dalam lingkungan yang stabil dengan ekspektasi jelas dan relasi yang hangat. Perubahan bukan musuhmu — yang kamu butuhkan hanyalah waktu transisi dan alasan yang jujur.",
        wellbeing: "Kamu menyerap ketegangan tim tanpa menyalurkannya. Temukan pelampiasan rutin — olahraga, jurnal, atau teman bercerita — agar ketenanganmu tidak berubah jadi beban diam-diam.",
        tips: ["Suarakan pendapatmu di awal diskusi, jangan menunggu ditanya", "Mulai perubahan kecil secara sukarela agar otot adaptasimu terlatih", "Jadwalkan kebutuhanmu sendiri seperti kamu menjadwalkan membantu orang"],
        actionPlan: ["Minggu 1 — Sampaikan satu pendapat di rapat tanpa diminta", "Minggu 2 — Tolak satu permintaan yang melebihi kapasitasmu", "Minggu 3 — Inisiasi satu perubahan kecil di rutinitasmu", "Minggu 4 — Evaluasi: beban siapa yang selama ini kamu pikul diam-diam?"],
      },
    },
    C: {
      monogram: "C", name: "Sang Penganalisis",
      tagline: "Presisi dan standar adalah bahasa kualitas.",
      desc: "Kamu adalah penjaga mutu. Data, logika, dan ketelitian adalah caramu menghormati pekerjaan — kesalahan yang luput dari semua orang jarang lolos dari matamu. Karya yang keluar dari tanganmu bisa dipercaya.",
      premium: {
        strengths: ["Analisis mendalam dan berbasis data", "Standar kualitas yang tinggi", "Perencanaan yang sistematis", "Objektif dan tidak mudah terbawa arus"],
        weaknesses: ["Perfeksionisme yang memperlambat", "Terlalu kritis pada diri dan orang lain", "Sulit memutuskan tanpa data lengkap"],
        careers: ["Analis data, riset & keuangan", "Quality assurance & audit", "Engineering & arsitektur sistem", "Hukum, kepatuhan & regulasi"],
        relationship: "Standarmu yang tinggi bisa terasa seperti penilaian bagi orang terdekat. Ingat: manusia bukan proyek untuk dioptimalkan. Terima ketidaksempurnaan kecil sebagai harga kehangatan.",
        communication: "Argumenmu kuat dan berbasis fakta. Tambahkan empati dalam penyampaian — orang lebih mudah menerima koreksi saat merasa niatmu membantu, bukan menghakimi.",
        workStyle: "Kamu unggul pada pekerjaan yang menuntut ketelitian dan kedalaman, dengan waktu memadai untuk melakukannya dengan benar. Tenggat mepet berulang dan standar asal-jadi adalah sumber frustrasi utamamu.",
        wellbeing: "Kritikus terkeras dalam hidupmu adalah dirimu sendiri. Latih membedakan 'penting untuk sempurna' dan 'cukup untuk hari ini' — kelegaan bukan berarti menurunkan standar.",
        tips: ["Tetapkan batas waktu analisis sebelum memutuskan", "Kirim pekerjaan saat 'sangat baik', jangan menunggu 'sempurna'", "Apresiasi usaha orang sebelum mengoreksi hasilnya"],
        actionPlan: ["Minggu 1 — Putuskan satu hal dengan data 80% dan amati hasilnya", "Minggu 2 — Kirim satu pekerjaan tanpa revisi ketiga", "Minggu 3 — Beri satu apresiasi sebelum tiap koreksi", "Minggu 4 — Tulis daftar hal yang 'cukup baik' dan biarkan tetap begitu"],
      },
    },
  };

  window.TESTS = window.TESTS || {};
  window.TESTS["disc"] = {
    id: "disc",
    title: "Tes DISC — Gaya Kerja",
    short: "DISC (Gaya Kerja)",
    tagline: "Bagaimana gayamu bekerja, memimpin, dan berkolaborasi?",
    productName: "Laporan Premium DISC",
    price: 49000,
    priceStrike: 99000,
    greeting: "Jawablah sesuai perilakumu yang sebenarnya di tempat kerja atau organisasi.",
    questions: DISC_QUESTIONS,
    likert: DISC_LIKERT,
    computeScores: discScores,
    getResult: function (scores) {
      const order = ["D", "I", "S", "C"];
      const sorted = order.slice().sort(function (a, b) { return scores[b] - scores[a]; });
      const top = sorted[0], second = sorted[1];
      const arch = DISC_ARCHETYPES[top];

      const dimensionInsights = order.map(function (d) {
        const band = window.psiBand(scores[d]);
        return {
          name: DISC_DIMS[d].name, en: DISC_DIMS[d].en, pct: scores[d],
          band: band.label, text: DISC_DIM_BANDS[d][band.key],
        };
      });

      const summary =
        "Gaya kerja dominanmu adalah " + DISC_DIMS[top].name + " / " + DISC_DIMS[top].en +
        " (" + scores[top] + "%), dengan " + DISC_DIMS[second].name + " (" + scores[second] + "%) sebagai gaya pendukung. " +
        "Kombinasi ini menentukan caramu mengambil keputusan, berkomunikasi, dan berkontribusi dalam tim — " +
        "diuraikan lengkap di laporan bawah ini.";

      return {
        monogram: arch.monogram,
        name: arch.name,
        tagline: arch.tagline,
        desc: arch.desc,
        summary: summary,
        barsTitle: "Skor empat gaya DISC-mu",
        bars: order.map(function (d) {
          return { name: DISC_DIMS[d].name, en: DISC_DIMS[d].en, pct: scores[d] };
        }),
        dimensionInsights: dimensionInsights,
        premium: arch.premium,
      };
    },
  };
})();
