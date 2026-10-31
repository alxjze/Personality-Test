import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, LogIn, MailCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Checkbox, TextInput } from '@/components/ui/Form';
import { Logo } from '@/components/ui/Logo';
import { safeNext } from '@/components/RouteGuards';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useAsync';
import { api, ApiError } from '@/services/api';
import { storage, STORAGE_KEYS } from '@/utils/format';

function AuthCard({ icon, title, subtitle, children, footer }: { icon: ReactNode; title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-primary">{icon}</div>
            <div>
              <h1 className="text-xl font-extrabold">{title}</h1>
              <p className="text-sm text-muted">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
        {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}

function useAfterAuth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { savePendingReflection } = useAuth();
  return async () => {
    const savedId = await savePendingReflection();
    if (savedId) {
      navigate(`/career-report/${savedId}?saved=1`, { replace: true });
      return;
    }
    navigate(safeNext(params.get('next')), { replace: true });
  };
}

export function LoginPage() {
  useDocumentTitle('Masuk');
  const { login } = useAuth();
  const afterAuth = useAfterAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const hasPending = !!storage.get(STORAGE_KEYS.guestResult);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      await afterAuth();
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      icon={<LogIn className="h-5 w-5" />}
      title="Masuk"
      subtitle="Lanjutkan perjalanan kariermu."
      footer={<>Belum punya akun? <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`} className="font-semibold text-primary">Daftar gratis</Link></>}
    >
      {hasPending && <Alert tone="info" className="mb-4">Hasil refleksimu akan otomatis disimpan ke akun setelah masuk.</Alert>}
      {error && !Object.keys(error.fields).length && <Alert tone="error" className="mb-4">{error.message}</Alert>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextInput label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error?.fields.email} required />
        <TextInput label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error?.fields.password} required />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary">Lupa password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={loading}>Masuk</Button>
      </form>
    </AuthCard>
  );
}

export function RegisterPage() {
  useDocumentTitle('Daftar');
  const { register } = useAuth();
  const afterAuth = useAfterAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const hasPending = !!storage.get(STORAGE_KEYS.guestResult);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, accept_privacy: accept });
      await afterAuth();
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      icon={<UserPlus className="h-5 w-5" />}
      title="Buat akun"
      subtitle="Simpan hasil dan gunakan fitur personal."
      footer={<>Sudah punya akun? <Link to="/login" className="font-semibold text-primary">Masuk</Link></>}
    >
      {hasPending && <Alert tone="info" className="mb-4">Hasil refleksimu akan otomatis disimpan ke akun baru ini.</Alert>}
      {error && !Object.keys(error.fields).length && <Alert tone="error" className="mb-4">{error.message}</Alert>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextInput label="Nama" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={error?.fields.name} />
        <TextInput label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={error?.fields.email} />
        <TextInput
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={error?.fields.password}
          hint="Minimal 8 karakter, mengandung huruf dan angka."
        />
        <Checkbox checked={accept} onChange={setAccept} error={error?.fields.accept_privacy}>
          Saya telah membaca dan menyetujui <Link to="/privasi" target="_blank" className="font-semibold text-primary underline">Kebijakan Privasi</Link> serta <Link to="/syarat" target="_blank" className="font-semibold text-primary underline">Syarat Penggunaan</Link>.
        </Checkbox>
        <Button type="submit" className="w-full" loading={loading}>Daftar</Button>
      </form>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  useDocumentTitle('Lupa Password');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ message: string }>('/auth/forgot-password', { email: email.trim() });
      setDone(res.message);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard icon={<KeyRound className="h-5 w-5" />} title="Lupa password" subtitle="Kami akan mengirim tautan reset ke emailmu." footer={<Link to="/login" className="font-semibold text-primary">Kembali ke halaman masuk</Link>}>
      {done ? (
        <Alert tone="success" title="Cek emailmu">{done} Tautan berlaku selama 60 menit.</Alert>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {error && !error.fields.email && <Alert tone="error">{error.message}</Alert>}
          <TextInput label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error?.fields.email} />
          <Button type="submit" className="w-full" loading={loading}>Kirim tautan reset</Button>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  useDocumentTitle('Atur Ulang Password');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(new ApiError('Konfirmasi password tidak sama.', 422, 'validation_error', { confirm: 'Konfirmasi password tidak sama.' }));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ message: string }>('/auth/reset-password', { token, password });
      setDone(res.message);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard icon={<KeyRound className="h-5 w-5" />} title="Tautan tidak valid" subtitle="Token reset tidak ditemukan.">
        <Alert tone="error">Tautan reset tidak lengkap. Silakan minta tautan baru.</Alert>
        <Link to="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-primary">Minta tautan baru</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={<MailCheck className="h-5 w-5" />} title="Atur ulang password" subtitle="Buat password baru untuk akunmu.">
      {done ? (
        <>
          <Alert tone="success">{done}</Alert>
          <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-primary">Masuk sekarang</Link>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {error && !Object.keys(error.fields).length && <Alert tone="error">{error.message}</Alert>}
          <TextInput label="Password baru" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error?.fields.password} hint="Minimal 8 karakter, mengandung huruf dan angka." />
          <TextInput label="Konfirmasi password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error?.fields.confirm} />
          <Button type="submit" className="w-full" loading={loading}>Simpan password baru</Button>
        </form>
      )}
    </AuthCard>
  );
}
