import type { CSSProperties, ReactNode } from 'react'

type Variant = 'primary' | 'danger' | 'neutral'

interface Props {
  onPress: () => void
  children: ReactNode
  variant?: Variant
  className?: string
  ariaLabel?: string
  disabled?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-tg-button text-tg-btn-text',
  danger: 'bg-red-500 text-white',
  neutral: 'bg-tg-sec-bg text-tg-text',
}

export function PrimaryButton({
  onPress,
  children,
  variant = 'primary',
  className = '',
  ariaLabel,
  disabled = false,
}: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={(e) => {
        if (disabled) return
        e.preventDefault()
        onPress()
      }}
      style={{ touchAction: 'manipulation' } as CSSProperties}
      className={`select-none rounded-2xl font-semibold transition-[filter,transform] duration-75 active:brightness-90 active:scale-[0.98] disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
