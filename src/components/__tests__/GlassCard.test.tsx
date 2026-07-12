import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '../GlassCard'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Inside</GlassCard>)
    expect(screen.getByText('Inside')).toBeInTheDocument()
  })

  it('applies glassmorphic classes', () => {
    render(<GlassCard>X</GlassCard>)
    const el = screen.getByText('X').closest('div')!
    expect(el.className).toContain('bg-brand-card')
    expect(el.className).toContain('backdrop-blur-sm')
    expect(el.className).toContain('border')
    expect(el.className).toContain('border-brand-card-border')
  })

  it('merges custom className', () => {
    render(<GlassCard className="mt-4">X</GlassCard>)
    expect(screen.getByText('X').closest('div')!.className).toContain('mt-4')
  })

  it('renders as a label when as="label"', () => {
    render(<GlassCard as="label">X</GlassCard>)
    expect(screen.getByText('X').tagName).toBe('LABEL')
  })
})
