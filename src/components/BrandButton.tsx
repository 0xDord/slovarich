import type { CSSProperties, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface Props {
  onPress: () => void
  children: ReactNode
  variant?: Variant
  className?: string
  ariaLabel?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-yellow text-brand-ink shadow-brand-yellow',
  ghost:   'bg-white/10 text-white border border-white/40 backdrop-blur-sm',
  danger:  'bg-brand-danger text-white',
}

export function BrandButton({
  onPress,
  children,
  variant = 'primary',
  className = '',
  ariaLabel,
  disabled = false,
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={(e) => {
        if (disabled) return
        e.preventDefault()
        onPress()
      }}
      style={{ touchAction: 'manipulation' } as CSSProperties}
      className={`select-none rounded-2xl font-semibold transition-[filter,transform] duration-75 active:brightness-95 active:scale-[0.96] disabled:opacity-40 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
