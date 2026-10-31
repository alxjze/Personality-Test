import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/format';

const links = [
  { to: '/career-reflection', label: 'Refleksi Karier' },
  { to: '/career-assistant', label: 'AI Assistant' },
  { to: '/cv-reviewer', label: 'CV Reviewer' },
  { to: '/interview-preparation', label: 'Persiapan Interview' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const doLogout = async () => {
    await logout();
    navigate('/');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'text-primary' : 'text-ink hover:text-primary');

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Navigasi utama">
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {user && <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>}
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>{l.label}</NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy hover:bg-primary-50"
                aria-expanded={menu}
                aria-haspopup="menu"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                <span className="max-w-[140px] truncate">{user.name}</span>
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
              {menu && (
                <div role="menu" className="card absolute right-0 mt-2 w-52 p-1.5">
                  <Link role="menuitem" to="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-primary-50"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
                  <Link role="menuitem" to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-primary-50"><UserRound className="h-4 w-4" />Profil & Privasi</Link>
                  <button role="menuitem" type="button" onClick={doLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={buttonClass('secondary', 'sm')}>Masuk</Link>
              <Link to="/register" className={buttonClass('primary', 'sm')}>Daftar</Link>
            </>
          )}
        </div>
        <button type="button" className="rounded-lg p-2 text-navy lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Tutup menu' : 'Buka menu'}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-nav" className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {user && <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>}
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navClass}>{l.label}</NavLink>
            ))}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <Link to="/profile" className={buttonClass('secondary', 'sm', 'flex-1')}>Profil</Link>
                  <button type="button" onClick={doLogout} className={buttonClass('ghost', 'sm', 'flex-1 text-red-600')}>Keluar</button>
                </>
              ) : (
                <>
                  <Link to="/login" className={buttonClass('secondary', 'sm', 'flex-1')}>Masuk</Link>
                  <Link to="/register" className={buttonClass('primary', 'sm', 'flex-1')}>Daftar</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
