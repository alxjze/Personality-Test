import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  ClipboardList,
  Compass,
  FileText,
  Lock,
  MessageSquareText,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';

const features = [
  { icon: Compass, title: 'Refleksi Karier', text: 'Kenali minat, nilai, dan gaya kerja yang sesuai dengan dirimu lewat pertanyaan reflektif.', to: '/career-reflection' },
  { icon: Bot, title: 'AI Career Assistant', text: 'Dapatkan arahan karier personal yang mempertimbangkan hasil refleksimu.', to: '/career-assistant' },
  { icon: FileText, title: 'CV Reviewer', text: 'Tingkatkan kualitas CV dengan analisis dan saran perbaikan yang spesifik.', to: '/cv-reviewer' },
  { icon: MessageSquareText, title: 'Persiapan Interview', text: 'Latihan menjawab pertanyaan interview dan dapatkan feedback metode STAR.', to: '/interview-preparation' },
];

const steps = [
  { icon: ClipboardList, title: 'Isi Refleksi', text: 'Jawab 37 pertanyaan singkat tentang minat, keterampilan, nilai, dan tujuanmu (±8 menit).' },
  { icon: BarChart3, title: 'Dapatkan Laporan', text: 'Lihat rangkuman kekuatan, preferensi kerja, dan area karier yang bisa dieksplorasi.' },
  { icon: Rocket, title: 'Kembangkan Diri', text: 'Diskusi dengan AI, perbaiki CV, dan latihan interview untuk peran incaranmu.' },
];

const benefits = [
  { icon: Target, title: 'Arah yang lebih jelas', text: 'Ubah kebingungan menjadi daftar peran konkret yang bisa kamu pelajari dan uji.' },
  { icon: TrendingUp, title: 'Rencana pengembangan', text: 'Tahu keterampilan mana yang perlu dilatih lebih dulu, dan langkah kecil untuk memulainya.' },
  { icon: BriefcaseBusiness, title: 'Siap menghadapi rekrutmen', text: 'CV yang lebih relevan dan jawaban interview yang lebih terstruktur.' },
  { icon: ShieldCheck, title: 'Data pribadimu terlindungi', text: 'Persetujuan eksplisit sebelum data dikirim ke AI, dan kamu bisa menghapus datamu kapan saja.' },
];

const testimonials = [
  { quote: 'Membantu banget buat ngertiin minat dan arah karier aku. Laporannya jelas dan relevan!', name: 'Nadya P.', role: 'Mahasiswi Psikologi' },
  { quote: 'Saran perbaikan CV-nya spesifik, jadi aku tahu bagian mana yang harus diubah dulu.', name: 'Raka A.', role: 'Fresh graduate Teknik Informatika' },
  { quote: 'Latihan interview dengan feedback STAR bikin jawabanku lebih runtut dan percaya diri.', name: 'Salsa M.', role: 'Staf administrasi, 1 tahun pengalaman' },
];

export default function LandingPage() {
  useDocumentTitle('');
  const { user } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-surface">
        <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <span className="chip bg-white text-primary shadow-sm ring-1 ring-primary/15">Psikologi × Karier × Teknologi</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl">
              Kenali Potensimu.
              <br />
              <span className="text-primary">Bangun Kariermu.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/80 sm:text-lg">
              Temukan arah karier, tingkatkan kualitas CV, dan persiapkan dirimu menghadapi dunia kerja dengan pendekatan psikologi dan AI.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/career-reflection" className={buttonClass('primary', 'lg')}>
                Mulai Eksplorasi Karier <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a href="#fitur" className={buttonClass('secondary', 'lg')}>Pelajari Fitur</a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Lock className="h-4 w-4" aria-hidden /> Coba refleksi tanpa membuat akun.
            </p>
          </div>

          {/* Product preview (illustrative UI, not real user data) */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sky/30 blur-3xl" />
            <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="card relative p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-navy">Laporan Refleksi Karier</p>
                <span className="chip bg-primary-50 text-primary">Contoh tampilan</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">Kamu cenderung analitis, suka memecahkan masalah, dan tertarik pada pengembangan manusia.</p>
              <div className="mt-5 space-y-3">
                {[
                  ['People & Psychology', 84],
                  ['Technology & Data', 76],
                  ['Research & Education', 71],
                ].map(([name, score]) => (
                  <div key={name as string}>
                    <div className="mb-1 flex justify-between text-xs font-semibold"><span>{name}</span><span className="text-primary">{score}</span></div>
                    <div className="h-2 rounded-full bg-primary-50"><div className="h-2 rounded-full bg-primary" style={{ width: `${score}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface p-3"><p className="text-xs text-muted">Kekuatan</p><p className="text-sm font-bold text-navy">Empati, Analitis</p></div>
                <div className="rounded-xl bg-surface p-3"><p className="text-xs text-muted">Nilai utama</p><p className="text-sm font-bold text-navy">Dampak sosial</p></div>
              </div>
            </div>
            <div className="absolute -left-5 -top-4 hidden rounded-xl bg-white px-3 py-2 text-xs font-semibold text-navy shadow-lift sm:flex sm:items-center sm:gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Minat & Potensi
            </div>
            <div className="absolute -bottom-5 right-6 hidden rounded-xl bg-white px-3 py-2 text-xs font-semibold text-navy shadow-lift sm:flex sm:items-center sm:gap-2">
              <FileText className="h-4 w-4 text-primary" /> CV & Profesional
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="container-page scroll-mt-20 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold">Semua yang kamu butuhkan untuk melangkah</h2>
          <p className="mt-3 text-muted">Empat alat yang saling terhubung — dari mengenal diri hingga siap wawancara.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, to }) => (
            <Link key={title} to={to} className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary"><Icon className="h-6 w-6" aria-hidden /></div>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Buka <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-extrabold">Bagaimana cara kerjanya?</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl bg-surface p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white"><Icon className="h-6 w-6" aria-hidden /></div>
                  <span className="text-sm font-bold text-primary">Langkah {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold">Manfaat untuk pengembangan kariermu</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Psikologia Career dirancang untuk mahasiswa, fresh graduate, dan profesional di awal karier yang ingin melangkah dengan lebih yakin.
              Semua hasil diposisikan sebagai panduan eksplorasi — keputusan tetap ada di tanganmu.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-5">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (sample content, clearly labelled) */}
      <section className="bg-white py-16">
        <div className="container-page">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-extrabold">Apa kata mereka</h2>
            <span className="chip mt-3 bg-amber-50 text-amber-800 ring-1 ring-amber-200">Contoh testimoni — ilustrasi, bukan ulasan pengguna nyata</span>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="card flex flex-col p-6">
                <Quote className="h-6 w-6 text-sky" aria-hidden />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-bold text-navy">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-12 text-center sm:px-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/40 blur-3xl" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white">Siap mengenal potensimu?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">Mulai dari refleksi singkat. Gratis, dan kamu bisa menyimpan hasilnya kapan saja.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/career-reflection" className={buttonClass('white', 'lg')}>Mulai Eksplorasi Karier</Link>
              {!user && <Link to="/register" className={buttonClass('outlineLight', 'lg')}>Buat Akun</Link>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
