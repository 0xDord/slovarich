import type { ReactNode } from 'react'
import { FloatingDecor } from './FloatingDecor'

interface Props {
  children: ReactNode
  decorDensity?: 'full' | 'low'
  className?: string
}

export function AppShell({ children, decorDensity = 'full', className = '' }: Props) {
  return (
    <div className={`app-bg screen-mount relative h-full w-full overflow-hidden ${className}`}>
      <FloatingDecor density={decorDensity} />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
