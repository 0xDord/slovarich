import { describe, it, expect } from 'vitest'
import { generateLetterPair, LETTER_CONSTRAINTS } from '../letters'

describe('generateLetterPair', () => {
  it('returns two distinct letters', () => {
    for (let i = 0; i < 500; i++) {
      const { first, last } = generateLetterPair()
      expect(first).not.toBe(last)
    }
  })

  it('never uses forbidden first letters', () => {
    for (let i = 0; i < 500; i++) {
      const { first } = generateLetterPair()
      expect(LETTER_CONSTRAINTS.notFirst.has(first)).toBe(false)
    }
  })

  it('never uses forbidden last letters', () => {
    for (let i = 0; i < 500; i++) {
      const { last } = generateLetterPair()
      expect(LETTER_CONSTRAINTS.notLast.has(last)).toBe(false)
    }
  })

  it('returns Cyrillic uppercase letters only', () => {
    for (let i = 0; i < 200; i++) {
      const { first, last } = generateLetterPair()
      expect(LETTER_CONSTRAINTS.alphabet).toContain(first)
      expect(LETTER_CONSTRAINTS.alphabet).toContain(last)
    }
  })

  it('avoids repeating the previous pair (mostly)', () => {
    const prev = generateLetterPair()
    let repeats = 0
    for (let i = 0; i < 100; i++) {
      const next = generateLetterPair(prev)
      if (next.first === prev.first && next.last === prev.last) repeats++
    }
    expect(repeats).toBeLessThan(5)
  })
})
