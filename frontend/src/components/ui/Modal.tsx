import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>('input, button, textarea, select')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 backdrop-blur-sm sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="card w-full max-w-lg p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-slate-100" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-sm leading-relaxed text-ink">{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}
