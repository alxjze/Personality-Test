// Bank soal Big Five (OCEAN) — 20 pertanyaan, 4 per dimensi.
// dim: O (Openness), C (Conscientiousness), E (Extraversion), A (Agreeableness), N (Neuroticism)
// reverse: true berarti skor dibalik (6 - jawaban)
const QUESTIONS = [
  // Openness
  { dim: "O", reverse: false, text: "Saya senang mencoba hal-hal baru dan keluar dari zona nyaman." },
  { dim: "O", reverse: false, text: "Saya sering memikirkan ide-ide abstrak atau imajinatif." },
  { dim: "O", reverse: true,  text: "Saya lebih suka rutinitas yang sudah pasti daripada perubahan." },
  { dim: "O", reverse: false, text: "Saya tertarik pada seni, musik, atau tulisan yang menggugah." },
  // Conscientiousness
  { dim: "C", reverse: false, text: "Saya menyelesaikan tugas dengan teliti sampai tuntas." },
  { dim: "C", reverse: false, text: "Saya membuat rencana dan menaatinya." },
  { dim: "C", reverse: true,  text: "Saya sering menunda pekerjaan yang penting." },
  { dim: "C", reverse: false, text: "Barang-barang dan jadwal saya tertata rapi." },
  // Extraversion
  { dim: "E", reverse: false, text: "Saya merasa berenergi setelah berkumpul dengan banyak orang." },
  { dim: "E", reverse: false, text: "Saya mudah memulai percakapan dengan orang baru." },
  { dim: "E", reverse: true,  text: "Saya lebih memilih menghabiskan waktu sendirian daripada di keramaian." },
  { dim: "E", reverse: false, text: "Saya nyaman menjadi pusat perhatian." },
  // Agreeableness
  { dim: "A", reverse: false, text: "Saya mudah berempati dengan perasaan orang lain." },
  { dim: "A", reverse: false, text: "Saya senang membantu orang lain tanpa pamrih." },
  { dim: "A", reverse: true,  text: "Saya cenderung mengutamakan kepentingan saya di atas orang lain." },
  { dim: "A", reverse: false, text: "Orang-orang menganggap saya hangat dan mudah didekati." },
  // Neuroticism
  { dim: "N", reverse: false, text: "Saya mudah merasa cemas atau khawatir." },
  { dim: "N", reverse: false, text: "Suasana hati saya sering berubah-ubah." },
  { dim: "N", reverse: true,  text: "Saya tetap tenang meski berada di bawah tekanan." },
  { dim: "N", reverse: false, text: "Saya sering merasa kewalahan oleh masalah sehari-hari." },
];

const LIKERT_OPTIONS = [
  { value: 1, label: "Sangat tidak setuju" },
  { value: 2, label: "Tidak setuju" },
  { value: 3, label: "Netral" },
  { value: 4, label: "Setuju" },
  { value: 5, label: "Sangat setuju" },
];

const DIMENSIONS = {
  O: { name: "Keterbukaan", en: "Openness" },
  C: { name: "Kedisiplinan", en: "Conscientiousness" },
  E: { name: "Ekstraversi", en: "Extraversion" },
  A: { name: "Keramahan", en: "Agreeableness" },
  N: { name: "Stabilitas Emosi", en: "Emotional Stability" },
};

// Hitung skor 0-100 per dimensi dari array jawaban (1-5, index sesuai QUESTIONS).
function computeScores(answers) {
  const sums = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  QUESTIONS.forEach((q, i) => {
    let v = answers[i];
    if (v == null) return;
    if (q.reverse) v = 6 - v;
    sums[q.dim] += v;
    counts[q.dim] += 1;
  });
  const scores = {};
  for (const dim of Object.keys(sums)) {
    // rata-rata 1-5 -> 0-100
    const avg = counts[dim] ? sums[dim] / counts[dim] : 3;
    let pct = Math.round(((avg - 1) / 4) * 100);
    // Neuroticism ditampilkan sebagai Stabilitas Emosi (dibalik)
    if (dim === "N") pct = 100 - pct;
    scores[dim] = pct;
  }
  return scores;
}

// Arketipe ditentukan dari dimensi dengan skor tertinggi.
const ARCHETYPES = {
  O: { initial: "V", name: "Sang Visioner", tagline: "Penjelajah ide yang tak pernah berhenti bertanya \"bagaimana jika?\"",
       desc: "Kamu digerakkan oleh rasa ingin tahu. Ide baru, sudut pandang baru, dan pengalaman baru adalah bahan bakarmu. Kamu melihat kemungkinan di tempat orang lain melihat kebuntuan." },
  C: { initial: "A", name: "Sang Arsitek", tagline: "Perencana ulung yang mengubah tujuan menjadi kenyataan.",
       desc: "Kamu adalah orang yang bisa diandalkan. Disiplin, terstruktur, dan berorientasi hasil — ketika kamu berkomitmen pada sesuatu, hal itu hampir pasti selesai." },
  E: { initial: "G", name: "Sang Penggerak", tagline: "Sumber energi yang menghidupkan setiap ruangan.",
       desc: "Kamu tumbuh lewat koneksi dengan orang lain. Antusiasmemu menular, dan kamu punya bakat alami menggerakkan orang menuju tujuan bersama." },
  A: { initial: "J", name: "Sang Penjaga", tagline: "Hati yang hangat, tempat orang lain merasa aman.",
       desc: "Empati adalah kekuatan supermu. Kamu membaca perasaan orang dengan mudah, membangun kepercayaan dengan cepat, dan menjadi perekat dalam setiap kelompok." },
  N: { initial: "S", name: "Sang Penyeimbang", tagline: "Tenang di tengah badai, jangkar bagi sekitarnya.",
       desc: "Ketenanganmu adalah aset langka. Di saat orang lain panik, kamu berpikir jernih — membuatmu andal dalam krisis dan menenangkan bagi orang-orang di sekitarmu." },
};

function getArchetype(scores) {
  let best = "O", bestVal = -1;
  for (const dim of Object.keys(scores)) {
    if (scores[dim] > bestVal) { bestVal = scores[dim]; best = dim; }
  }
  return { dim: best, ...ARCHETYPES[best] };
}

// Konten premium per dimensi dominan.
const PREMIUM_CONTENT = {
  O: {
    strengths: ["Kreativitas dan pemikiran orisinal", "Cepat beradaptasi dengan perubahan", "Mampu menghubungkan ide lintas bidang"],
    weaknesses: ["Mudah bosan dengan rutinitas", "Kadang sulit menyelesaikan apa yang dimulai", "Bisa terlihat 'melayang' bagi orang praktis"],
    careers: ["Desainer produk / UX", "Peneliti & akademisi", "Penulis / content creator", "Entrepreneur & inovator"],
    relationship: "Dalam hubungan, kamu butuh pasangan yang menghargai kebebasan berpikirmu. Percakapan mendalam dan pengalaman baru bersama adalah bahasa cintamu. Hati-hati: rutinitas bukan musuh — kadang justru fondasi.",
    tips: ["Pasangkan ide besarmu dengan satu kebiasaan eksekusi harian", "Selesaikan satu proyek sebelum memulai yang baru", "Cari rekan kerja bertipe terstruktur sebagai penyeimbang"],
  },
  C: {
    strengths: ["Disiplin dan konsistensi tinggi", "Dapat diandalkan dalam tenggat waktu", "Perencanaan jangka panjang yang matang"],
    weaknesses: ["Cenderung perfeksionis", "Sulit fleksibel saat rencana berubah", "Bisa terlalu keras pada diri sendiri"],
    careers: ["Manajer proyek", "Akuntan / analis keuangan", "Insinyur & arsitek", "Operasional & logistik"],
    relationship: "Kamu menunjukkan cinta lewat tindakan nyata dan komitmen. Pasanganmu akan selalu merasa aman — tapi ingat, spontanitas sesekali membuat hubungan tetap hidup.",
    tips: ["Jadwalkan waktu 'tanpa rencana' setiap minggu", "Latih menerima hasil 'cukup baik' untuk hal kecil", "Delegasikan — tidak semua harus kamu kontrol"],
  },
  E: {
    strengths: ["Komunikasi dan networking alami", "Energi yang menular ke tim", "Berani mengambil inisiatif sosial"],
    weaknesses: ["Sulit bekerja lama dalam kesendirian", "Kadang berbicara sebelum berpikir", "Butuh validasi eksternal"],
    careers: ["Sales & business development", "Public relations", "Event & community manager", "Pengajar / trainer"],
    relationship: "Kamu ekspresif dan hangat dalam hubungan. Pastikan pasanganmu yang lebih pendiam tetap punya ruang — mendengarkan adalah bentuk perhatian tertinggimu.",
    tips: ["Sisihkan waktu refleksi tanpa gadget setiap hari", "Latih mendengarkan aktif: tanya dulu, cerita kemudian", "Salurkan energimu ke satu komunitas yang bermakna"],
  },
  A: {
    strengths: ["Empati dan kepekaan sosial tinggi", "Pembangun kepercayaan yang alami", "Mediator konflik yang efektif"],
    weaknesses: ["Sulit berkata 'tidak'", "Cenderung memendam kebutuhan sendiri", "Mudah dimanfaatkan pihak lain"],
    careers: ["Psikolog / konselor", "Human resources", "Perawat & tenaga kesehatan", "Customer success"],
    relationship: "Kamu pasangan yang penuh perhatian dan pengertian. Tantanganmu: menyuarakan kebutuhanmu sendiri. Hubungan sehat butuh dua arah — kamu juga berhak didengar.",
    tips: ["Latih mengatakan 'tidak' pada permintaan kecil dulu", "Jadwalkan waktu khusus untuk kebutuhanmu sendiri", "Tuliskan batasanmu dan komunikasikan dengan tenang"],
  },
  N: {
    strengths: ["Tenang dan berpikir jernih di bawah tekanan", "Konsisten secara emosional", "Sumber stabilitas bagi tim"],
    weaknesses: ["Bisa terlihat datar atau kurang antusias", "Kadang mengabaikan sinyal stres diri sendiri", "Sulit memahami reaksi emosional orang lain"],
    careers: ["Dokter & tenaga medis darurat", "Pilot / air traffic controller", "Manajer krisis", "Analis risiko"],
    relationship: "Ketenanganmu menenangkan pasangan, tapi jangan sampai disalahartikan sebagai cuek. Belajar mengekspresikan perasaan secara verbal akan memperdalam hubunganmu.",
    tips: ["Ceritakan perasaanmu secara rutin, meski terasa 'biasa saja'", "Validasi emosi orang lain sebelum memberi solusi", "Tetap jaga ritual pengelolaan stres — jangan tunggu penuh"],
  },
};

// ===== Registry multi-tes =====
// Setiap tes mengekspos antarmuka seragam yang dipakai engine (test.js, result.js, checkout.js).
window.TESTS = window.TESTS || {};
window.TESTS["bigfive"] = {
  id: "bigfive",
  title: "Tes Kepribadian Big Five",
  short: "Big Five (OCEAN)",
  tagline: "Kenali lima dimensi utama kepribadianmu.",
  productName: "Laporan Premium Big Five",
  price: 49000,
  priceStrike: 99000,
  greeting: "Tidak ada jawaban benar atau salah — jawablah apa adanya.",
  questions: QUESTIONS,
  likert: LIKERT_OPTIONS,
  computeScores: computeScores,
  getResult: function (scores) {
    const arch = getArchetype(scores);
    return {
      monogram: arch.initial,
      name: arch.name,
      tagline: arch.tagline,
      desc: arch.desc,
      barsTitle: "Skor lima dimensi kepribadianmu",
      bars: ["O", "C", "E", "A", "N"].map(function (d) {
        return { name: DIMENSIONS[d].name, en: DIMENSIONS[d].en, pct: scores[d] };
      }),
      premium: PREMIUM_CONTENT[arch.dim],
    };
  },
};
