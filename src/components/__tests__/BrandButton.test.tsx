import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandButton } from '../BrandButton'

describe('BrandButton', () => {
  it('renders children', () => {
    render(<BrandButton onPress={() => {}}>Click me</BrandButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onPress on pointer down (multitouch-safe)', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(<BrandButton onPress={onPress}>Go</BrandButton>)
    await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('Go') })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant classes by default', () => {
    render(<BrandButton onPress={() => {}}>Go</BrandButton>)
    const button = screen.getByText('Go').closest('button')!
    expect(button.className).toContain('bg-brand-yellow')
    expect(button.className).toContain('text-brand-ink')
  })

  it('applies ghost variant classes', () => {
    render(<BrandButton onPress={() => {}} variant="ghost">Ghost</BrandButton>)
    const button = screen.getByText('Ghost').closest('button')!
    expect(button.className).toContain('bg-white/10')
    expect(button.className).toContain('text-white')
  })

  it('applies danger variant classes', () => {
    render(<BrandButton onPress={() => {}} variant="danger">Del</BrandButton>)
    const button = screen.getByText('Del').closest('button')!
    expect(button.className).toContain('bg-brand-danger')
  })

  it('does not call onPress when disabled', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(<BrandButton onPress={onPress} disabled>No</BrandButton>)
    await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('No') })
    expect(onPress).not.toHaveBeenCalled()
  })
})
