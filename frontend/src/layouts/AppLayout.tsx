import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function AppLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        Lewati ke konten
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function PageContainer({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div className={`container-page py-8 sm:py-12 ${narrow ? 'max-w-3xl' : ''}`}>{children}</div>;
}
