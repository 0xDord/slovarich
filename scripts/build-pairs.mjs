import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const MIN_LENGTH = 3
const MIN_WORDS = 3
const TOP_N_EXAMPLES = 3
const MIN_PAIRS_AFTER_FILTER = 50

function loadWords(relativePath) {
  const content = readFileSync(join(root, relativePath), 'utf-8')
  return content
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('#'))
}

const RUSSIAN = /^[а-я]+$/

function normalize(word) {
  const w = word.toLowerCase().trim().replace(/ё/g, 'е')
  if (w.length < MIN_LENGTH) return null
  if (!RUSSIAN.test(w)) return null
  return w
}

const raw = loadWords('data/raw-nouns.txt')
const extra = loadWords('data/extra-words.txt')

const unique = new Set()
for (const w of [...raw, ...extra]) {
  const norm = normalize(w)
  if (norm) unique.add(norm)
}

const groups = new Map()
for (const w of unique) {
  const first = w[0].toUpperCase()
  const last = w[w.length - 1].toUpperCase()
  if (first === last) continue  // игра требует, чтобы буквы были разные
  const key = `${first}${last}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(w)
}

const pairs = []
for (const [key, list] of groups) {
  if (list.length < MIN_WORDS) continue
  const sorted = [...list].sort((a, b) =>
    a.length !== b.length ? a.length - b.length : a.localeCompare(b, 'ru')
  )
  pairs.push({
    first: key[0],
    last: key[1],
    count: list.length,
    examples: sorted.slice(0, TOP_N_EXAMPLES),
  })
}

pairs.sort((a, b) =>
  a.first !== b.first
    ? a.first.localeCompare(b.first, 'ru')
    : a.last.localeCompare(b.last, 'ru')
)

if (pairs.length < MIN_PAIRS_AFTER_FILTER) {
  console.error(
    `Only ${pairs.length} pairs after filter (min ${MIN_PAIRS_AFTER_FILTER}). Aborting.`
  )
  process.exit(1)
}

const output = {
  version: 1,
  generatedAt: new Date().toISOString(),
  threshold: { minWords: MIN_WORDS, minLength: MIN_LENGTH },
  pairs,
}

const outPath = join(root, 'src/data/letterPairs.json')
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n', 'utf-8')

console.log(`Wrote ${pairs.length} pairs to ${outPath}`)
