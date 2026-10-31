export function formatDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const INTERVIEW_TYPE_LABEL: Record<string, string> = {
  behavioral: 'Behavioral',
  hr: 'HR / Umum',
  technical: 'Teknis',
};

/** Safe localStorage helpers (private mode / blocked storage never breaks the app). */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  reflectionDraft: 'psk_reflection_draft_v1',
  guestResult: 'psk_reflection_guest_v1',
};
