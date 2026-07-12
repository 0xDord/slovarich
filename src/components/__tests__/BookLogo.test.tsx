import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BookLogo } from '../BookLogo'

describe('BookLogo', () => {
  it('renders an svg', () => {
    const { container } = render(<BookLogo />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('defaults to 56px', () => {
    const { container } = render(<BookLogo />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('56')
    expect(svg.getAttribute('height')).toBe('56')
  })

  it('respects size prop', () => {
    const { container } = render(<BookLogo size={80} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('80')
  })

  it('contains the СЛОВ label inside the book', () => {
    const { container } = render(<BookLogo />)
    const text = container.querySelector('text')!
    expect(text.textContent).toBe('СЛОВ')
  })

  it('applies custom className', () => {
    const { container } = render(<BookLogo className="mr-2" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('mr-2')
  })
})
