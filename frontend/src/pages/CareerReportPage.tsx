import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Compass,
  Download,
  Heart,
  HelpCircle,
  Lightbulb,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button, LinkButton } from '@/components/ui/Button';
import { Alert, EmptyState, ProgressBar, Spinner } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/layouts/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useAsync';
import { api, ApiError } from '@/services/api';
import type { ReflectionListItem, ReflectionResult, SavedReflection } from '@/types';
import { cn, formatDate, storage, STORAGE_KEYS } from '@/utils/format';
import { SummitIllustration } from '@/components/Illustrations';

const TAG_TONES = [
  { bg: 'bg-tag-violetBg', text: 'text-tag-violet' },
  { bg: 'bg-tag-blueBg', text: 'text-tag-blue' },
  { bg: 'bg-tag-orangeBg', text: 'text-tag-orange' },
];

function Section({ icon, title, children, className = '' }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-6 sm:p-7 ${className}`} data-reveal>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ScoreRow({ label, score, description }: { label: string; score: number; description?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span className="font-semibold text-navy">{label}</span>
        <span className="font-bold text-primary">{score}</span>
      </div>
      <ProgressBar value={score} label={label} />
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
    </div>
  );
}

export function ReportView({ result }: { result: ReflectionResult }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-6 sm:p-7" data-reveal>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <SummitIllustration className="h-28 w-36 shrink-0" />
            <div>
              <h2 className="text-lg font-bold">Gambaran umum dirimu</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink sm:text-[15px]">{result.summary}</p>
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-surface px-4 py-3 text-xs leading-relaxed text-muted">{result.disclaimer}</p>
        </section>
        <section className="card p-6 sm:p-7" data-reveal data-reveal-delay="100">
          <h2 className="text-lg font-bold">Kecenderungan karier</h2>
          <ul className="mt-4 space-y-2.5">
            {result.career_areas.map((a, i) => (
              <li key={a.id} className={cn('flex items-center justify-between gap-3 rounded-2xl px-4 py-3', TAG_TONES[i % TAG_TONES.length].bg)}>
                <span className={cn('flex items-center gap-2 text-sm font-bold', TAG_TONES[i % TAG_TONES.length].text)}>
                  <Sparkles className="h-4 w-4" aria-hidden />{a.name}
                </span>
                <span className={cn('text-xs font-bold', TAG_TONES[i % TAG_TONES.length].text)}>{a.score}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Fokus 6–12 bulan: <strong className="text-navy">{result.goal.focus_label}</strong></p>
        </section>
      </div>

      <Section icon={<Compass className="h-5 w-5" />} title="Area karier yang dapat dieksplorasi">
        <div className="grid gap-4 lg:grid-cols-3">
          {result.career_areas.map((a, i) => (
            <div key={a.id} className="flex flex-col rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <span className="chip bg-primary-50 text-primary">#{i + 1}</span>
                <span className="text-sm font-bold text-primary">Kecocokan {a.score}/100</span>
              </div>
              <h3 className="mt-3 text-lg font-bold">{a.name}</h3>
              <p className="mt-1 text-sm text-muted">{a.description}</p>
              {a.why.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {a.why.map((w) => (
                    <li key={w} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{w}</li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">Contoh peran</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.example_roles.map((r) => (
                  <span key={r} className="chip bg-surface text-navy ring-1 ring-slate-200">{r}</span>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">Keterampilan untuk dipelajari</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
                {a.skills_to_explore.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
        {result.other_areas.length > 0 && (
          <p className="mt-4 text-xs text-muted">
            Area lain: {result.other_areas.map((a) => `${a.name} (${a.score})`).join(' · ')}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">Skor kecocokan dihitung dari jawaban refleksimu dengan aturan sederhana — gunakan sebagai petunjuk arah, bukan penilaian kemampuan.</p>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={<Sparkles className="h-5 w-5" />} title="Kekuatan yang kamu rasakan">
          {result.strengths.length ? (
            <ul className="space-y-3">
              {result.strengths.map((s) => (
                <li key={s.key} className="rounded-xl bg-surface p-3">
                  <p className="font-semibold text-navy">{s.label}</p>
                  <p className="text-sm text-muted">{s.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Belum ada keterampilan yang kamu nilai menonjol. Pengalaman baru (proyek, organisasi, magang) bisa membantumu mengenali kekuatanmu.</p>
          )}
        </Section>
        <Section icon={<BarChart3 className="h-5 w-5" />} title="Minat aktivitas">
          <div className="space-y-3">
            {result.interests.map((i) => <ScoreRow key={i.key} label={i.label} score={i.score} />)}
          </div>
        </Section>
        <Section icon={<Briefcase className="h-5 w-5" />} title="Preferensi lingkungan kerja">
          <ul className="space-y-2">
            {result.work_preferences.map((p) => (
              <li key={p.key} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-navy">{p.label}.</strong> {p.description}</span></li>
            ))}
          </ul>
        </Section>
        <Section icon={<Heart className="h-5 w-5" />} title="Nilai yang paling penting bagimu">
          <ol className="space-y-2">
            {result.values.map((v, i) => (
              <li key={v.key} className="flex items-center gap-3 text-sm">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary">{i + 1}</span>
                <span className="font-semibold text-navy">{v.label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">Fokus 6–12 bulan: <strong className="text-navy">{result.goal.focus_label}</strong></p>
          {result.goal.text && <p className="mt-1 text-sm italic text-muted">“{result.goal.text}”</p>}
        </Section>
      </div>

      <Section icon={<HelpCircle className="h-5 w-5" />} title="Pertanyaan refleksi lanjutan" className="print-break">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {result.reflection_questions.map((q) => <li key={q}>{q}</li>)}
        </ol>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={<TrendingUp className="h-5 w-5" />} title="Rekomendasi pengembangan diri">
          <ul className="space-y-3">
            {result.development.map((d) => (
              <li key={d.title}>
                <p className="font-semibold text-navy">{d.title}</p>
                <p className="text-sm text-muted">{d.description}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section icon={<Lightbulb className="h-5 w-5" />} title="Langkah selanjutnya">
          <ul className="space-y-4">
            {result.next_steps.map((s) => (
              <li key={s.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-semibold text-navy">{s.title}</p>
                  <p className="text-sm text-muted">{s.description}</p>
                  {s.action && (
                    <Link to={s.action.href} className="no-print mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      {s.action.label} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

interface GuestStored {
  answers: Record<string, number | string>;
  result: ReflectionResult;
  createdAt: string;
}

export default function CareerReportPage() {
  useDocumentTitle('Laporan Refleksi Karier');
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, savePendingReflection } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [report, setReport] = useState<{ result: ReflectionResult; createdAt: string; id?: number; guest: boolean } | null>(null);
  const [history, setHistory] = useState<ReflectionListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const r = await api.get<SavedReflection>(`/reflections/${id}`);
          if (!cancelled) setReport({ result: r.result, createdAt: r.created_at, id: r.id, guest: false });
        } else {
          const guest = storage.get<GuestStored>(STORAGE_KEYS.guestResult);
          if (guest?.result) {
            if (!cancelled) setReport({ result: guest.result, createdAt: guest.createdAt, guest: true });
          } else if (user) {
            const latest = await api.get<SavedReflection | null>('/reflections/latest');
            if (!cancelled) setReport(latest ? { result: latest.result, createdAt: latest.created_at, id: latest.id, guest: false } : null);
          } else if (!cancelled) {
            setReport(null);
          }
        }
        if (user) {
          const list = await api.get<ReflectionListItem[]>('/reflections');
          if (!cancelled) setHistory(list);
        }
      } catch (e) {
        if (!cancelled) setError(e as ApiError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const saveGuest = async () => {
    setSaving(true);
    const newId = await savePendingReflection();
    setSaving(false);
    if (newId) navigate(`/career-report/${newId}?saved=1`, { replace: true });
    else setError(new ApiError('Hasil belum berhasil disimpan. Silakan coba lagi.', 0, 'save_failed'));
  };

  const doDelete = async () => {
    if (confirmDelete === null) return;
    setDeleting(true);
    try {
      await api.del(`/reflections/${confirmDelete}`);
      setHistory((h) => h.filter((x) => x.id !== confirmDelete));
      if (report?.id === confirmDelete) navigate('/career-report', { replace: true });
      setConfirmDelete(null);
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageContainer><Spinner label="Menyiapkan laporan…" /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        icon={<BarChart3 className="h-6 w-6" />}
        title="Laporan Refleksi Karier"
        description={report ? `Berdasarkan jawabanmu pada ${formatDate(report.createdAt, true)}.` : 'Rangkuman hasil refleksi dan rekomendasi eksplorasi karier.'}
        actions={
          report && (
            <>
              <Button variant="secondary" onClick={() => window.print()} icon={<Download className="h-4 w-4" />}>Unduh PDF</Button>
              <LinkButton to="/career-reflection" variant="soft">Isi ulang refleksi</LinkButton>
            </>
          )
        }
      />

      {params.get('saved') && <Alert tone="success" className="no-print mb-6">Hasil refleksi berhasil disimpan ke akunmu.</Alert>}
      {error && <Alert tone="error" className="mb-6">{error.status === 404 ? 'Laporan tidak ditemukan atau bukan milikmu.' : error.message}</Alert>}

      {report?.guest && (
        <Alert tone="info" className="no-print mb-6" title="Hasil ini belum tersimpan">
          Hasil hanya tersimpan sementara di browser ini.{' '}
          {user ? (
            <Button size="sm" className="mt-2" onClick={() => void saveGuest()} loading={saving} icon={<Save className="h-4 w-4" />}>Simpan ke akunku</Button>
          ) : (
            <span className="mt-2 flex flex-wrap gap-2">
              <LinkButton to="/register" size="sm">Daftar & simpan hasil</LinkButton>
              <LinkButton to="/login" size="sm" variant="secondary">Sudah punya akun? Masuk</LinkButton>
            </span>
          )}
        </Alert>
      )}

      {report ? (
        <ReportView result={report.result} />
      ) : (
        !error && (
          <EmptyState
            icon={<Compass className="h-6 w-6" />}
            title="Belum ada laporan"
            description="Selesaikan refleksi karier untuk mendapatkan laporan berisi kekuatan, preferensi kerja, dan area karier yang bisa kamu eksplorasi."
            action={<LinkButton to="/career-reflection">Mulai Refleksi</LinkButton>}
          />
        )
      )}

      {user && history.length > 0 && (
        <section className="no-print mt-10">
          <h2 className="mb-3 text-lg font-bold">Riwayat refleksi</h2>
          <ul className="card divide-y divide-slate-100">
            {history.map((h) => (
              <li key={h.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link to={`/career-report/${h.id}`} className="font-semibold text-navy hover:text-primary">{formatDate(h.created_at, true)}</Link>
                  <p className="text-xs text-muted">{h.top_areas.map((a) => a.name).join(' · ')}</p>
                </div>
                <div className="flex gap-2">
                  {report?.id === h.id && <span className="chip bg-primary-50 text-primary">Sedang dilihat</span>}
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setConfirmDelete(h.id)} icon={<Trash2 className="h-4 w-4" />}>Hapus</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal
        open={confirmDelete !== null}
        title="Hapus hasil refleksi?"
        onClose={() => setConfirmDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button variant="danger" loading={deleting} onClick={() => void doDelete()}>Hapus permanen</Button>
          </>
        }
      >
        Hasil refleksi ini akan dihapus permanen dan tidak dapat dikembalikan.
      </Modal>
    </PageContainer>
  );
}
