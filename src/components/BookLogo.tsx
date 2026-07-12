interface Props {
  size?: number
  className?: string
}

export function BookLogo({ size = 56, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Book spine + pages */}
      <path
        d="M32 14 L52 22 L52 50 L32 42 L12 50 L12 22 Z"
        fill="var(--brand-yellow)"
        stroke="#E6B800"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Page split line */}
      <path
        d="M32 14 L32 42"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left page highlight */}
      <path
        d="M14 23 L30 17 L30 39 L14 46 Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
      />
      {/* Right page highlight */}
      <path
        d="M34 17 L50 23 L50 46 L34 39 Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
      />
      {/* СЛОВ text */}
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
        fontSize="9"
        fontWeight="800"
        fill="var(--brand-ink)"
        letterSpacing="0.5"
      >
        СЛОВ
      </text>
    </svg>
  )
}
