type BrandLogoProps = {
  className?: string;
  title?: string;
};

export function BrandLogo({ className = "h-9 w-9", title = "Educa AI" }: BrandLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="13" y="19" width="38" height="34" rx="12" fill="url(#brand-logo-body)" />
      <rect x="18" y="25" width="28" height="19" rx="8" fill="rgba(255,255,255,0.2)" />
      <circle cx="25" cy="34" r="3.4" fill="#eff6ff" />
      <circle cx="39" cy="34" r="3.4" fill="#eff6ff" />
      <path
        d="M26 43c3.2 2.1 8.8 2.1 12 0"
        stroke="#eff6ff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M32 19v-5" stroke="#dbeafe" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="10" r="4" fill="#bfdbfe" />
      <path d="M19 18 32 11l13 7-13 7-13-7Z" fill="#1e3a8a" />
      <path d="M45 18v8" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="45" cy="28" r="2.2" fill="#bfdbfe" />
      <path d="M13 33H8M56 33h-5" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
      <defs>
        <linearGradient id="brand-logo-body" x1="14" y1="20" x2="50" y2="53" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="0.48" stopColor="#2563eb" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
