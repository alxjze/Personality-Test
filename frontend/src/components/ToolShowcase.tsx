import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Compass, FileText, MessageSquareText, UserRound } from 'lucide-react';
import { buttonClass } from './ui/Button';
import { cn } from '@/utils/format';

/**
 * Auto-advancing tabbed showcase (Squarespace-style "see the product" section).
 * Each panel is a faithful fragment of the real app UI, labelled as a sample view.
 */
const TABS = [
  { id: 'refleksi', icon: Compass, title: 'Refleksi Karier', text: '37 pernyataan singkat tentang minat, keterampilan, nilai, dan tujuanmu. Tersimpan otomatis.', to: '/career-reflection', cta: 'Mulai refleksi' },
  { id: 'laporan', icon: FileText, title: 'Laporan yang personal', text: 'Kekuatan, preferensi kerja, dan tiga area karier untuk dieksplorasi — lengkap dengan langkah berikutnya.', to: '/career-report', cta: 'Lihat contoh alur' },
  { id: 'asisten', icon: Bot, title: 'AI Career Assistant', text: 'Tanya apa saja; asisten memakai hasil refleksimu sebagai konteks.', to: '/career-assistant', cta: 'Coba asisten' },
  { id: 'cv', icon: MessageSquareText, title: 'CV & Interview', text: 'Analisis CV dengan saran spesifik, lalu latihan interview dengan feedback STAR.', to: '/cv-reviewer', cta: 'Review CV' },
] as const;

const DURATION = 6500;

function PanelFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-4xl bg-white p-5 shadow-lift ring-1 ring-primary/10 sm:p-7" data-ui>
      <span className="chip absolute right-4 top-4 bg-primary-50 text-primary">Contoh tampilan</span>
      {children}
    </div>
  );
}

function ReflectionPanel() {
  const rows = [
    ['Menganalisis data atau memecahkan masalah', 4],
    ['Membantu dan berinteraksi dengan orang lain', 5],
    ['Menciptakan ide atau solusi baru', 4],
    ['Mengatur dan merencanakan pekerjaan', 3],
  ] as const;
  return (
    <PanelFrame>
      <p className="text-xs font-semibold text-muted">Refleksi Karier · 3 dari 5</p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-primary-50"><div className="h-full w-3/5 rounded-full bg-primary" /></div>
      <p className="mt-5 text-lg font-bold text-navy">Aktivitas seperti apa yang paling kamu nikmati?</p>
      <ul className="mt-4 space-y-2.5">
        {rows.map(([t, v]) => (
          <li key={t} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2.5">
            <span className="text-xs font-semibold text-ink sm:text-sm">{t}</span>
            <span className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={cn('grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold', n === v ? 'bg-primary text-white' : 'bg-white text-ink ring-1 ring-slate-200')}>{n}</span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}

function ReportPanel() {
  const areas = [
    ['People & Psychology', 84, 'bg-tag-violetBg text-tag-violet'],
    ['Technology & Data', 76, 'bg-tag-blueBg text-tag-blue'],
    ['Business & Management', 68, 'bg-tag-orangeBg text-tag-orange'],
  ] as const;
  return (
    <PanelFrame>
      <p className="text-lg font-bold text-navy">Laporan Refleksi Karier</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">Kamu cenderung analitis, suka memecahkan masalah, dan tertarik pada pengembangan manusia.</p>
      <ul className="mt-4 space-y-2">
        {areas.map(([n, s, tone]) => (
          <li key={n} className={cn('flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-bold', tone)}>
            {n}<span>{s}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-bold text-navy">Langkah selanjutnya</p>
      <ul className="mt-2 space-y-1.5 text-xs text-ink">
        <li>✓ Eksplorasi 2–3 peran yang menarik</li>
        <li>✓ Sesuaikan CV dengan peran incaran</li>
      </ul>
    </PanelFrame>
  );
}

function AssistantPanel() {
  return (
    <PanelFrame>
      <p className="text-lg font-bold text-navy">AI Career Assistant</p>
      <div className="mt-4 space-y-3">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-white">
          Berdasarkan hasil refleksiku, langkah apa yang bisa kuambil untuk masuk ke HR?
        </div>
        <div className="flex gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 text-primary"><Bot className="h-4 w-4" /></span>
          <div className="rounded-2xl rounded-tl-md bg-surface px-4 py-3 text-sm text-ink ring-1 ring-slate-200">
            Minatmu di area People & Psychology cukup kuat. Coba mulai dari:
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">
              <li>Pelajari dasar rekrutmen dan wawancara berbasis kompetensi</li>
              <li>Ambil proyek kecil, misalnya membantu seleksi panitia kampus</li>
            </ol>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-xs text-muted ring-1 ring-slate-200">
          <UserRound className="h-4 w-4" /> Tulis pertanyaan…
        </div>
      </div>
    </PanelFrame>
  );
}

function CvPanel() {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <PanelFrame>
      <p className="text-lg font-bold text-navy">Hasil Analisis CV</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90" aria-hidden>
            <circle cx="36" cy="36" r={r} fill="none" stroke="#EAF2FF" strokeWidth="7" />
            <circle cx="36" cy="36" r={r} fill="none" stroke="#16a34a" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.22} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-xl font-extrabold text-navy">78</span>
        </div>
        <p className="text-sm text-muted">Skor estimasi dari 5 kriteria. CV sudah baik, beberapa area masih bisa ditingkatkan.</p>
      </div>
      <ul className="mt-4 space-y-2">
        {[['Struktur', 17], ['Relevansi', 15], ['Bullet point', 13]].map(([k, v]) => (
          <li key={k as string}>
            <div className="flex justify-between text-xs font-semibold"><span>{k}</span><span className="text-primary">{v}/20</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-primary-50"><div className="h-full rounded-full bg-primary" style={{ width: `${(Number(v) / 20) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}

const PANELS = { refleksi: ReflectionPanel, laporan: ReportPanel, asisten: AssistantPanel, cv: CvPanel };

export function ToolShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % TABS.length), DURATION);
    return () => window.clearTimeout(t);
  }, [active, paused, reduced, tick]);

  const select = (i: number) => {
    setActive(i);
    setTick((x) => x + 1);
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const next = (i + n + TABS.length) % TABS.length;
    select(next);
    tabsRef.current[next]?.focus();
  };

  const tab = TABS[active];
  const Panel = PANELS[tab.id];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <div role="tablist" aria-label="Fitur Psikologia Career" aria-orientation="vertical" className="space-y-2">
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={t.id}
              ref={(el) => { tabsRef.current[i] = el; }}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn('relative w-full overflow-hidden rounded-3xl px-5 py-4 text-left transition duration-300', on ? 'bg-white shadow-card ring-1 ring-primary/10' : 'hover:bg-white/60')}
            >
              <span className="flex items-center gap-3">
                <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition', on ? 'bg-primary text-white' : 'bg-primary-50 text-primary')}><t.icon className="h-5 w-5" aria-hidden /></span>
                <span className={cn('text-lg font-bold transition', on ? 'text-navy' : 'text-ink/60')}>{t.title}</span>
              </span>
              <span className={cn('grid transition-all duration-500', on ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                <span className="overflow-hidden pl-[3.25rem] text-sm leading-relaxed text-muted">{t.text}</span>
              </span>
              {on && !reduced && (
                <span key={`${active}-${tick}-${paused}`} className="absolute inset-x-5 bottom-0 h-0.5 origin-left rounded-full bg-primary/70" style={{ animation: paused ? 'none' : `progress ${DURATION}ms linear forwards`, transform: paused ? 'scaleX(0)' : undefined }} aria-hidden />
              )}
            </button>
          );
        })}
        <Link to={tab.to} className={buttonClass('primary', 'md', 'mt-4')}>{tab.cta} <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="relative">
        <div className="absolute -inset-3 -z-10 rounded-[2.5rem] sm:-inset-6 bg-gradient-to-br from-primary-100 via-primary-50 to-transparent" aria-hidden />
        <div key={tab.id} className="animate-scale-in"><Panel /></div>
      </div>
    </div>
  );
}

const FAQS = [
  ['Apakah refleksi ini tes psikologi?', 'Bukan. Refleksi Karier adalah alat bantu eksplorasi diri, bukan tes psikologi tervalidasi atau diagnosis. Hasilnya titik awal untuk mengeksplorasi pilihan karier.'],
  ['Apakah saya harus membuat akun?', 'Tidak untuk mencoba refleksi. Akun diperlukan untuk menyimpan hasil, memakai AI Career Assistant, CV Reviewer, dan latihan interview.'],
  ['Bagaimana data CV saya digunakan?', 'CV hanya dipakai untuk analisis yang kamu minta, setelah kamu memberi persetujuan. Kamu bisa menghapus hasil review dan seluruh data pribadi kapan saja dari halaman Profil.'],
  ['Apakah Psikologia Career gratis?', 'Ya, versi MVP ini gratis digunakan. Fitur AI dapat memakai paket gratis penyedia AI, sehingga jumlah permintaan per jam dibatasi.'],
  ['Apakah AI selalu benar?', 'Tidak. AI bisa keliru. Gunakan saran AI sebagai bahan pertimbangan, dan diskusikan keputusan penting dengan mentor, konselor karier, atau psikolog.'],
] as const;

export function FaqAccordion() {
  return (
    <div className="divide-y divide-slate-200/80 rounded-4xl bg-white px-2 shadow-card ring-1 ring-slate-900/[0.04] sm:px-4">
      {FAQS.map(([q, a]) => (
        <details key={q} className="group px-4 py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-bold text-navy [&::-webkit-details-marker]:hidden">
            {q}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 text-lg text-primary transition group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <p className="pb-5 pr-10 text-sm leading-relaxed text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
