import { describe, it, expect } from 'vitest'
import { validateWord, MIN_WORD_LENGTH } from '../validateWord'

const LETTERS = { first: 'А', last: 'К' }

describe('validateWord', () => {
  it('accepts a word matching both letters', () => {
    expect(validateWord('Автопарк', LETTERS)).toBe(true)
  })

  it('is case-insensitive on both word and letters', () => {
    expect(validateWord('автопарк', LETTERS)).toBe(true)
    expect(validateWord('АВТОПАРК', LETTERS)).toBe(true)
    expect(validateWord('паук', { first: 'п', last: 'К' })).toBe(true)
  })

  it('trims whitespace before checking', () => {
    expect(validateWord('  Автопарк  ', LETTERS)).toBe(true)
  })

  it('rejects words with wrong first letter', () => {
    expect(validateWord('Бублик', LETTERS)).toBe(false)
  })

  it('rejects words with wrong last letter', () => {
    expect(validateWord('Адрес', LETTERS)).toBe(false)
  })

  it('rejects words shorter than min length', () => {
    expect(validateWord('АК', LETTERS)).toBe(false)
    expect(MIN_WORD_LENGTH).toBe(3)
  })

  it('rejects empty / non-string input', () => {
    expect(validateWord('', LETTERS)).toBe(false)
    expect(validateWord('   ', LETTERS)).toBe(false)
    expect(validateWord(null as unknown as string, LETTERS)).toBe(false)
  })

  it('accepts a 3-letter word matching both letters', () => {
    expect(validateWord('Аук', LETTERS)).toBe(true)
  })
})
