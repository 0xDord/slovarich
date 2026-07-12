import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Confetti } from '../Confetti'
import { CONFETTI_COLORS } from '../../lib/brand'

describe('Confetti', () => {
  it('renders 24 pieces', () => {
    const { container } = render(<Confetti />)
    const pieces = container.querySelectorAll('[data-confetti-piece]')
    expect(pieces.length).toBe(24)
  })

  it('container is pointer-events-none and absolute', () => {
    const { container } = render(<Confetti />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('pointer-events-none')
    expect(wrapper.className).toContain('absolute')
    expect(wrapper.className).toContain('inset-0')
  })

  it('every piece uses a color from CONFETTI_COLORS', () => {
    const { container } = render(<Confetti />)
    const pieces = container.querySelectorAll('[data-confetti-piece]')
    pieces.forEach(el => {
      const bg = (el as HTMLElement).style.backgroundColor
      // Match by RGB presence (jsdom may render color in rgb() form)
      const matched = CONFETTI_COLORS.some(c => {
        const hex = c.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        return bg === `rgb(${r}, ${g}, ${b})`
      })
      expect(matched).toBe(true)
    })
  })
})
