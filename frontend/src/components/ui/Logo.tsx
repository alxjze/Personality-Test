import { Link } from 'react-router-dom';

/** Brand mark from the brand file: tilted gradient tile with the "P" stroke. */
export function BrandMark({ size = 31 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 -rotate-[8deg] place-items-center bg-gradient-to-br from-[#32a5ff] to-[#0754dc] text-white shadow-[0_6px_14px_rgba(20,103,237,.25)]"
      style={{ width: size, height: size, borderRadius: '11px 11px 11px 4px' }}
      aria-hidden="true"
    >
      <svg className="rotate-[8deg]" width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
        <path d="M6 17.7 8.1 7.6a2.6 2.6 0 0 1 4.1-1.6l4.2 3.2a2.4 2.4 0 0 1-.7 4.2l-5.6 1.7" stroke="currentColor" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 whitespace-nowrap text-[19px] font-extrabold tracking-[-0.055em] text-navy ${className}`} aria-label="Psikologia Career, beranda">
      <BrandMark />
      <span>Psikologia <span className="text-primary">Career</span></span>
    </Link>
  );
}
