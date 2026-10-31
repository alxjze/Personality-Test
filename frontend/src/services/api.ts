/**
 * Same-origin API client. Uses the session cookie (HttpOnly) + a CSRF token header.
 * No API keys ever live in the frontend — all AI calls go through the PHP backend.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null | undefined) {
  if (token) csrfToken = token;
}

async function fetchCsrf(): Promise<string> {
  const res = await request<{ csrf_token: string }>('GET', '/auth/csrf', undefined, false);
  csrfToken = res.csrf_token;
  return csrfToken;
}

async function request<T>(method: string, path: string, body?: unknown, withCsrf = true, retried = false): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  const mutating = method !== 'GET';
  if (mutating && withCsrf) headers['X-CSRF-Token'] = csrfToken ?? (await fetchCsrf());

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internetmu.', 0, 'network_error');
  }

  let json: { success?: boolean; data?: T; error?: { code: string; message: string; fields?: Record<string, string> } } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (res.ok && json?.success) return json.data as T;

  const err = json?.error;
  if (res.status === 419 && mutating && !retried) {
    csrfToken = null;
    await fetchCsrf();
    return request<T>(method, path, body, withCsrf, true);
  }
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }
  throw new ApiError(
    err?.message ?? 'Terjadi kesalahan. Silakan coba lagi.',
    res.status,
    err?.code ?? 'unknown_error',
    err?.fields ?? {},
  );
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  del: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
};
