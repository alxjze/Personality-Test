import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

/** Footer from the brand file, with every link pointing at a real route. */
const COLUMNS = [
  { title: 'Produk', links: [['Refleksi Karier', '/career-reflection'], ['AI Career Assistant', '/career-assistant'], ['CV Reviewer', '/cv-reviewer'], ['Persiapan Interview', '/interview-preparation']] },
  { title: 'Akun', links: [['Masuk', '/login'], ['Daftar Gratis', '/register'], ['Dashboard', '/dashboard']] },
  { title: 'Bantuan', links: [['Cara Kerja', '/#cara-kerja'], ['Profil & Privasi', '/profile']] },
  { title: 'Legal', links: [['Kebijakan Privasi', '/privasi'], ['Syarat & Ketentuan', '/syarat']] },
] as const;

export function Footer() {
  return (
    <footer className="no-print pb-8">
      <div className="mx-auto w-[min(1240px,calc(100%-32px))] lg:w-[min(1240px,calc(100%-48px))]">
        <div className="grid grid-cols-2 gap-6 border-t border-[#e4ebf6] py-7 lg:grid-cols-[1.65fr_repeat(4,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <Logo className="text-[18px]" />
            <p className="mt-3 max-w-[270px] text-sm text-[#75819a] lg:ml-[41px] lg:text-xs">Karier yang bermakna, dimulai dari memahami dirimu.</p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="mb-3 text-xs font-bold tracking-normal text-navy">{c.title}</h3>
              <ul className="space-y-2">
                {c.links.map(([label, to]) => (
                  <li key={to}>
                    {to.startsWith('/#') ? (
                      <a href={to} className="text-sm text-[#66738c] transition-colors hover:text-primary lg:text-xs">{label}</a>
                    ) : (
                      <Link to={to} className="text-sm text-[#66738c] transition-colors hover:text-primary lg:text-xs">{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-[#e8eef7] pt-4 text-[11px] text-[#95a0b2] sm:flex-row">
          <span>© {new Date().getFullYear()} Psikologia Career. Hak cipta dilindungi.</span>
          <span>Hasil refleksi dan saran AI adalah panduan eksplorasi, bukan tes psikologi tervalidasi atau diagnosis.</span>
        </div>
      </div>
    </footer>
  );
}
