import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Bot, CheckCircle2, Circle, Compass, FileText, LayoutDashboard, MessageSquareText } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { Alert, EmptyState, ProgressBar, SimulationBadge, Spinner } from '@/components/ui/Feedback';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/layouts/AppLayout';
import { useAsync, useDocumentTitle } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import type { DashboardData } from '@/types';
import { formatDate, INTERVIEW_TYPE_LABEL } from '@/utils/format';

function Stat({ icon, label, value, to }: { icon: React.ReactNode; label: string; value: number; to: string }) {
  return (
    <Link to={to} className="card flex items-center gap-4 p-5 transition hover:shadow-lift">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-primary">{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-navy">{value}</p>
        <p className="text-xs font-semibold text-muted">{label}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get<DashboardData>('/dashboard'));

  return (
    <PageContainer>
      <PageHeader icon={<LayoutDashboard className="h-6 w-6" />} title={`Halo, ${user?.name.split(' ')[0] ?? ''} 👋`} description="Pantau perkembangan kariermu dan lanjutkan langkah berikutnya." />
      {loading ? (
        <Spinner />
      ) : error || !data ? (
        <Alert tone="error" title="Dashboard tidak dapat dimuat">{error?.message} <button type="button" onClick={() => void reload()} className="font-semibold underline">Coba lagi</button></Alert>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat icon={<Compass className="h-5 w-5" />} label="Refleksi" value={data.counts.reflections} to="/career-report" />
            <Stat icon={<Bot className="h-5 w-5" />} label="Percakapan AI" value={data.counts.conversations} to="/career-assistant" />
            <Stat icon={<FileText className="h-5 w-5" />} label="Review CV" value={data.counts.cv_reviews} to="/cv-reviewer" />
            <Stat icon={<MessageSquareText className="h-5 w-5" />} label="Sesi interview" value={data.counts.interviews} to="/interview-preparation" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold"><BarChart3 className="h-5 w-5 text-primary" />Hasil refleksi terakhir</h2>
                {data.latest_reflection && <Link to={`/career-report/${data.latest_reflection.id}`} className="text-sm font-semibold text-primary">Lihat laporan</Link>}
              </div>
              {data.latest_reflection ? (
                <>
                  <p className="text-xs text-muted">{formatDate(data.latest_reflection.created_at, true)}</p>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink">{data.latest_reflection.summary}</p>
                  <div className="mt-4 space-y-3">
                    {data.latest_reflection.career_areas.map((a) => (
                      <div key={a.name}>
                        <div className="mb-1 flex justify-between text-sm"><span className="font-semibold text-navy">{a.name}</span><span className="font-bold text-primary">{a.score}</span></div>
                        <ProgressBar value={a.score} label={a.name} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState icon={<Compass className="h-6 w-6" />} title="Belum ada refleksi" description="Mulai refleksi untuk melihat kecenderungan kariermu." action={<LinkButton to="/career-reflection" size="sm">Mulai Refleksi</LinkButton>} />
              )}
            </section>

            <section className="card p-6">
              <h2 className="text-lg font-bold">Progres pengembangan karier</h2>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={data.progress.percent} label="Progres karier" />
                <span className="text-sm font-bold text-primary">{data.progress.percent}%</span>
              </div>
              <ul className="mt-4 space-y-2">
                {data.progress.milestones.map((m) => (
                  <li key={m.key}>
                    <Link to={m.href} className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm hover:bg-primary-50">
                      {m.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                      <span className={m.done ? 'text-muted line-through' : 'font-medium text-navy'}>{m.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card p-6">
              <h2 className="mb-3 font-bold">Review CV terbaru</h2>
              {data.recent_cv_reviews.length ? (
                <ul className="space-y-2">
                  {data.recent_cv_reviews.map((c) => (
                    <li key={c.id}>
                      <Link to={`/cv-reviewer/${c.id}`} className="flex items-center justify-between gap-2 rounded-lg p-2 text-sm hover:bg-primary-50">
                        <span className="truncate font-medium text-navy">{c.target_job}</span>
                        <span className="flex shrink-0 items-center gap-1">{c.simulated && <SimulationBadge />}<span className="chip bg-primary-50 text-primary">{c.overall_score}/100</span></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted">Belum ada. <Link to="/cv-reviewer" className="font-semibold text-primary">Review CV</Link></p>}
            </section>
            <section className="card p-6">
              <h2 className="mb-3 font-bold">Riwayat latihan interview</h2>
              {data.recent_interviews.length ? (
                <ul className="space-y-2">
                  {data.recent_interviews.map((s) => (
                    <li key={s.id}>
                      <Link to={`/interview-preparation/${s.id}`} className="block rounded-lg p-2 text-sm hover:bg-primary-50">
                        <span className="font-medium text-navy">{s.job_position}</span>
                        <span className="block text-xs text-muted">{INTERVIEW_TYPE_LABEL[s.interview_type]} · {s.answered_count}/{s.total_questions} terjawab</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted">Belum ada. <Link to="/interview-preparation" className="font-semibold text-primary">Mulai latihan</Link></p>}
            </section>
            <section className="card p-6">
              <h2 className="mb-3 font-bold">Langkah yang disarankan</h2>
              {data.next_steps.length ? (
                <ul className="space-y-2">
                  {data.next_steps.map((s, i) => (
                    <li key={i}>
                      {s.href ? (
                        <Link to={s.href} className="flex items-center justify-between gap-2 rounded-lg p-2 text-sm font-medium text-navy hover:bg-primary-50">{s.title}<ArrowRight className="h-4 w-4 shrink-0 text-primary" /></Link>
                      ) : <p className="p-2 text-sm text-navy">{s.title}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted">Semua langkah dasar sudah selesai. Hebat!</p>}
            </section>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
