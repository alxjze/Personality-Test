import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardPaste, FileText, Lightbulb, ListChecks, Target, Trash2, Upload, Wand2, X } from 'lucide-react';
import { Button, LinkButton } from '@/components/ui/Button';
import { Alert, EmptyState, ProgressBar, SimulationBadge, Spinner } from '@/components/ui/Feedback';
import { Checkbox, TextArea, TextInput } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/layouts/AppLayout';
import { useAsync, useDocumentTitle } from '@/hooks/useAsync';
import { api, ApiError } from '@/services/api';
import type { CvReview, CvReviewSummary } from '@/types';
import { cn, formatDate } from '@/utils/format';

const MAX_BYTES = 2 * 1024 * 1024;

function ScoreRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="#EAF2FF" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={score >= 70 ? '#16a34a' : score >= 50 ? '#1467ED' : '#d97706'} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><p className="text-2xl font-extrabold text-navy">{score}</p><p className="-mt-1 text-[11px] text-muted">/100</p></div>
      </div>
    </div>
  );
}

const PRIORITY_STYLE: Record<string, string> = {
  tinggi: 'bg-red-50 text-red-700 ring-red-200',
  sedang: 'bg-amber-50 text-amber-800 ring-amber-200',
  rendah: 'bg-slate-50 text-slate-700 ring-slate-200',
};

export function CvResultView({ review }: { review: CvReview }) {
  const r = review.result;
  const [tab, setTab] = useState<'ringkasan' | 'saran' | 'skill' | 'bullet'>('ringkasan');
  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'saran', label: 'Saran Perbaikan' },
    { id: 'skill', label: 'Relevansi Skill' },
    { id: 'bullet', label: 'Perbaikan Bullet' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ScoreRing score={r.score.overall} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold">Skor estimasi</h2>
              {r.meta?.simulated && <SimulationBadge />}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink">{r.summary}</p>
            <p className="mt-2 text-xs text-muted">{r.score.note}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {r.score.criteria.map((c) => (
            <div key={c.key} className="rounded-xl bg-surface p-3">
              <p className="text-xs font-semibold text-muted">{c.label}</p>
              <p className="mt-1 text-lg font-extrabold text-navy">{c.score}<span className="text-xs font-semibold text-muted">/{c.max}</span></p>
              <ProgressBar value={(c.score / c.max) * 100} className="mt-1.5" label={c.label} />
              {c.note && <p className="mt-2 text-xs text-muted">{c.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn('whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-semibold transition', tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-navy')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-6" role="tabpanel">
          {tab === 'ringkasan' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Kekuatan CV</h3>
                {r.strengths.length ? (
                  <ul className="space-y-2 text-sm">{r.strengths.map((s) => <li key={s} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{s}</li>)}</ul>
                ) : <p className="text-sm text-muted">Tidak ada catatan.</p>}
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Lightbulb className="h-5 w-5 text-primary" />Pertanyaan untuk melengkapi CV</h3>
                {r.questions_for_user.length ? (
                  <ul className="space-y-2 text-sm">{r.questions_for_user.map((q) => <li key={q} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{q}</li>)}</ul>
                ) : <p className="text-sm text-muted">Tidak ada pertanyaan tambahan.</p>}
              </div>
            </div>
          )}
          {tab === 'saran' && (
            r.improvements.length ? (
              <ul className="space-y-3">
                {r.improvements.map((imp, i) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-navy">{imp.area}</span>
                      <span className={cn('chip ring-1', PRIORITY_STYLE[imp.priority])}>Prioritas {imp.priority}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink">{imp.suggestion}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">Tidak ada saran perbaikan.</p>
          )}
          {tab === 'skill' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-bold">Sudah terlihat di CV</h3>
                <div className="flex flex-wrap gap-2">
                  {r.skill_relevance.matched.length ? r.skill_relevance.matched.map((s) => <span key={s} className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">{s}</span>) : <p className="text-sm text-muted">-</p>}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-bold">Belum terlihat / perlu ditonjolkan</h3>
                <div className="flex flex-wrap gap-2">
                  {r.skill_relevance.missing.length ? r.skill_relevance.missing.map((s) => <span key={s} className="chip bg-amber-50 text-amber-800 ring-1 ring-amber-200">{s}</span>) : <p className="text-sm text-muted">-</p>}
                </div>
              </div>
              {r.skill_relevance.note && <p className="text-sm text-muted md:col-span-2">{r.skill_relevance.note}</p>}
              <p className="text-xs text-muted md:col-span-2">Cantumkan keterampilan hanya jika kamu benar-benar memilikinya.</p>
            </div>
          )}
          {tab === 'bullet' && (
            r.bullet_rewrites.length ? (
              <ul className="space-y-4">
                {r.bullet_rewrites.map((b, i) => (
                  <li key={i} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                    <div><p className="text-xs font-bold uppercase text-muted">Sebelum</p><p className="mt-1 text-sm text-ink">{b.original || '-'}</p></div>
                    <div><p className="text-xs font-bold uppercase text-primary">Saran</p><p className="mt-1 text-sm font-medium text-navy">{b.improved}</p></div>
                    {b.reason && <p className="text-xs text-muted md:col-span-2">{b.reason}</p>}
                  </li>
                ))}
                <li className="text-xs text-muted">Bagian dalam [kurung siku] perlu kamu isi dengan data nyata — jangan menambahkan hal yang tidak kamu lakukan.</li>
              </ul>
            ) : <p className="text-sm text-muted">Tidak ada bullet yang dapat ditulis ulang.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CvHistory({ items, onDeleted }: { items: CvReviewSummary[]; onDeleted: (id: number) => void }) {
  const [confirm, setConfirm] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const del = async () => {
    if (confirm === null) return;
    setBusy(true);
    try {
      await api.del(`/cv-reviews/${confirm}`);
      onDeleted(confirm);
      setConfirm(null);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };
  if (!items.length) return <EmptyState icon={<FileText className="h-6 w-6" />} title="Belum ada review CV" description="Hasil analisis CV-mu akan muncul di sini." />;
  return (
    <>
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <ul className="card divide-y divide-slate-100">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 p-4">
            <Link to={`/cv-reviewer/${c.id}`} className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy hover:text-primary">{c.target_job}</p>
              <p className="text-xs text-muted">{formatDate(c.created_at, true)} · {c.source === 'upload' ? `PDF${c.original_filename ? `: ${c.original_filename}` : ''}` : 'Teks ditempel'}</p>
            </Link>
            <div className="flex items-center gap-2">
              {c.simulated && <SimulationBadge />}
              {c.overall_score !== null && <span className="chip bg-primary-50 text-primary">{c.overall_score}/100</span>}
              <button type="button" onClick={() => setConfirm(c.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Hapus review ${c.target_job}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ul>
      <Modal
        open={confirm !== null}
        title="Hapus review CV?"
        onClose={() => setConfirm(null)}
        footer={<><Button variant="secondary" onClick={() => setConfirm(null)}>Batal</Button><Button variant="danger" loading={busy} onClick={() => void del()}>Hapus permanen</Button></>}
      >
        Hasil analisis dan file CV yang tersimpan (jika ada) akan dihapus permanen.
      </Modal>
    </>
  );
}

export function CvReviewerPage() {
  useDocumentTitle('CV Reviewer');
  const navigate = useNavigate();
  const { data: history, setData: setHistory, loading: loadingHistory } = useAsync(() => api.get<CvReviewSummary[]>('/cv-reviews'));
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [jd, setJd] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    setClientErrors((e) => ({ ...e, file: '' }));
    if (!f) return setFile(null);
    if (!f.name.toLowerCase().endsWith('.pdf') || (f.type && f.type !== 'application/pdf')) {
      setClientErrors((e) => ({ ...e, file: 'Format file harus PDF.' }));
      return;
    }
    if (f.size > MAX_BYTES) {
      setClientErrors((e) => ({ ...e, file: 'Ukuran file maksimal 2 MB.' }));
      return;
    }
    setFile(f);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === 'upload' && !file) errs.file = 'Pilih file CV (PDF).';
    if (mode === 'paste' && cvText.trim().length < 150) errs.cv_text = 'Tempel teks CV minimal 150 karakter.';
    if (targetJob.trim().length < 2) errs.target_job = 'Target posisi wajib diisi.';
    if (!consent) errs.consent = 'Persetujuan diperlukan sebelum CV dikirim ke layanan AI.';
    setClientErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setError(null);
    try {
      let review: CvReview;
      if (mode === 'upload' && file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('target_job', targetJob.trim());
        fd.append('job_description', jd.trim());
        fd.append('consent', '1');
        review = await api.post<CvReview>('/cv-reviews', fd);
      } else {
        review = await api.post<CvReview>('/cv-reviews', { cv_text: cvText, target_job: targetJob.trim(), job_description: jd.trim(), consent: true });
      }
      setHistory((h) => [review, ...(h ?? [])]);
      navigate(`/cv-reviewer/${review.id}`);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  const fieldErr = (k: string) => clientErrors[k] || error?.fields[k];

  return (
    <PageContainer>
      <PageHeader icon={<FileText className="h-6 w-6" />} title="CV Reviewer" description="Unggah CV atau tempel isinya, lalu dapatkan analisis dan saran perbaikan sesuai posisi yang kamu incar." />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="card space-y-5 p-6" noValidate>
          <div role="tablist" className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-1">
            {(['upload', 'paste'] as const).map((m) => (
              <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => setMode(m)} className={cn('flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition', mode === m ? 'bg-white text-primary shadow-sm' : 'text-muted')}>
                {m === 'upload' ? <><Upload className="h-4 w-4" />Upload PDF</> : <><ClipboardPaste className="h-4 w-4" />Tempel teks</>}
              </button>
            ))}
          </div>

          {mode === 'upload' ? (
            <div>
              <span className="label">File CV (PDF, maks. 2 MB)</span>
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="rounded-lg p-1.5 text-muted hover:bg-slate-100" aria-label="Hapus file"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <label
                  className={cn('flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition hover:border-primary/50 hover:bg-primary-50/40', fieldErr('file') ? 'border-red-300' : 'border-slate-300')}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0] ?? null); }}
                >
                  <Upload className="h-7 w-7 text-primary" />
                  <span className="mt-2 text-sm font-semibold text-navy">Klik untuk memilih atau tarik file ke sini</span>
                  <span className="text-xs text-muted">Hanya PDF berbasis teks (bukan hasil scan)</span>
                  <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
                </label>
              )}
              {fieldErr('file') && <p className="field-error">{fieldErr('file')}</p>}
            </div>
          ) : (
            <TextArea label="Teks CV" value={cvText} onChange={(e) => setCvText(e.target.value)} error={fieldErr('cv_text')} className="min-h-[220px]" placeholder="Tempel seluruh isi CV-mu di sini…" maxLength={20000} hint={`${cvText.length}/20.000 karakter`} />
          )}

          <TextInput label="Target posisi" value={targetJob} onChange={(e) => setTargetJob(e.target.value)} error={fieldErr('target_job')} placeholder="Contoh: Business Analyst" maxLength={150} />
          <TextArea label="Deskripsi pekerjaan" optional value={jd} onChange={(e) => setJd(e.target.value)} error={fieldErr('job_description')} placeholder="Tempel deskripsi lowongan agar analisis relevansi lebih akurat." maxLength={5000} />

          <div className="rounded-xl bg-surface p-4">
            <Checkbox checked={consent} onChange={setConsent} error={fieldErr('consent')}>
              Saya menyetujui CV dan deskripsi pekerjaan ini dikirim ke penyedia layanan AI untuk dianalisis. CV tidak kami gunakan untuk tujuan lain dan dapat saya hapus kapan saja. Saya memahami bahwa pada paket AI gratis, penyedia AI dapat memakai data untuk meningkatkan layanannya, sehingga saya tidak mencantumkan data sensitif (NIK, alamat lengkap). <Link to="/privasi" target="_blank" className="font-semibold text-primary underline">Pelajari</Link>
            </Checkbox>
          </div>

          {error && !Object.keys(error.fields).length && <Alert tone="error">{error.message}</Alert>}
          <Button type="submit" className="w-full" size="lg" loading={loading} icon={<Wand2 className="h-5 w-5" />}>
            {loading ? 'Menganalisis CV…' : 'Analisis CV Saya'}
          </Button>
          {loading && <p className="text-center text-xs text-muted">Proses ini bisa memakan waktu hingga 1 menit.</p>}
        </form>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><ListChecks className="h-5 w-5 text-primary" />Yang dianalisis</h2>
            <ul className="space-y-2 text-sm text-ink">
              {['Struktur & keterbacaan', 'Relevansi dengan target pekerjaan', 'Kejelasan pengalaman', 'Kualitas bullet point', 'Keterampilan yang relevan'].map((x) => (
                <li key={x} className="flex gap-2"><Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{x}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Skor merupakan estimasi berdasarkan kriteria aplikasi, bukan ukuran ilmiah. AI diinstruksikan untuk tidak mengarang pengalaman atau pencapaian.</p>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold">Riwayat review</h2>
            {loadingHistory ? <Spinner /> : <CvHistory items={history ?? []} onDeleted={(id) => setHistory((h) => (h ?? []).filter((x) => x.id !== id))} />}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export function CvReviewDetailPage() {
  useDocumentTitle('Hasil Review CV');
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => api.get<CvReview>(`/cv-reviews/${id}`), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const del = async () => {
    setBusy(true);
    try {
      await api.del(`/cv-reviews/${id}`);
      navigate('/cv-reviewer', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <Link to="/cv-reviewer" className="no-print mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" />Kembali ke CV Reviewer</Link>
      {loading ? (
        <Spinner />
      ) : error || !data ? (
        <Alert tone="error">{error?.status === 404 ? 'Review tidak ditemukan atau bukan milikmu.' : error?.message}</Alert>
      ) : (
        <>
          <PageHeader
            icon={<FileText className="h-6 w-6" />}
            title={`Review CV: ${data.target_job}`}
            description={`${formatDate(data.created_at, true)} · ${data.source === 'upload' ? 'Dari file PDF' : 'Dari teks yang ditempel'}${data.has_file ? ' · file tersimpan privat' : ''}`}
            actions={
              <>
                <LinkButton to="/cv-reviewer" variant="soft">Review baru</LinkButton>
                <Button variant="secondary" className="text-red-600" onClick={() => setConfirm(true)} icon={<Trash2 className="h-4 w-4" />}>Hapus</Button>
              </>
            }
          />
          <CvResultView review={data} />
        </>
      )}
      <Modal open={confirm} title="Hapus review CV?" onClose={() => setConfirm(false)} footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>Batal</Button><Button variant="danger" loading={busy} onClick={() => void del()}>Hapus permanen</Button></>}>
        Hasil analisis dan file CV yang tersimpan (jika ada) akan dihapus permanen.
      </Modal>
    </PageContainer>
  );
}
