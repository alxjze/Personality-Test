import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/format';

interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (id: string, describedBy: string | undefined) => ReactNode;
  optional?: boolean;
}

export function Field({ label, error, hint, children, optional }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-muted">(opsional)</span>}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-error`} className="field-error">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: ReactNode; optional?: boolean };
export function TextInput({ label, error, hint, optional, className, ...rest }: InputProps) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional}>
      {(id, describedBy) => (
        <input id={id} aria-invalid={!!error} aria-describedby={describedBy} className={cn('input', error && 'input-error', className)} {...rest} />
      )}
    </Field>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: ReactNode; optional?: boolean };
export function TextArea({ label, error, hint, optional, className, ...rest }: TextareaProps) {
  return (
    <Field label={label} error={error} hint={hint} optional={optional}>
      {(id, describedBy) => (
        <textarea id={id} aria-invalid={!!error} aria-describedby={describedBy} className={cn('input min-h-[120px] resize-y', error && 'input-error', className)} {...rest} />
      )}
    </Field>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; options: { value: string; label: string }[] };
export function Select({ label, error, options, className, ...rest }: SelectProps) {
  return (
    <Field label={label} error={error}>
      {(id, describedBy) => (
        <select id={id} aria-invalid={!!error} aria-describedby={describedBy} className={cn('input', error && 'input-error', className)} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({ checked, onChange, children, error, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; error?: string; id?: string }) {
  const autoId = useId();
  const cid = id ?? autoId;
  return (
    <div>
      <label htmlFor={cid} className="flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          id={cid}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary"
          aria-invalid={!!error}
        />
        <span className="leading-relaxed">{children}</span>
      </label>
      {error && <p className="field-error pl-7">{error}</p>}
    </div>
  );
}
