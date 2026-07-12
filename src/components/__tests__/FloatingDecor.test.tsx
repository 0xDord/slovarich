import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FloatingDecor } from '../FloatingDecor'

describe('FloatingDecor', () => {
  it('renders 10 letters at default density', () => {
    const { container } = render(<FloatingDecor />)
    const letters = container.querySelectorAll('[data-decor-letter]')
    expect(letters.length).toBe(10)
  })

  it('renders 6 letters at low density', () => {
    const { container } = render(<FloatingDecor density="low" />)
    const letters = container.querySelectorAll('[data-decor-letter]')
    expect(letters.length).toBe(6)
  })

  it('container is pointer-events-none', () => {
    const { container } = render(<FloatingDecor />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('pointer-events-none')
  })

  it('all letters use brand-cream color and blur', () => {
    const { container } = render(<FloatingDecor />)
    const letters = container.querySelectorAll('[data-decor-letter]')
    letters.forEach(el => {
      const cls = (el as HTMLElement).className
      expect(cls).toContain('text-brand-cream')
      expect(cls).toContain('opacity-')
    })
  })
})
