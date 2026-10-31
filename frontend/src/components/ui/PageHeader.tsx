import type { ReactNode } from 'react';

export function PageHeader({ icon, title, description, actions, badge }: { icon?: ReactNode; title: string; description?: string; actions?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon && <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary">{icon}</div>}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
            {badge}
          </div>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
        </div>
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
