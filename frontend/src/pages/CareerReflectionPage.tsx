import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, RotateCcw, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert, ProgressBar, Spinner } from '@/components/ui/Feedback';
import { PageContainer } from '@/layouts/AppLayout';
import { useAsync, useDocumentTitle } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { api, ApiError } from '@/services/api';
import type { LikertOption, ReflectionAnswers, ReflectionQuestion, ReflectionQuestionnaire, ReflectionResult, SavedReflection } from '@/types';
import { cn, storage, STORAGE_KEYS } from '@/utils/format';

interface Draft {
  version: string;
  step: number;
  answers: ReflectionAnswers;
  updatedAt: string;
}

function LikertScale({ q, value, options, onChange, invalid }: { q: ReflectionQuestion; value?: number; options: LikertOption[]; onChange: (v: number) => void; invalid: boolean }) {
  return (
    <fieldset
      className={cn(
        'group rounded-2xl bg-white px-4 py-4 ring-1 transition sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-5',
        invalid ? 'ring-red-300' : value ? 'ring-primary/20' : 'ring-slate-900/[0.06] hover:ring-primary/25',
      )}
    >
      <legend className="sr-only">{q.text}</legend>
      <p className="text-sm font-semibold leading-relaxed text-navy sm:max-w-[60%]" aria-hidden>{q.text}</p>
      <div role="radiogroup" aria-label={q.text} className="mt-3 flex shrink-0 items-center justify-between gap-2 sm:mt-0 sm:justify-end">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <label key={o.value} className="cursor-pointer" title={o.label}>
              <input type="radio" className="peer sr-only" name={q.id} value={o.value} checked={active} onChange={() => onChange(o.value)} aria-label={`${o.value} — ${o.label}`} />
              <span
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 sm:h-9 sm:w-9',
                  active ? 'scale-110 bg-primary text-white shadow-glow' : 'bg-surface text-ink ring-1 ring-slate-200 hover:bg-primary-50 hover:text-primary hover:ring-primary/30',
                )}
              >
                {o.value}
              </span>
            </label>
          );
        })}
      </div>
      {invalid && <p className="field-error sm:hidden">Pertanyaan ini wajib dijawab.</p>}
    </fieldset>
  );
}

export default function CareerReflectionPage() {
  useDocumentTitle('Refleksi Karier');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: qn, loading, error, reload } = useAsync(() => api.get<ReflectionQuestionnaire>('/reflections/questions'));

  const [answers, setAnswers] = useState<ReflectionAnswers>({});
  const [step, setStep] = useState(0);
  const [resumed, setResumed] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Resume a draft (if the questionnaire version still matches).
  useEffect(() => {
    if (!qn) return;
    const draft = storage.get<Draft>(STORAGE_KEYS.reflectionDraft);
    if (draft && draft.version === qn.version && Object.keys(draft.answers).length > 0) {
      setAnswers(draft.answers);
      setStep(Math.min(draft.step, qn.categories.length - 1));
      setResumed(true);
    }
  }, [qn]);

  // Autosave on every change.
  useEffect(() => {
    if (!qn || Object.keys(answers).length === 0) return;
    const now = new Date().toISOString();
    storage.set(STORAGE_KEYS.reflectionDraft, { version: qn.version, step, answers, updatedAt: now } satisfies Draft);
    setSavedAt(now);
  }, [answers, step, qn]);

  const allRequired = useMemo(() => (qn ? qn.categories.flatMap((c) => c.questions.filter((q) => q.required)) : []), [qn]);
  const answeredCount = allRequired.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const progress = allRequired.length ? (answeredCount / allRequired.length) * 100 : 0;

  if (loading) return <PageContainer narrow><Spinner label="Memuat pertanyaan…" /></PageContainer>;
  if (error || !qn) {
    return (
      <PageContainer narrow>
        <Alert tone="error" title="Pertanyaan tidak dapat dimuat">{error?.message}</Alert>
        <Button className="mt-4" variant="secondary" onClick={() => void reload()}>Coba lagi</Button>
      </PageContainer>
    );
  }

  const category = qn.categories[step];
  const isLast = step === qn.categories.length - 1;
  const missing = category.questions.filter((q) => q.required && (answers[q.id] === undefined || answers[q.id] === ''));

  const setAnswer = (id: string, v: number | string) => setAnswers((a) => ({ ...a, [id]: v }));
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const next = () => {
    if (missing.length) {
      setShowErrors(true);
      document.getElementById(`q-${missing[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setShowErrors(false);
    setStep((s) => s + 1);
    scrollTop();
  };
  const prev = () => {
    setShowErrors(false);
    setStep((s) => Math.max(0, s - 1));
    scrollTop();
  };
  const restart = () => {
    storage.remove(STORAGE_KEYS.reflectionDraft);
    setAnswers({});
    setStep(0);
    setResumed(false);
    setSavedAt(null);
  };

  const submit = async () => {
    if (missing.length) {
      setShowErrors(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (user) {
        const saved = await api.post<SavedReflection>('/reflections', { answers });
        storage.remove(STORAGE_KEYS.reflectionDraft);
        navigate(`/career-report/${saved.id}`);
      } else {
        const res = await api.post<{ result: ReflectionResult }>('/reflections/preview', { answers });
        storage.set(STORAGE_KEYS.guestResult, { answers, result: res.result, createdAt: new Date().toISOString() });
        storage.remove(STORAGE_KEYS.reflectionDraft);
        navigate('/career-report');
      }
    } catch (e) {
      const err = e as ApiError;
      setSubmitError(err);
      // Jump to the first category with a server-side validation error.
      const firstField = Object.keys(err.fields)[0];
      if (firstField) {
        const idx = qn.categories.findIndex((c) => c.questions.some((q) => q.id === firstField));
        if (idx >= 0) {
          setStep(idx);
          setShowErrors(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer narrow>
      <div ref={topRef} className="scroll-mt-24" />
      <div className="mb-6 flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary"><Compass className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Refleksi Karier</h1>
          <p className="mt-1 text-sm text-muted">Jawab dengan jujur sesuai kondisimu saat ini. Tidak ada jawaban benar atau salah.</p>
        </div>
      </div>

      <Alert tone="info" className="mb-6">{qn.disclaimer}</Alert>

      {resumed && (
        <Alert tone="success" className="mb-6" title="Melanjutkan refleksi sebelumnya">
          Jawabanmu tersimpan sementara di perangkat ini.{' '}
          <button type="button" onClick={restart} className="inline-flex items-center gap-1 font-semibold underline">
            <RotateCcw className="h-3.5 w-3.5" /> Mulai ulang
          </button>
        </Alert>
      )}

      <div className="card sticky top-[72px] z-10 mb-6 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold text-navy">{category.title}</span>
          <span className="text-muted">Bagian {step + 1} dari {qn.categories.length}</span>
        </div>
        <ProgressBar value={progress} label="Progres refleksi" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{answeredCount}/{allRequired.length} pertanyaan terjawab</span>
          {savedAt && <span className="inline-flex items-center gap-1"><Save className="h-3 w-3" /> Tersimpan otomatis</span>}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-muted">{category.description}</p>
        {category.questions.some((q) => q.type === 'likert') && (
          <p className="shrink-0 text-xs font-medium text-muted"><span className="font-bold text-navy">1</span> {qn.likert[0]?.label} · <span className="font-bold text-navy">5</span> {qn.likert[qn.likert.length - 1]?.label}</p>
        )}
      </div>

      <div key={category.id} className="animate-fade-up space-y-3">
        {category.questions.map((q) => {
          const invalid = showErrors && q.required && (answers[q.id] === undefined || answers[q.id] === '');
          const serverErr = submitError?.fields[q.id];
          return (
            <div key={q.id} id={`q-${q.id}`} className="scroll-mt-48">
              {q.type === 'likert' && (
                <LikertScale q={q} value={answers[q.id] as number | undefined} options={qn.likert} onChange={(v) => setAnswer(q.id, v)} invalid={invalid || !!serverErr} />
              )}
              {q.type === 'choice' && (
                <fieldset className={cn('rounded-2xl border bg-white p-4 sm:p-5', invalid ? 'border-red-300' : 'border-slate-200')}>
                  <legend className="mb-3 text-sm font-semibold text-navy sm:text-base">{q.text}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options?.map((o) => (
                      <label key={o.value} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition', answers[q.id] === o.value ? 'border-primary bg-primary-50 font-semibold text-primary' : 'border-slate-200 hover:border-primary/40')}>
                        <input type="radio" name={q.id} value={o.value} checked={answers[q.id] === o.value} onChange={() => setAnswer(q.id, o.value)} className="h-4 w-4 text-primary focus:ring-primary" />
                        {o.label}
                      </label>
                    ))}
                  </div>
                  {(invalid || serverErr) && <p className="field-error">{serverErr ?? 'Silakan pilih salah satu opsi.'}</p>}
                </fieldset>
              )}
              {q.type === 'text' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <label htmlFor={q.id} className="mb-3 block text-sm font-semibold text-navy sm:text-base">{q.text}</label>
                  <textarea
                    id={q.id}
                    className="input min-h-[96px]"
                    maxLength={q.max_length}
                    placeholder={q.placeholder}
                    value={(answers[q.id] as string) ?? ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                  <p className="mt-1 text-right text-xs text-muted">{((answers[q.id] as string) ?? '').length}/{q.max_length}</p>
                  {serverErr && <p className="field-error">{serverErr}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {submitError && !Object.keys(submitError.fields).length && <Alert tone="error" className="mt-6">{submitError.message}</Alert>}
      {showErrors && missing.length > 0 && <Alert tone="warning" className="mt-6">Masih ada {missing.length} pertanyaan di bagian ini yang belum dijawab.</Alert>}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={prev} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>Sebelumnya</Button>
        {isLast ? (
          <Button onClick={() => void submit()} loading={submitting} icon={<Send className="h-4 w-4" />}>Lihat Laporan</Button>
        ) : (
          <Button onClick={next}>Selanjutnya <ArrowRight className="h-4 w-4" /></Button>
        )}
      </div>
      {!user && <p className="mt-4 text-center text-xs text-muted">Kamu sedang mencoba tanpa akun. Hasil bisa disimpan setelah mendaftar.</p>}
    </PageContainer>
  );
}
