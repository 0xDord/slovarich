import type { LetterPair } from '../types'
import pairData from '../data/letterPairs.json'

interface PairData {
  version: number
  generatedAt: string
  threshold: { minWords: number; minLength: number }
  pairs: Array<LetterPair & { count: number; examples: string[] }>
}

const PAIRS: Array<LetterPair & { count: number; examples: string[] }> =
  (pairData as PairData).pairs

const FALLBACK: LetterPair = { first: 'А', last: 'К' }

export function generateLetterPair(prev?: LetterPair): LetterPair {
  if (PAIRS.length === 0) return FALLBACK
  for (let i = 0; i < 50; i++) {
    const candidate = PAIRS[Math.floor(Math.random() * PAIRS.length)]
    if (!prev) return candidate
    if (candidate.first !== prev.first || candidate.last !== prev.last) {
      return candidate
    }
  }
  return FALLBACK
}

export function getExamples(pair: LetterPair): string[] {
  const found = PAIRS.find(p => p.first === pair.first && p.last === pair.last)
  return found?.examples ?? []
}
