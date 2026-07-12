import type { ElementType, ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function GlassCard({ children, className = '', as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={`bg-brand-card backdrop-blur-sm border border-brand-card-border rounded-2xl shadow-brand-sm ${className}`}
    >
      {children}
    </Tag>
  )
}
