/**
 * Flat illustrations drawn in the brand palette (no stock photography available yet).
 * To use a real photo instead, replace <HeroPerson /> with an <img> of the same aspect ratio.
 */

export function HeroPerson({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 470" className={className} role="img" aria-label="Ilustrasi seorang mahasiswa sedang merenungkan arah kariernya">
      <defs>
        <linearGradient id="hp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D6E6FF" />
          <stop offset="1" stopColor="#B3D0FF" />
        </linearGradient>
        <linearGradient id="hp-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A6DF4" />
          <stop offset="1" stopColor="#1467ED" />
        </linearGradient>
        <clipPath id="hp-clip">
          <path d="M40 470 V215 a180 180 0 0 1 360 0 V470 Z" />
        </clipPath>
      </defs>
      {/* backdrop arch */}
      <path d="M40 470 V215 a180 180 0 0 1 360 0 V470 Z" fill="url(#hp-bg)" />
      <g clipPath="url(#hp-clip)">
        {/* torso: white tee + open overshirt */}
        <path d="M78 470 C86 392 128 352 178 340 L262 340 C312 352 352 392 362 470 Z" fill="url(#hp-shirt)" />
        <path d="M184 340 L256 340 L248 470 L192 470 Z" fill="#FFFFFF" />
        <path d="M184 340 L214 392 L196 470 L176 470 Z" fill="#1A57D6" />
        <path d="M256 340 L226 392 L244 470 L264 470 Z" fill="#1A57D6" />
        {/* neck */}
        <path d="M196 290 h48 v52 c-8 12 -40 12 -48 0 Z" fill="#E9B48F" />
        {/* head */}
        <ellipse cx="220" cy="222" rx="60" ry="70" fill="#F3C7A6" />
        <ellipse cx="160" cy="232" rx="11" ry="16" fill="#EDB993" />
        {/* hair */}
        <path d="M156 214 C150 160 186 132 226 134 C268 136 292 164 286 206 C280 186 266 176 250 172 C238 186 210 192 184 186 C174 196 166 206 162 226 Z" fill="#101D42" />
        <path d="M196 150 C214 132 250 132 266 150 C252 146 236 148 222 156 Z" fill="#1C3A70" />
        {/* brows + eyes (looking up, thinking) */}
        <path d="M190 204 q12 -8 24 -2" stroke="#101D42" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M232 202 q12 -6 24 2" stroke="#101D42" strokeWidth="4" strokeLinecap="round" fill="none" />
        <ellipse cx="203" cy="218" rx="5" ry="6" fill="#101D42" />
        <ellipse cx="244" cy="217" rx="5" ry="6" fill="#101D42" />
        <circle cx="205" cy="215" r="1.6" fill="#fff" />
        <circle cx="246" cy="214" r="1.6" fill="#fff" />
        {/* nose + smile */}
        <path d="M224 222 q-6 18 4 20" stroke="#D99B76" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M208 256 q14 10 30 0" stroke="#B5674A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* arm with hand on chin */}
        <path d="M318 470 C318 420 300 360 276 318 L250 300 L238 318 L262 350 C280 392 286 430 284 470 Z" fill="#1A57D6" />
        <path d="M232 312 C226 296 236 282 252 280 C270 278 280 292 276 306 C272 318 258 324 246 322 Z" fill="#F3C7A6" />
        <path d="M240 288 q10 -6 22 -2" stroke="#E2A984" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M238 298 q12 -5 24 -1" stroke="#E2A984" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      {/* thinking sparks */}
      <g stroke="#1467ED" strokeWidth="7" strokeLinecap="round">
        <path d="M330 92 l18 -22" />
        <path d="M352 120 l26 -6" />
        <path d="M318 70 l2 -26" />
      </g>
      <g stroke="#32A5FF" strokeWidth="5" strokeLinecap="round">
        <path d="M72 120 l-16 -10" />
        <path d="M66 150 h-20" />
      </g>
    </svg>
  );
}

export function SummitIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} role="img" aria-label="Ilustrasi puncak gunung dengan bendera">
      <rect width="160" height="120" rx="20" fill="#EAF2FF" />
      <circle cx="122" cy="30" r="12" fill="#D6E6FF" />
      <path d="M8 112 L58 46 L82 76 L102 52 L152 112 Z" fill="#32A5FF" />
      <path d="M58 46 L72 64 L62 62 L54 72 L48 60 Z" fill="#FFFFFF" />
      <path d="M8 112 L58 46 L70 112 Z" fill="#1467ED" opacity=".85" />
      <path d="M102 52 L152 112 L96 112 Z" fill="#101D42" opacity=".55" />
      <path d="M58 46 V18" stroke="#101D42" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 18 L80 25 L58 32 Z" fill="#F5B83D" />
    </svg>
  );
}
