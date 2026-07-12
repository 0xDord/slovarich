import type { CSSProperties } from 'react'

interface Props<T extends string | number> {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  format: (v: T) => string
  'aria-label'?: string
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  format,
  'aria-label': ariaLabel,
}: Props<T>) {
  const selectedIndex = Math.max(0, options.indexOf(value))
  const count = options.length

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="relative flex bg-brand-card border border-brand-card-border backdrop-blur-sm rounded-2xl p-1"
    >
      <div
        data-indicator
        aria-hidden="true"
        className="absolute top-1 bottom-1 bg-brand-yellow rounded-xl shadow-brand-yellow transition-transform duration-200 ease-out"
        style={{
          left: '0.25rem',
          right: '0.25rem',
          width: `calc((100% - 0.5rem) / ${count})`,
          transform: `translateX(${selectedIndex * 100}%)`,
        } as CSSProperties}
      />
      {options.map(opt => {
        const selected = opt === value
        return (
          <button
            key={String(opt)}
            type="button"
            role="radio"
            aria-checked={selected}
            onPointerDown={(e) => {
              e.preventDefault()
              onChange(opt)
            }}
            style={{ touchAction: 'manipulation' } as CSSProperties}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors duration-150 ${
              selected ? 'text-brand-ink' : 'text-white/80'
            }`}
          >
            {format(opt)}
          </button>
        )
      })}
    </div>
  )
}
