import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-slate-200 bg-white [main:has(>section.bg-navy:last-child)+&]:mt-0">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-muted">Kenali potensimu. Bangun kariermu. Platform pengembangan karier dengan pendekatan psikologi dan AI.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-navy">Fitur</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-primary" to="/career-reflection">Refleksi Karier</Link></li>
            <li><Link className="hover:text-primary" to="/career-assistant">AI Career Assistant</Link></li>
            <li><Link className="hover:text-primary" to="/cv-reviewer">CV Reviewer</Link></li>
            <li><Link className="hover:text-primary" to="/interview-preparation">Persiapan Interview</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-navy">Akun</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-primary" to="/login">Masuk</Link></li>
            <li><Link className="hover:text-primary" to="/register">Daftar</Link></li>
            <li><Link className="hover:text-primary" to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-navy">Informasi</p>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-primary" to="/privasi">Kebijakan Privasi</Link></li>
            <li><Link className="hover:text-primary" to="/syarat">Syarat Penggunaan</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="container-page py-5 text-xs leading-relaxed text-muted">
          © {new Date().getFullYear()} Psikologia Career · psikologia.id — Hasil refleksi dan saran AI bersifat panduan eksplorasi, bukan tes psikologi tervalidasi, diagnosis, atau keputusan mutlak tentang kariermu.
        </div>
      </div>
    </footer>
  );
}
