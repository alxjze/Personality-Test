import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, KeyRound, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert, Spinner } from '@/components/ui/Feedback';
import { TextArea, TextInput } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer } from '@/layouts/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAsync, useDocumentTitle } from '@/hooks/useAsync';
import { api, ApiError, setCsrfToken } from '@/services/api';
import type { ConsentStatus, Profile, User } from '@/types';
import { formatDate, storage, STORAGE_KEYS } from '@/utils/format';

const CONSENT_LABEL: Record<string, string> = {
  privacy_policy: 'Kebijakan Privasi',
  ai_processing: 'Pemrosesan data oleh layanan AI',
  cv_processing: 'Analisis CV oleh layanan AI',
};

export default function ProfilePage() {
  useDocumentTitle('Profil & Privasi');
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => api.get<{ user: User; profile: Profile }>('/profile'));
  const consents = useAsync(() => api.get<ConsentStatus>('/profile/consents'));

  const [form, setForm] = useState({ name: '', education: '', current_position: '', career_goal: '' });
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<ApiError | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current_password: '', new_password: '' });
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<ApiError | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  const [dataModal, setDataModal] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [dangerErr, setDangerErr] = useState<ApiError | null>(null);
  const [dangerMsg, setDangerMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.user.name,
        education: data.profile.education ?? '',
        current_position: data.profile.current_position ?? '',
        career_goal: data.profile.career_goal ?? '',
      });
    }
  }, [data]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileErr(null);
    setProfileMsg(null);
    try {
      const res = await api.put<{ user: User; profile: Profile }>('/profile', form);
      setUser(res.user);
      setProfileMsg('Profil berhasil diperbarui.');
    } catch (err) {
      setProfileErr(err as ApiError);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    setPwErr(null);
    setPwMsg(null);
    try {
      const res = await api.put<{ message: string; csrf_token: string }>('/profile/password', pw);
      setCsrfToken(res.csrf_token);
      setPw({ current_password: '', new_password: '' });
      setPwMsg(res.message);
    } catch (err) {
      setPwErr(err as ApiError);
    } finally {
      setSavingPw(false);
    }
  };

  const toggleAi = async (granted: boolean) => {
    try {
      const res = await api.put<ConsentStatus>('/profile/consents', { type: 'ai_processing', granted });
      consents.setData(res);
    } catch (err) {
      setDangerErr(err as ApiError);
    }
  };

  const deleteData = async () => {
    setBusy(true);
    setDangerErr(null);
    try {
      await api.del('/profile/data');
      storage.remove(STORAGE_KEYS.reflectionDraft);
      storage.remove(STORAGE_KEYS.guestResult);
      setDataModal(false);
      setDangerMsg('Seluruh data pribadi (refleksi, percakapan, review CV, sesi interview, dan profil) telah dihapus.');
      setForm((f) => ({ ...f, education: '', current_position: '', career_goal: '' }));
    } catch (err) {
      setDangerErr(err as ApiError);
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    setBusy(true);
    setDangerErr(null);
    try {
      await api.del('/profile', { password: deletePw });
      storage.remove(STORAGE_KEYS.reflectionDraft);
      storage.remove(STORAGE_KEYS.guestResult);
      setUser(null);
      navigate('/', { replace: true });
    } catch (err) {
      setDangerErr(err as ApiError);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageContainer><Spinner /></PageContainer>;
  if (error || !data) return <PageContainer><Alert tone="error">{error?.message}</Alert></PageContainer>;

  return (
    <PageContainer>
      <PageHeader icon={<UserRound className="h-6 w-6" />} title="Profil & Privasi" description="Kelola informasi akun, persetujuan, dan data pribadimu." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-4 p-6" noValidate>
          <h2 className="flex items-center gap-2 text-lg font-bold"><UserRound className="h-5 w-5 text-primary" />Informasi profil</h2>
          <TextInput label="Email" value={data.user.email} disabled hint="Email tidak dapat diubah." />
          <TextInput label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={profileErr?.fields.name} maxLength={100} />
          <TextInput label="Pendidikan" optional value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="Contoh: S1 Psikologi, Universitas …" error={profileErr?.fields.education} maxLength={150} />
          <TextInput label="Posisi saat ini" optional value={form.current_position} onChange={(e) => setForm({ ...form, current_position: e.target.value })} placeholder="Contoh: Mahasiswa tingkat akhir" error={profileErr?.fields.current_position} maxLength={150} />
          <TextArea label="Tujuan karier" optional value={form.career_goal} onChange={(e) => setForm({ ...form, career_goal: e.target.value })} error={profileErr?.fields.career_goal} maxLength={1000} hint="Dipakai sebagai konteks oleh AI Career Assistant." />
          {profileMsg && <Alert tone="success">{profileMsg}</Alert>}
          {profileErr && !Object.keys(profileErr.fields).length && <Alert tone="error">{profileErr.message}</Alert>}
          <Button type="submit" loading={savingProfile}>Simpan profil</Button>
        </form>

        <div className="space-y-6">
          <form onSubmit={savePassword} className="card space-y-4 p-6" noValidate>
            <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound className="h-5 w-5 text-primary" />Ubah password</h2>
            <TextInput label="Password saat ini" type="password" autoComplete="current-password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} error={pwErr?.fields.current_password} />
            <TextInput label="Password baru" type="password" autoComplete="new-password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} error={pwErr?.fields.new_password} hint="Minimal 8 karakter, mengandung huruf dan angka." />
            {pwMsg && <Alert tone="success">{pwMsg}</Alert>}
            {pwErr && !Object.keys(pwErr.fields).length && <Alert tone="error">{pwErr.message}</Alert>}
            <Button type="submit" variant="secondary" loading={savingPw}>Perbarui password</Button>
          </form>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="h-5 w-5 text-primary" />Persetujuan</h2>
            {consents.loading ? <Spinner /> : consents.data && (
              <>
                <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-surface p-4">
                  <div>
                    <p className="text-sm font-semibold text-navy">Pemrosesan oleh layanan AI</p>
                    <p className="text-xs text-muted">Diperlukan untuk AI Career Assistant dan Persiapan Interview. CV selalu meminta persetujuan terpisah.</p>
                  </div>
                  <Button size="sm" variant={consents.data.ai_processing ? 'secondary' : 'primary'} onClick={() => void toggleAi(!consents.data!.ai_processing)}>
                    {consents.data.ai_processing ? 'Cabut' : 'Berikan'}
                  </Button>
                </div>
                <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-muted">Riwayat persetujuan</p>
                {consents.data.history.length ? (
                  <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                    {consents.data.history.map((h) => (
                      <li key={h.id} className="flex justify-between gap-2"><span>{CONSENT_LABEL[h.consent_type] ?? h.consent_type} <span className="text-xs text-muted">v{h.consent_version}</span></span><span className="text-xs text-muted">{formatDate(h.accepted_at, true)}</span></li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted">Belum ada.</p>}
              </>
            )}
          </section>
        </div>
      </div>

      <section className="card mt-6 border-red-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-red-700"><Database className="h-5 w-5" />Data pribadi</h2>
        <p className="mt-1 text-sm text-muted">Kamu memegang kendali penuh atas datamu.</p>
        {dangerMsg && <Alert tone="success" className="mt-4">{dangerMsg}</Alert>}
        {dangerErr && !accountModal && <Alert tone="error" className="mt-4">{dangerErr.message}</Alert>}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-navy">Hapus data pribadi</p>
            <p className="mt-1 text-sm text-muted">Menghapus semua refleksi, percakapan AI, review CV (termasuk file), sesi interview, dan data profil. Akun tetap aktif.</p>
            <Button className="mt-3" variant="secondary" onClick={() => setDataModal(true)} icon={<Trash2 className="h-4 w-4" />}>Hapus data pribadi</Button>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
            <p className="font-semibold text-red-700">Hapus akun</p>
            <p className="mt-1 text-sm text-muted">Menghapus akun beserta seluruh data secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
            <Button className="mt-3" variant="danger" onClick={() => { setDangerErr(null); setAccountModal(true); }} icon={<Trash2 className="h-4 w-4" />}>Hapus akun</Button>
          </div>
        </div>
      </section>

      <Modal open={dataModal} title="Hapus semua data pribadi?" onClose={() => setDataModal(false)} footer={<><Button variant="secondary" onClick={() => setDataModal(false)}>Batal</Button><Button variant="danger" loading={busy} onClick={() => void deleteData()}>Ya, hapus data</Button></>}>
        Semua refleksi, percakapan, review CV, sesi interview, dan data profil akan dihapus permanen. Akun dan riwayat persetujuanmu tetap ada.
      </Modal>
      <Modal open={accountModal} title="Hapus akun secara permanen?" onClose={() => setAccountModal(false)} footer={<><Button variant="secondary" onClick={() => setAccountModal(false)}>Batal</Button><Button variant="danger" loading={busy} disabled={!deletePw} onClick={() => void deleteAccount()}>Hapus akun</Button></>}>
        <p>Masukkan password untuk konfirmasi. Seluruh data akan dihapus dan tidak dapat dikembalikan.</p>
        <div className="mt-4">
          <TextInput label="Password" type="password" autoComplete="current-password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} error={dangerErr?.fields.password} />
        </div>
        {dangerErr && !dangerErr.fields.password && <Alert tone="error" className="mt-3">{dangerErr.message}</Alert>}
      </Modal>
    </PageContainer>
  );
}
