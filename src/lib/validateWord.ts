import type { LetterPair } from '../types'

export const MIN_WORD_LENGTH = 3

export function validateWord(word: string, letters: LetterPair): boolean {
  if (typeof word !== 'string') return false
  const w = word.trim().toLowerCase()
  if (w.length < MIN_WORD_LENGTH) return false

  const first = letters.first.toLowerCase()
  const last = letters.last.toLowerCase()

  return w.startsWith(first) && w.endsWith(last)
}
