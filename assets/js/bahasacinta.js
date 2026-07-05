// Tes Bahasa Cinta — cara utama memberi & menerima kasih sayang.
// 20 pertanyaan Likert 1-5, 4 item per bahasa (5 bahasa).
(function () {
  const BC_QUESTIONS = [
    // AFR — Kata-Kata Afirmasi
    { dim: "AFR", reverse: false, text: "Pujian tulus dari orang terdekat bisa mengangkat suasana hati saya sepanjang hari." },
    { dim: "AFR", reverse: false, text: "Saya sangat menghargai ketika seseorang mengungkapkan sayangnya lewat kata-kata." },
    { dim: "AFR", reverse: false, text: "Kata-kata kasar atau kritik pedas membekas lama di hati saya." },
    { dim: "AFR", reverse: false, text: "Saya senang mengirim atau menerima pesan manis tanpa alasan khusus." },
    // QT — Waktu Berkualitas
    { dim: "QT", reverse: false, text: "Perhatian penuh tanpa gangguan ponsel adalah hadiah terbaik bagi saya." },
    { dim: "QT", reverse: false, text: "Saya merasa paling disayang saat menghabiskan waktu berdua tanpa terburu-buru." },
    { dim: "QT", reverse: false, text: "Rencana bersama yang dibatalkan terasa lebih menyakitkan bagi saya daripada bagi kebanyakan orang." },
    { dim: "QT", reverse: false, text: "Percakapan mendalam berdua membuat saya merasa benar-benar terhubung." },
    // GFT — Hadiah
    { dim: "GFT", reverse: false, text: "Hadiah kecil yang penuh pemikiran sangat berarti bagi saya, berapa pun harganya." },
    { dim: "GFT", reverse: false, text: "Saya menyimpan benda-benda pemberian orang tersayang dengan hati-hati." },
    { dim: "GFT", reverse: false, text: "Saya senang meluangkan waktu mencari hadiah yang tepat untuk orang yang saya sayangi." },
    { dim: "GFT", reverse: false, text: "Oleh-oleh sederhana menunjukkan bahwa seseorang memikirkan saya saat kami berjauhan." },
    // SRV — Tindakan Pelayanan
    { dim: "SRV", reverse: false, text: "Bantuan nyata — seperti dibantu menyelesaikan pekerjaan — terasa sangat berarti bagi saya." },
    { dim: "SRV", reverse: false, text: "Saya merasa disayang ketika seseorang meringankan beban saya tanpa diminta." },
    { dim: "SRV", reverse: false, text: "Janji membantu yang tidak ditepati sangat mengecewakan saya." },
    { dim: "SRV", reverse: false, text: "Saya menunjukkan sayang dengan melakukan sesuatu untuk orang lain." },
    // TCH — Sentuhan Fisik
    { dim: "TCH", reverse: false, text: "Pelukan atau genggaman tangan menenangkan saya lebih dari kata-kata." },
    { dim: "TCH", reverse: false, text: "Saya merasa dekat dengan seseorang lewat kehadiran fisiknya di samping saya." },
    { dim: "TCH", reverse: false, text: "Sentuhan kecil seperti tepukan di bahu membuat saya merasa dihargai." },
    { dim: "TCH", reverse: false, text: "Jarak fisik yang lama dari orang tersayang terasa berat bagi saya." },
  ];

  const BC_LIKERT = [
    { value: 1, label: "Sangat tidak sesuai" },
    { value: 2, label: "Tidak sesuai" },
    { value: 3, label: "Netral" },
    { value: 4, label: "Sesuai" },
    { value: 5, label: "Sangat sesuai" },
  ];

  const BC_DIMS = {
    AFR: { name: "Kata-Kata Afirmasi", en: "Words of Affirmation" },
    QT:  { name: "Waktu Berkualitas", en: "Quality Time" },
    GFT: { name: "Hadiah", en: "Receiving Gifts" },
    SRV: { name: "Tindakan Pelayanan", en: "Acts of Service" },
    TCH: { name: "Sentuhan Fisik", en: "Physical Touch" },
  };

  const BC_DIM_BANDS = {
    AFR: {
      high: "Kata-kata sangat berarti bagimu — pujian tulus mengisi hatimu, dan ucapan kasar melukainya lebih dalam dari yang orang kira.",
      med: "Kamu menghargai ungkapan verbal, meski itu bukan satu-satunya cara kamu merasa disayang.",
      low: "Kata-kata manis bukan bahasa utamamu — kamu lebih mempercayai apa yang ditunjukkan daripada yang diucapkan.",
    },
    QT: {
      high: "Kehadiran penuh adalah segalanya bagimu — perhatian tak terbagi terasa lebih berharga daripada hadiah termahal.",
      med: "Waktu bersama penting bagimu, meski kamu juga nyaman dengan kebersamaan yang santai dan tak selalu intens.",
      low: "Kamu tak butuh banyak waktu khusus berdua untuk merasa dekat — koneksi bisa terjaga dengan cara lain.",
    },
    GFT: {
      high: "Bagimu hadiah adalah cinta yang bisa digenggam — bukti bahwa seseorang memikirkanmu bahkan saat kamu tak ada.",
      med: "Kamu menikmati memberi dan menerima hadiah, meski maknanya lebih pada momen daripada bendanya.",
      low: "Benda bukan bahasamu — perhatian dan kehadiran jauh lebih berharga bagimu daripada bingkisan.",
    },
    SRV: {
      high: "Tindakan berbicara paling keras bagimu — bantuan nyata tanpa diminta adalah bentuk cinta paling murni.",
      med: "Kamu menghargai bantuan praktis, terutama saat bebanmu sedang berat.",
      low: "Kamu cenderung mandiri — bantuan praktis menyenangkan, tapi bukan itu yang membuatmu merasa dicintai.",
    },
    TCH: {
      high: "Kedekatan fisik adalah bahasamu — pelukan, genggaman, dan kehadiran fisik menenangkanmu melebihi kata-kata.",
      med: "Sentuhan hangat berarti bagimu di momen yang tepat, meski bukan kebutuhan utamamu.",
      low: "Kamu punya ruang pribadi yang jelas — kasih sayang tak harus lewat sentuhan untuk terasa nyata.",
    },
  };

  function bcScores(answers) {
    const sums = { AFR: 0, QT: 0, GFT: 0, SRV: 0, TCH: 0 };
    const counts = { AFR: 0, QT: 0, GFT: 0, SRV: 0, TCH: 0 };
    BC_QUESTIONS.forEach(function (q, i) {
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

  // Arketipe per bahasa cinta dominan.
  const BC_ARCHETYPES = {
    AFR: {
      monogram: "KA", name: "Kata-Kata Afirmasi",
      tagline: "Cinta paling terasa saat diucapkan.",
      desc: "Bagimu, kata-kata bukan basa-basi — melainkan jembatan hati. Pujian tulus, dukungan verbal, dan ungkapan sayang yang diucapkan membuatmu merasa dilihat dan dihargai sepenuhnya.",
      premium: {
        strengths: ["Pandai mengapresiasi orang lewat kata-kata", "Peka terhadap nada dan makna ucapan", "Mampu membangun kepercayaan diri orang lain", "Komunikator emosi yang jujur"],
        weaknesses: ["Kritik pedas membekas sangat lama", "Bisa terlalu bergantung pada validasi verbal", "Diamnya orang terdekat mudah disalahartikan"],
        careers: ["Pengajar & pembimbing yang membangun lewat apresiasi", "Peran komunikasi: humas, penulis, penyiar", "Kepemimpinan tim yang kuat dalam memberi umpan balik", "Layanan pelanggan & hubungan klien"],
        relationship: "Katakan pada pasanganmu bahwa ucapan adalah bahasamu — mereka mungkin mencintaimu lewat cara lain dan tak sadar kamu haus kata-kata. Sebaliknya, jangan ukur cinta mereka hanya dari yang terucap.",
        communication: "Kamu memberi apresiasi verbal dengan alami — jadikan itu kekuatan di tim dan keluargamu. Saat menerima kritik, tarik napas dan pisahkan isi pesan dari cara penyampaiannya.",
        workStyle: "Kamu berkembang di lingkungan yang murah apresiasi dan umpan balik. Atasan yang hanya bicara saat ada masalah akan menguras motivasimu — carilah budaya kerja yang merayakan kontribusi.",
        wellbeing: "Ucapan negatif — termasuk kata-katamu pada dirimu sendiri — memukulmu lebih keras dari orang lain. Rawat dialog batinmu seperti kamu merawat perasaan orang tersayang.",
        tips: ["Sampaikan kebutuhanmu akan apresiasi secara terbuka", "Simpan pesan-pesan manis yang kamu terima untuk hari yang berat", "Latih memberi apresiasi pada dirimu sendiri, bukan hanya orang lain"],
        actionPlan: ["Minggu 1 — Beri tahu satu orang terdekat bahwa kata-kata adalah bahasa cintamu", "Minggu 2 — Tulis tiga hal yang kamu hargai dari dirimu setiap malam", "Minggu 3 — Kirim satu pesan apresiasi tulus setiap hari", "Minggu 4 — Latih merespons kritik dengan jeda, bukan luka"],
      },
    },
    QT: {
      monogram: "WB", name: "Waktu Berkualitas",
      tagline: "Kehadiran penuh adalah bentuk cinta tertinggi.",
      desc: "Bagimu, cinta dieja H-A-D-I-R. Bukan sekadar berada di ruangan yang sama, melainkan perhatian yang utuh — mata yang menatap, telinga yang mendengar, dan waktu yang tak terburu-buru.",
      premium: {
        strengths: ["Pendengar yang hadir sepenuhnya", "Membangun kedekatan yang dalam, bukan dangkal", "Menghargai momen dan membuatnya berarti", "Setia pada orang-orang terpilih"],
        weaknesses: ["Mudah terluka oleh pembatalan dan distraksi", "Bisa menuntut waktu yang sulit dipenuhi orang sibuk", "Sulit merasa dekat lewat interaksi singkat"],
        careers: ["Konseling & pendampingan", "Fasilitator, coach, mentor", "Peran klien-intensif yang membangun relasi jangka panjang", "Pendidikan anak usia dini"],
        relationship: "Jadwalkan waktu berdua yang terlindungi — tanpa ponsel, tanpa agenda lain. Sampaikan bahwa perhatian penuh lima belas menit lebih berarti bagimu daripada kebersamaan setengah hati seharian.",
        communication: "Kamu berkomunikasi paling baik dalam percakapan mendalam satu-satu. Untuk relasi penting, usulkan ritual rutin: makan malam mingguan, jalan pagi, atau ngobrol sebelum tidur.",
        workStyle: "Kamu menghargai kolaborasi yang fokus: rapat yang hadir penuh, sesi kerja bareng yang tak terganggu. Multitasking saat orang berbicara terasa seperti penghinaan kecil bagimu.",
        wellbeing: "Kalender yang penuh tapi kosong makna akan menggerogotimu. Lindungi waktu untuk orang tersayang seketat kamu melindungi tenggat kerja.",
        tips: ["Usulkan ritual rutin bersama orang terdekat", "Sampaikan dengan jelas: 'aku butuh waktumu, bukan hadiahmu'", "Letakkan ponsel saat bersama orang yang kamu sayangi — teladani dulu"],
        actionPlan: ["Minggu 1 — Jadwalkan satu momen berdua tanpa gangguan dengan orang terdekat", "Minggu 2 — Bangun satu ritual kecil rutin (jalan sore, kopi pagi)", "Minggu 3 — Praktikkan hadir penuh: satu percakapan sehari tanpa ponsel", "Minggu 4 — Evaluasi: relasi mana yang butuh lebih banyak kehadiranmu?"],
      },
    },
    GFT: {
      monogram: "HD", name: "Hadiah",
      tagline: "Cinta yang bisa digenggam dan dikenang.",
      desc: "Bagimu, hadiah bukan soal harga — melainkan bukti bahwa seseorang memikirkanmu saat kamu tak di sana. Setiap pemberian adalah kenangan yang bisa disentuh, simbol bahwa kamu diingat.",
      premium: {
        strengths: ["Sangat perhatian pada kesukaan orang lain", "Pemberi hadiah yang penuh pemikiran", "Menghargai simbol dan kenangan", "Membuat orang merasa diingat"],
        weaknesses: ["Bisa disalahpahami sebagai materialistis", "Mudah kecewa saat momen penting terlupakan", "Menyimpan terlalu banyak barang bermakna"],
        careers: ["Kurasi & retail yang personal", "Event & gifting specialist", "Desain produk dan kriya", "Hospitality yang berkesan"],
        relationship: "Jelaskan pada pasanganmu bahwa bagimu hadiah = perhatian, bukan harga. Bunga lima ribu yang tepat momen mengalahkan gadget mahal yang asal beli. Bantu mereka dengan memberi contoh, bukan menunggu ditebak.",
        communication: "Kamu 'berbicara' lewat benda — kartu kecil, oleh-oleh, kejutan. Pastikan orang memahami niat di baliknya, dan belajar juga membaca bahasa cinta orang lain yang berbeda darimu.",
        workStyle: "Kamu jeli merayakan pencapaian tim dengan tanda mata yang berkesan — kekuatan budaya kerja yang langka. Manfaatkan kejelianmu pada detail preferensi orang.",
        wellbeing: "Waspadai belanja emosional saat sedih. Kenangan tak harus dibeli — dokumentasikan momen lewat foto dan jurnal juga bisa mengisi kebutuhanmu akan simbol.",
        tips: ["Buat daftar tanggal penting dan pasang pengingat untuk orang tersayang", "Komunikasikan preferensimu alih-alih berharap ditebak", "Rayakan momen kecil dengan simbol sederhana, tak perlu menunggu momen besar"],
        actionPlan: ["Minggu 1 — Catat tanggal & kesukaan penting orang-orang terdekatmu", "Minggu 2 — Beri satu kejutan kecil penuh pemikiran pada seseorang", "Minggu 3 — Sortir benda kenanganmu: simpan yang bermakna, relakan sisanya", "Minggu 4 — Sampaikan pada orang terdekat apa jenis 'hadiah' yang paling berarti bagimu"],
      },
    },
    SRV: {
      monogram: "TP", name: "Tindakan Pelayanan",
      tagline: "Bagimu, 'aku sayang kamu' berbentuk tindakan.",
      desc: "Kata-kata itu murah — yang mahal adalah tangan yang turun membantu. Kamu merasa paling dicintai saat seseorang meringankan bebanmu tanpa diminta, dan begitulah caramu mencintai balik.",
      premium: {
        strengths: ["Penolong alami yang bisa diandalkan", "Melihat kebutuhan sebelum diminta", "Cinta yang dibuktikan, bukan diucapkan", "Kontributor tim yang nyata"],
        weaknesses: ["Bisa kelelahan karena terus melayani", "Diam-diam kecewa saat bantuannya tak dibalas", "Sulit meminta tolong untuk dirinya sendiri"],
        careers: ["Kesehatan & keperawatan", "Operasional & support yang menjadi tulang punggung tim", "Layanan komunitas & kemanusiaan", "Manajemen rumah tangga & fasilitas"],
        relationship: "Sadari bahwa pasanganmu mungkin tak membaca bantuanmu sebagai cinta — katakan juga dengan kata-kata sesekali. Dan izinkan dirimu dibantu; menerima adalah bagian dari keintiman.",
        communication: "Aksimu berbicara keras, tapi tak semua orang mendengarnya. Sesekali beri label pada tindakanmu: 'aku kerjakan ini karena sayang kamu' — kalimat kecil yang mengubah segalanya.",
        workStyle: "Kamu adalah rekan yang menyelamatkan tenggat dan menambal lubang tanpa diminta. Hati-hati: kebaikanmu bisa dimanfaatkan. Belajar membedakan membantu dan diperalat.",
        wellbeing: "Kamu memberi sampai lupa mengisi ulang. Melayani diri sendiri bukan egois — kamu tak bisa menuang dari teko kosong.",
        tips: ["Latih meminta bantuan minimal sekali seminggu", "Katakan 'tidak' pada permintaan yang melebihi kapasitasmu", "Sampaikan perasaan di balik tindakanmu dengan kata-kata"],
        actionPlan: ["Minggu 1 — Minta satu bantuan kecil dan terima tanpa rasa bersalah", "Minggu 2 — Tolak satu permintaan yang melebihi kapasitasmu", "Minggu 3 — Ucapkan niat di balik satu tindakan kasihmu", "Minggu 4 — Lakukan satu 'tindakan pelayanan' untuk dirimu sendiri"],
      },
    },
    TCH: {
      monogram: "SF", name: "Sentuhan Fisik",
      tagline: "Kedekatan yang paling nyata adalah yang terasa.",
      desc: "Pelukan yang erat menyampaikan apa yang tak sanggup diucapkan kata-kata. Bagimu, kehadiran fisik — genggaman, rangkulan, duduk berdampingan — adalah saluran cinta yang paling jujur.",
      premium: {
        strengths: ["Kehangatan yang menenangkan orang", "Peka terhadap bahasa tubuh", "Membangun rasa aman lewat kehadiran", "Ekspresif dan tulus dalam kedekatan"],
        weaknesses: ["Jarak jauh terasa lebih berat darimu", "Bisa salah membaca batas kenyamanan orang lain", "Kesepian fisik berdampak besar pada suasana hatimu"],
        careers: ["Terapi fisik & kesehatan", "Perawatan & pendampingan", "Olahraga & kebugaran", "Pekerjaan tim yang erat dan kolaboratif"],
        relationship: "Sampaikan bahwa sentuhan adalah kebutuhanmu, bukan sekadar kesukaan — pelukan sebelum berangkat kerja bisa mengubah harimu. Hormati juga pasangan yang bahasa cintanya berbeda.",
        communication: "Kamu membaca dan berbicara lewat bahasa tubuh. Di lingkungan profesional, salurkan lewat jabat tangan hangat, kontak mata, dan kehadiran fisik yang penuh — selalu dengan menghormati batas orang lain.",
        workStyle: "Kamu bekerja paling baik dekat dengan timmu secara fisik — kerja jarak jauh penuh layar terasa hampa. Bila remote, imbangi dengan pertemuan tatap muka berkala.",
        wellbeing: "Sentuhan menurunkan stresmu secara nyata. Saat jauh dari orang tersayang, olahraga, pijat, atau memeluk hewan peliharaan bisa membantu mengisi kekosongan itu.",
        tips: ["Komunikasikan kebutuhan sentuhanmu pada orang terdekat", "Hormati batas: tanya sebelum menyentuh orang yang belum akrab", "Saat LDR, jadwalkan pertemuan fisik yang bisa dinanti"],
        actionPlan: ["Minggu 1 — Sampaikan pada orang terdekat bahwa sentuhan adalah bahasa cintamu", "Minggu 2 — Mulai ritual kecil: pelukan pagi atau salam hangat", "Minggu 3 — Tambah satu aktivitas fisik yang menenangkan (olahraga/pijat)", "Minggu 4 — Rencanakan pertemuan dengan orang tersayang yang jauh"],
      },
    },
  };

  window.TESTS = window.TESTS || {};
  window.TESTS["bahasacinta"] = {
    id: "bahasacinta",
    title: "Tes Bahasa Cinta",
    short: "Bahasa Cinta",
    tagline: "Bagaimana caramu paling terasa dicintai?",
    productName: "Laporan Premium Bahasa Cinta",
    price: 49000,
    priceStrike: 99000,
    greeting: "Bayangkan orang-orang terdekatmu saat menjawab — pasangan, keluarga, atau sahabat.",
    questions: BC_QUESTIONS,
    likert: BC_LIKERT,
    computeScores: bcScores,
    getResult: function (scores) {
      const order = ["AFR", "QT", "GFT", "SRV", "TCH"];
      const sorted = order.slice().sort(function (a, b) { return scores[b] - scores[a]; });
      const top = sorted[0], second = sorted[1];
      const arch = BC_ARCHETYPES[top];

      const dimensionInsights = order.map(function (d) {
        const band = window.psiBand(scores[d]);
        return {
          name: BC_DIMS[d].name, en: BC_DIMS[d].en, pct: scores[d],
          band: band.label, text: BC_DIM_BANDS[d][band.key],
        };
      });

      const summary =
        "Bahasa cinta utamamu adalah " + BC_DIMS[top].name + " (" + scores[top] + "%), " +
        "disusul " + BC_DIMS[second].name + " (" + scores[second] + "%) sebagai bahasa keduamu. " +
        "Memahami keduanya — dan bahasa orang-orang terdekatmu — adalah kunci relasi yang saling mengisi. " +
        "Laporan di bawah menguraikan cara menggunakannya dalam hubungan, keluarga, dan pertemanan.";

      return {
        monogram: arch.monogram,
        name: arch.name,
        tagline: arch.tagline,
        desc: arch.desc,
        summary: summary,
        barsTitle: "Skor lima bahasa cintamu",
        bars: order.map(function (d) {
          return { name: BC_DIMS[d].name, en: BC_DIMS[d].en, pct: scores[d] };
        }),
        dimensionInsights: dimensionInsights,
        premium: arch.premium,
      };
    },
  };
})();
