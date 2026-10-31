import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, Circle, Lightbulb, MessageSquareText, Play, Send, Trash2, XCircle } from 'lucide-react';
import { AiConsentModal } from '@/components/AiConsentModal';
import { Button } from '@/components/ui/Button';
import { Alert, EmptyState, ProgressBar, SimulationBadge, Spinner } from '@/components/ui/Feedback';
import { Select, TextInput } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/layouts/AppLayout';
import { useAsync, useDocumentTitle } from '@/hooks/useAsync';
import { api, ApiError } from '@/services/api';
import type { InterviewFeedback, InterviewSession, InterviewSummary } from '@/types';
import { cn, formatDate, INTERVIEW_TYPE_LABEL } from '@/utils/format';

const TYPE_OPTIONS = [
  { value: 'behavioral', label: 'Behavioral (pengalaman & perilaku)' },
  { value: 'hr', label: 'HR / umum' },
  { value: 'technical', label: 'Teknis sesuai peran' },
];

const RATING: Record<InterviewFeedback['rating'], { label: string; cls: string }> = {
  kuat: { label: 'Kuat', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  cukup: { label: 'Cukup', cls: 'bg-primary-50 text-primary ring-primary-100' },
  perlu_diperbaiki: { label: 'Perlu diperbaiki', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
};

export function InterviewPreparationPage() {
  useDocumentTitle('Persiapan Interview');
  const navigate = useNavigate();
  const { data: sessions, setData: setSessions, loading } = useAsync(() => api.get<InterviewSummary[]>('/interviews'));
  const [position, setPosition] = useState('');
  const [type, setType] = useState('behavioral');
  const [count, setCount] = useState('5');
  const [error, setError] = useState<ApiError | null>(null);
  const [creating, setCreating] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [confirm, setConfirm] = useState<number | null>(null);

  const create = async (consent = false) => {
    setCreating(true);
    setError(null);
    try {
      const s = await api.post<InterviewSession>('/interviews', { job_position: position.trim(), interview_type: type, question_count: Number(count), consent });
      navigate(`/interview-preparation/${s.id}`);
    } catch (e) {
      const err = e as ApiError;
      if (err.code === 'consent_required') setConsentOpen(true);
      else setError(err);
    } finally {
      setCreating(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (position.trim().length < 2) {
      setError(new ApiError('Posisi wajib diisi.', 422, 'validation_error', { job_position: 'Posisi wajib diisi.' }));
      return;
    }
    void create();
  };

  const del = async () => {
    if (confirm === null) return;
    try {
      await api.del(`/interviews/${confirm}`);
      setSessions((s) => (s ?? []).filter((x) => x.id !== confirm));
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setConfirm(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader icon={<MessageSquareText className="h-6 w-6" />} title="Persiapan Interview" description="Latihan pertanyaan interview, kembangkan jawabanmu, dan dapatkan feedback dengan metode STAR." />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={onSubmit} className="card h-fit space-y-5 p-6" noValidate>
          <h2 className="text-lg font-bold">Mulai sesi latihan</h2>
          <TextInput label="Posisi yang dilamar" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Contoh: Business Analyst" error={error?.fields.job_position} maxLength={150} />
          <Select label="Jenis interview" value={type} onChange={(e) => setType(e.target.value)} options={TYPE_OPTIONS} error={error?.fields.interview_type} />
          <Select label="Jumlah pertanyaan" value={count} onChange={(e) => setCount(e.target.value)} options={['3', '4', '5', '6'].map((v) => ({ value: v, label: `${v} pertanyaan` }))} />
          {error && !Object.keys(error.fields).length && <Alert tone="error">{error.message}</Alert>}
          <Button type="submit" className="w-full" loading={creating} icon={<Play className="h-4 w-4" />}>{creating ? 'Menyiapkan pertanyaan…' : 'Buat pertanyaan'}</Button>
          <div className="rounded-xl bg-surface p-4 text-sm">
            <p className="font-semibold text-navy">Metode STAR</p>
            <p className="mt-1 text-muted"><strong>S</strong>ituation (konteks) · <strong>T</strong>ask (tugasmu) · <strong>A</strong>ction (langkah yang kamu ambil) · <strong>R</strong>esult (hasil/pembelajaran).</p>
          </div>
        </form>

        <div>
          <h2 className="mb-3 text-lg font-bold">Riwayat latihan</h2>
          {loading ? (
            <Spinner />
          ) : sessions && sessions.length ? (
            <ul className="space-y-3">
              {sessions.map((s) => (
                <li key={s.id} className="card flex items-center gap-4 p-4">
                  <Link to={`/interview-preparation/${s.id}`} className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-navy hover:text-primary">{s.job_position}</p>
                      <span className="chip bg-surface text-muted ring-1 ring-slate-200">{INTERVIEW_TYPE_LABEL[s.interview_type] ?? s.interview_type}</span>
                      {s.simulated && <SimulationBadge />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{formatDate(s.updated_at, true)} · {s.answered_count}/{s.total_questions} terjawab</p>
                    <ProgressBar value={(s.answered_count / Math.max(1, s.total_questions)) * 100} className="mt-2" label="Progres latihan" />
                  </Link>
                  <button type="button" onClick={() => setConfirm(s.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Hapus sesi ${s.job_position}`}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<MessageSquareText className="h-6 w-6" />} title="Belum ada sesi latihan" description="Buat sesi pertama untuk mulai berlatih." />
          )}
        </div>
      </div>
      <AiConsentModal open={consentOpen} onClose={() => setConsentOpen(false)} onAccept={() => { setConsentOpen(false); void create(true); }} />
      <Modal open={confirm !== null} title="Hapus sesi latihan?" onClose={() => setConfirm(null)} footer={<><Button variant="secondary" onClick={() => setConfirm(null)}>Batal</Button><Button variant="danger" onClick={() => void del()}>Hapus</Button></>}>
        Pertanyaan, jawaban, dan feedback pada sesi ini akan dihapus permanen.
      </Modal>
    </PageContainer>
  );
}

function FeedbackView({ fb }: { fb: InterviewFeedback }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('chip ring-1', RATING[fb.rating].cls)}>{RATING[fb.rating].label}</span>
        {fb.meta?.simulated && <SimulationBadge />}
      </div>
      {fb.summary && <p className="text-sm text-ink">{fb.summary}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {(['situation', 'task', 'action', 'result'] as const).map((k) => {
          const el = fb.star[k];
          return (
            <div key={k} className={cn('rounded-xl border p-3', el.present ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50')}>
              <p className="flex items-center gap-1.5 text-sm font-bold text-navy">
                {el.present ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-amber-600" />}
                {el.label}
              </p>
              <p className="mt-1 text-xs text-ink">{el.comment}</p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-bold text-navy">Yang sudah baik</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{fb.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div>
          <p className="text-sm font-bold text-navy">Saran perbaikan</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{fb.improvements.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
      {fb.improved_outline && (
        <div className="rounded-xl bg-surface p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-navy"><Lightbulb className="h-4 w-4 text-primary" />Kerangka jawaban yang lebih kuat</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{fb.improved_outline}</p>
        </div>
      )}
    </div>
  );
}

export function InterviewSessionPage() {
  useDocumentTitle('Latihan Interview');
  const { id } = useParams();
  const { data: session, setData: setSession, loading, error } = useAsync(() => api.get<InterviewSession>(`/interviews/${id}`), [id]);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    const firstUnanswered = session.questions.findIndex((_, i) => !session.answers[String(i)]);
    setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  if (loading) return <PageContainer><Spinner /></PageContainer>;
  if (error || !session) return <PageContainer><Alert tone="error">{error?.status === 404 ? 'Sesi tidak ditemukan atau bukan milikmu.' : error?.message}</Alert></PageContainer>;

  const q = session.questions[index];
  const saved = session.answers[String(index)];
  const fb = session.feedback[String(index)];
  const draft = drafts[index] ?? saved?.answer ?? '';
  const answered = Object.keys(session.answers).length;

  const submit = async (consent = false) => {
    if (draft.trim().length < 20) {
      setSubmitError(new ApiError('Jawaban minimal 20 karakter.', 422, 'validation_error', { answer: 'Jawaban minimal 20 karakter.' }));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await api.post<InterviewSession>(`/interviews/${session.id}/answer`, { question_index: index, answer: draft.trim(), consent });
      setSession(updated);
    } catch (e) {
      const err = e as ApiError;
      if (err.code === 'consent_required') setConsentOpen(true);
      else setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Link to="/interview-preparation" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" />Semua sesi</Link>
      <PageHeader
        icon={<MessageSquareText className="h-6 w-6" />}
        title={session.job_position}
        description={`Interview ${INTERVIEW_TYPE_LABEL[session.interview_type] ?? session.interview_type} · ${answered}/${session.total_questions} pertanyaan terjawab`}
        badge={session.simulated ? <SimulationBadge /> : undefined}
      />
      <ProgressBar value={(answered / session.total_questions) * 100} className="mb-8" label="Progres latihan" />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav aria-label="Daftar pertanyaan" className="card h-fit p-3">
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-muted">Daftar pertanyaan</p>
          <ol className="space-y-1">
            {session.questions.map((item, i) => {
              const done = !!session.answers[String(i)];
              return (
                <li key={i}>
                  <button type="button" onClick={() => { setIndex(i); setSubmitError(null); }} className={cn('flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition', index === i ? 'bg-primary-50 font-semibold text-primary' : 'hover:bg-slate-50')} aria-current={index === i ? 'step' : undefined}>
                    {done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
                    <span className="line-clamp-2">{i + 1}. {item.question}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Pertanyaan {index + 1} dari {session.total_questions}{q.focus ? ` · ${q.focus}` : ''}</p>
            <h2 className="mt-2 text-xl font-bold leading-snug">{q.question}</h2>
            {q.tip && <p className="mt-3 flex gap-2 rounded-xl bg-surface p-3 text-sm text-muted"><Lightbulb className="h-4 w-4 shrink-0 text-primary" />{q.tip}</p>}
            <div className="mt-5">
              <label htmlFor="answer" className="label">Jawabanmu</label>
              <textarea
                id="answer"
                className={cn('input min-h-[180px]', submitError?.fields.answer && 'input-error')}
                value={draft}
                maxLength={3000}
                onChange={(e) => setDrafts((d) => ({ ...d, [index]: e.target.value }))}
                placeholder="Tulis jawabanmu seperti sedang berbicara dengan pewawancara…"
              />
              <div className="mt-1 flex justify-between text-xs text-muted">
                {submitError?.fields.answer ? <span className="font-medium text-red-600">{submitError.fields.answer}</span> : <span>Saran: 120–200 kata dengan struktur STAR.</span>}
                <span>{draft.length}/3000</span>
              </div>
            </div>
            {submitError && !Object.keys(submitError.fields).length && <Alert tone="error" className="mt-4">{submitError.message}</Alert>}
            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <Button onClick={() => void submit()} loading={submitting} icon={<Send className="h-4 w-4" />}>{saved ? 'Kirim ulang & minta feedback' : 'Dapatkan feedback'}</Button>
              {index < session.total_questions - 1 && (
                <Button variant="secondary" onClick={() => { setIndex(index + 1); setSubmitError(null); }}>Pertanyaan berikutnya <ChevronRight className="h-4 w-4" /></Button>
              )}
            </div>
          </div>

          {fb && (
            <section className="card p-6" aria-live="polite">
              <h3 className="mb-4 text-lg font-bold">Feedback</h3>
              <FeedbackView fb={fb} />
            </section>
          )}
          {answered === session.total_questions && (
            <Alert tone="success" title="Semua pertanyaan sudah dijawab">Bagus! Coba perbaiki jawaban berdasarkan feedback, atau buat sesi baru untuk posisi lain.</Alert>
          )}
        </div>
      </div>
      <AiConsentModal open={consentOpen} onClose={() => setConsentOpen(false)} onAccept={() => { setConsentOpen(false); void submit(true); }} />
    </PageContainer>
  );
}
