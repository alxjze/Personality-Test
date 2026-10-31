import { useEffect, useState } from 'react';
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
  Play,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { DeskIllustration, HeroPerson } from '@/components/Illustrations';
import { FaqAccordion, ToolShowcase } from '@/components/ToolShowcase';
import { useDocumentTitle } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/format';

const chips = [
  { icon: Target, label: 'Minat & Potensi', pos: 'left-[30%] top-[6%]', delay: '0s' },
  { icon: BriefcaseBusiness, label: 'Arah Karier', pos: 'left-[18%] top-[24%]', delay: '1.2s' },
  { icon: FileText, label: 'CV & Profesional', pos: 'left-[6%] top-[42%]', delay: '2.1s' },
  { icon: MessageSquareText, label: 'Persiapan Interview', pos: 'left-0 top-[60%]', delay: '0.6s' },
];

const features = [
  { icon: Compass, title: 'Refleksi Karier', text: 'Kenali minat, nilai, dan gaya kerja yang sesuai dengan dirimu.', to: '/career-reflection' },
  { icon: Sparkles, title: 'AI Career Assistant', text: 'Dapatkan arahan karier personal berbasis AI.', to: '/career-assistant' },
  { icon: FileText, title: 'CV Reviewer', text: 'Tingkatkan kualitas CV-mu dengan analisis dan saran perbaikan.', to: '/cv-reviewer' },
  { icon: MessageSquareText, title: 'Persiapan Interview', text: 'Latihan interview, dapatkan feedback, dan tingkatkan kepercayaan dirimu.', to: '/interview-preparation' },
];

const steps = [
  { icon: ClipboardList, title: 'Isi Refleksi', text: 'Jawab beberapa pertanyaan tentang dirimu (±8 menit).' },
  { icon: BarChart3, title: 'Dapatkan Laporan', text: 'Lihat rangkuman potensi dan arah karier yang sesuai.' },
  { icon: Rocket, title: 'Kembangkan Diri', text: 'Gunakan AI, review CV, dan latihan interview.' },
];

const testimonials = [
  { quote: 'Membantu banget buat ngertiin minat dan arah karier aku. Laporannya jelas dan relevan!', name: 'Nadya P.', role: 'Mahasiswi Psikologi' },
  { quote: 'Saran perbaikan CV-nya spesifik, jadi aku tahu bagian mana yang harus diubah dulu.', name: 'Raka A.', role: 'Fresh graduate Teknik Informatika' },
  { quote: 'Latihan interview dengan feedback STAR bikin jawabanku lebih runtut dan percaya diri.', name: 'Salsa M.', role: 'Staf administrasi, 1 tahun pengalaman' },
];

function TestimonialBand() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % testimonials.length), 6000);
    return () => window.clearInterval(t);
  }, [paused]);
  const t = testimonials[i];
  return (
    <section
      aria-labelledby="testimoni-title"
      className="band-blue relative overflow-hidden rounded-4xl px-6 py-10 text-white sm:px-12 sm:py-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-reveal
    >
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky/30 blur-3xl" aria-hidden />
      <div className="relative grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="testimoni-title" className="text-lg font-bold text-white/90">Cerita mereka</h2>
            <span className="chip bg-white/15 text-white ring-1 ring-white/25">Contoh testimoni — ilustrasi, bukan ulasan pengguna nyata</span>
          </div>
          <figure className="mt-5" aria-live="polite">
            <Quote className="h-8 w-8 text-sky" aria-hidden />
            <blockquote key={i} className="mt-3 max-w-xl animate-fade-up text-xl font-bold leading-snug sm:text-2xl">“{t.quote}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-extrabold text-primary">{t.name.charAt(0)}</span>
              <span>
                <span className="block font-bold">{t.name}</span>
                <span className="block text-sm text-white/75">{t.role}</span>
              </span>
            </figcaption>
          </figure>
          <div className="mt-6 flex gap-2" role="group" aria-label="Pilih testimoni">
            {testimonials.map((x, idx) => (
              <button
                key={x.name}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Testimoni ${x.name}`}
                aria-pressed={idx === i}
                className={cn('h-2.5 rounded-full transition-all', idx === i ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70')}
              />
            ))}
          </div>
        </div>
        <DeskIllustration className="mx-auto w-full max-w-sm animate-float-slow" />
      </div>
    </section>
  );
}

export default function LandingPage() {
  useDocumentTitle('');
  const { user } = useAuth();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-wash relative overflow-hidden">
        <div className="container-page grid items-center gap-10 pb-24 pt-12 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:pb-32">
          <div className="animate-fade-up">
            <span className="chip bg-primary-100/80 text-navy">Psikologi <span className="text-primary">×</span> Karier <span className="text-primary">×</span> Teknologi</span>
            <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[3.9rem] lg:[&>span]:whitespace-nowrap">
              <span className="block">Kenali Potensimu.</span>
              <span className="block text-primary">Bangun Kariermu.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/80 sm:text-lg">
              Temukan arah karier, tingkatkan kualitas CV, dan persiapkan dirimu menghadapi dunia kerja dengan pendekatan psikologi dan AI.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/career-reflection" className={buttonClass('primary', 'lg')}>
                Mulai Eksplorasi Karier <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a href="#cara-kerja" className={buttonClass('secondary', 'lg')}>
                <Play className="h-4 w-4 fill-primary text-primary" aria-hidden /> Lihat Cara Kerja
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted">
              <Lock className="h-4 w-4" aria-hidden /> Coba refleksi tanpa membuat akun.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] animate-scale-in lg:ml-auto">
            <HeroPerson className="ml-auto w-[78%] drop-shadow-xl sm:w-[72%]" />
            {chips.map(({ icon: Icon, label, pos, delay }) => (
              <span
                key={label}
                className={cn('absolute hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-chip ring-1 ring-primary/10 animate-float sm:inline-flex', pos)}
                style={{ animationDelay: delay }}
                aria-hidden
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-50 text-primary"><Icon className="h-4 w-4" /></span>
                {label}
              </span>
            ))}
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:hidden" aria-hidden>
              {chips.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-sm ring-1 ring-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />{label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (overlapping the hero) ───────────────── */}
      <section id="fitur" aria-labelledby="fitur-title" className="container-page relative z-10 -mt-16 scroll-mt-24">
        <h2 id="fitur-title" className="sr-only">Fitur Psikologia Career</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, to }, idx) => (
            <Link
              key={title}
              to={to}
              data-reveal
              data-reveal-delay={idx * 80}
              className={cn('card card-hover group flex flex-col p-6', idx % 2 === 1 && 'lg:translate-y-6')}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary transition group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Buka <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="container-page scroll-mt-24 pt-28">
        <div className="max-w-2xl" data-reveal>
          <h2 id="cara-kerja-title" className="text-3xl font-extrabold sm:text-4xl">Bagaimana cara kerjanya?</h2>
          <p className="mt-3 text-muted">Tiga langkah sederhana dari mengenal diri sampai siap melangkah.</p>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="contents">
              <div className="flex gap-4 md:flex-col" data-reveal data-reveal-delay={i * 120}>
                <div className="relative w-fit">
                  <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-primary shadow-card ring-1 ring-primary/10">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-white ring-4 ring-surface" aria-hidden>{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold md:mt-2">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden items-center pt-5 text-primary/40 md:flex" aria-hidden>
                  <svg width="72" height="16" viewBox="0 0 72 16" fill="none"><path d="M2 8h62m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 6" /></svg>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* ── Product showcase (auto-advancing tabs) ─────────── */}
      <section aria-labelledby="showcase-title" className="container-page pt-28">
        <div className="mb-10 max-w-2xl" data-reveal>
          <h2 id="showcase-title" className="text-3xl font-extrabold sm:text-5xl">Satu tempat untuk setiap langkah kariermu</h2>
          <p className="mt-4 text-lg text-muted">Dari mengenal diri hingga siap wawancara — semuanya saling terhubung.</p>
        </div>
        <div data-reveal><ToolShowcase /></div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <div className="container-page pt-24">
        <TestimonialBand />
      </div>

      {/* ── Benefits (asymmetric bento) ──────────────────── */}
      <section aria-labelledby="manfaat-title" className="container-page pt-24">
        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <div className="flex flex-col justify-between rounded-4xl bg-navy p-8 text-white lg:row-span-2" data-reveal>
            <div>
              <h2 id="manfaat-title" className="text-3xl font-extrabold text-white sm:text-4xl">Manfaat untuk perjalanan kariermu</h2>
              <p className="mt-4 leading-relaxed text-white/75">
                Dirancang untuk mahasiswa, fresh graduate, dan profesional di awal karier. Semua hasil adalah panduan eksplorasi — keputusan tetap di tanganmu.
              </p>
            </div>
            <Link to="/career-reflection" className={buttonClass('white', 'md', 'mt-8 w-fit')}>Mulai sekarang <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {[
            { icon: Target, title: 'Arah yang lebih jelas', text: 'Ubah kebingungan menjadi daftar peran konkret untuk dipelajari dan diuji.', tone: 'bg-primary-50' },
            { icon: TrendingUp, title: 'Rencana pengembangan', text: 'Tahu keterampilan mana yang perlu dilatih lebih dulu, dan langkah kecil untuk memulainya.', tone: 'bg-white' },
            { icon: Bot, title: 'Pendamping AI', text: 'Tanya kapan saja; asisten memakai hasil refleksimu sebagai konteks.', tone: 'bg-white' },
            { icon: ShieldCheck, title: 'Data pribadimu terlindungi', text: 'Persetujuan eksplisit sebelum data dikirim ke AI, dan kamu bisa menghapusnya kapan saja.', tone: 'bg-primary-50' },
          ].map(({ icon: Icon, title, text, tone }, idx) => (
            <div key={title} className={cn('card card-hover p-6', tone)} data-reveal data-reveal-delay={idx * 80}>
              <div className="icon-tile h-11 w-11"><Icon className="h-5 w-5" aria-hidden /></div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section aria-labelledby="faq-title" className="container-page grid gap-10 pt-28 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-reveal>
          <h2 id="faq-title" className="text-3xl font-extrabold sm:text-5xl">Pertanyaan yang sering diajukan</h2>
          <p className="mt-4 text-muted">Belum menemukan jawabannya? Tanyakan langsung ke AI Career Assistant setelah masuk.</p>
        </div>
        <div data-reveal data-reveal-delay="100"><FaqAccordion /></div>
      </section>

      {/* ── Closing CTA (dark, full-bleed) ───────────────── */}
      <section aria-labelledby="cta-title" className="mt-28 bg-navy">
        <div className="container-page relative overflow-hidden py-20 text-center sm:py-24" data-reveal>
          <div className="absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" aria-hidden />
          <h2 id="cta-title" className="relative text-4xl font-extrabold text-white sm:text-6xl">Siap mengenal potensimu?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/75">Mulai dari refleksi singkat. Gratis, dan kamu bisa menyimpan hasilnya kapan saja.</p>
          <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/career-reflection" className={buttonClass('white', 'lg')}>Mulai Eksplorasi Karier <ArrowRight className="h-5 w-5" /></Link>
            {!user && <Link to="/register" className={buttonClass('outlineLight', 'lg')}>Buat Akun</Link>}
          </div>
        </div>
      </section>
    </>
  );
}
