import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-extrabold text-navy ${className}`} aria-label="Psikologia Career — Beranda">
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden>
        <rect width="64" height="64" rx="16" fill="#155EEF" />
        <path d="M20 46V18h13.5a10 10 0 0 1 0 20H27" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="44" cy="46" r="4" fill="#67B7FF" />
      </svg>
      <span className="text-lg tracking-tight">
        Psikologia <span className="text-primary">Career</span>
      </span>
    </Link>
  );
}
