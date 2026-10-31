import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, FlaskConical } from 'lucide-react';
import { cn } from '@/utils/format';

type Tone = 'error' | 'success' | 'info' | 'warning';

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  error: { box: 'border-red-200 bg-red-50 text-red-800', icon: <AlertCircle className="h-5 w-5 shrink-0" aria-hidden /> },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden /> },
  info: { box: 'border-primary-100 bg-primary-50 text-navy', icon: <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden /> },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: <AlertCircle className="h-5 w-5 shrink-0" aria-hidden /> },
};

export function Alert({ tone = 'info', title, children, className }: { tone?: Tone; title?: string; children?: ReactNode; className?: string }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-xl border p-4 text-sm', tones[tone].box, className)}>
      {tones[tone].icon}
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

export function Spinner({ label = 'Memuat…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-10 text-sm text-muted', className)} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
      {icon && <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary">{icon}</div>}
      <p className="font-semibold text-navy">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Mandatory label for any mock/simulated AI output. */
export function SimulationBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn('chip border border-amber-300 bg-amber-50 text-amber-800', className)}
      title="Layanan AI belum dikonfigurasi. Konten ini dibuat oleh simulasi lokal, bukan model AI."
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Simulasi
    </span>
  );
}

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-primary-50', className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${v}%` }} />
    </div>
  );
}
