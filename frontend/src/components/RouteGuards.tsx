import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/Feedback';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Memeriksa sesi…" className="min-h-[50vh]" />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Memeriksa sesi…" className="min-h-[50vh]" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Only allow internal redirects (prevents open-redirect via ?next=). */
export function safeNext(next: string | null, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}
