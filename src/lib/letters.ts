import type { LetterPair } from '../types'

const ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

const NOT_FIRST = new Set(['Ъ', 'Ь', 'Ы', 'Й'])
const NOT_LAST = new Set(['Ъ', 'Ь'])

const FIRST_POOL = ALPHABET.filter(c => !NOT_FIRST.has(c))
const LAST_POOL = ALPHABET.filter(c => !NOT_LAST.has(c))

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateLetterPair(prev?: LetterPair): LetterPair {
  for (let i = 0; i < 50; i++) {
    const first = randomFrom(FIRST_POOL)
    let last = randomFrom(LAST_POOL)
    let attempts = 0
    while (last === first && attempts < 10) {
      last = randomFrom(LAST_POOL)
      attempts++
    }
    if (last === first) continue

    const candidate: LetterPair = { first, last }
    if (!prev || candidate.first !== prev.first || candidate.last !== prev.last) {
      return candidate
    }
  }
  return { first: 'А', last: 'К' }
}

export const LETTER_CONSTRAINTS = {
  alphabet: ALPHABET,
  notFirst: NOT_FIRST,
  notLast: NOT_LAST,
}
