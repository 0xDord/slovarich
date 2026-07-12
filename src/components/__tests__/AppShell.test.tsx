import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '../AppShell'

describe('AppShell', () => {
  it('renders children', () => {
    render(<AppShell><div>Hi</div></AppShell>)
    expect(screen.getByText('Hi')).toBeInTheDocument()
  })

  it('applies the gradient background class', () => {
    const { container } = render(<AppShell><div>X</div></AppShell>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('app-bg')
  })

  it('applies the screen-mount animation class', () => {
    const { container } = render(<AppShell><div>X</div></AppShell>)
    expect((container.firstElementChild as HTMLElement).className).toContain('screen-mount')
  })

  it('renders floating decor by default', () => {
    const { container } = render(<AppShell><div>X</div></AppShell>)
    expect(container.querySelectorAll('[data-decor-letter]').length).toBe(10)
  })

  it('passes decor density through', () => {
    const { container } = render(<AppShell decorDensity="low"><div>X</div></AppShell>)
    expect(container.querySelectorAll('[data-decor-letter]').length).toBe(6)
  })
})
