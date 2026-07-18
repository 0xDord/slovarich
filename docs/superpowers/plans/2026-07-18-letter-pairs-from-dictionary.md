# Генерация пар букв из словаря — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить генератор случайных пар букв на выборку из прекомпьют-списка пар, для которых в словаре существуют реальные слова; добавить кнопку «Не помню слово?» с примерами.

**Architecture:** Build-time Node-скрипт читает два текстовых файла (сторонний список существительных + ручной сленг/имена), группирует по `(first, last)`, отбраковывает редкие пары, пишет `src/data/letterPairs.json`. Приложение импортирует JSON через `resolveJsonModule` и сэмплит из него. Полный словарь в бандл не попадает.

**Tech Stack:** React 18 + TypeScript, Vite 6, Node ESM (`node:url`, `node:fs`), `resolveJsonModule` для импорта JSON. Без тестов по решению пользователя.

## Global Constraints

- Порог: `minWords = 3` (минимум 3 слова на пару, иначе пара отбрасывается)
- Минимальная длина слова: `minLength = 3` буквы
- Нормализация: `toLowerCase()` + `trim()` + `Ё→Е`; слова с символами вне `а-я` (после нормализации) отбрасываются
- Примеры: топ-3 самых коротких слов на пару; при равенстве длины — по алфавиту
- Защита от регрессии: если после фильтра осталось меньше 50 пар — скрипт падает
- Источник лемм: <https://github.com/Harrix/Russian-Nouns>, MIT
- Бандл приложения: только `src/data/letterPairs.json`; сырые словари в `data/` (в репо, но не в бандл)
- Сигнатура `generateLetterPair(prev?: LetterPair): LetterPair` сохраняется (используется в `src/game/useGame.ts`)

---

## File Structure

| Файл | Статус | Ответственность |
|---|---|---|
| `data/raw-nouns.txt` | создать | ~36К лемм существительных из Harrix/Russian-Nouns |
| `data/extra-words.txt` | создать | ручной сленг + имена собственные, по строке |
| `scripts/build-pairs.mjs` | создать | build-time генератор JSON из двух файлов выше |
| `src/data/letterPairs.json` | создать | output скрипта, коммитится в git |
| `src/lib/letters.ts` | переписать | `generateLetterPair` + `getExamples` из JSON |
| `src/lib/__tests__/letters.test.ts` | удалить | старые тесты завязаны на удалённые `LETTER_CONSTRAINTS` |
| `src/components/GameScreen.tsx` | изменить | добавить блок «Не помню слово?» с примерами |
| `package.json` | изменить | +скрипт `build:pairs` |
| `README.md` | изменить | обновить описание механики генерации |

---

### Task 1: Источники слов

**Files:**
- Create: `data/raw-nouns.txt`
- Create: `data/extra-words.txt`

**Interfaces:** нет (только данные на диске для Task 2)

- [ ] **Step 1: Создать директорию `data/`**

```bash
mkdir -p data
```

- [ ] **Step 2: Скачать `raw-nouns.txt` из Harrix/Russian-Nouns**

```bash
curl -fsSL https://raw.githubusercontent.com/Harrix/Russian-Nouns/main/russian_nouns.txt -o data/raw-nouns.txt
wc -l data/raw-nouns.txt
```

Ожидается: ~36 000 строк. Если `curl` упадёт (404, например, если файл переехал), зайти на <https://github.com/Harrix/Russian-Nouns>, найти актуальный путь к `russian_nouns.txt`, скачать вручную и положить в `data/raw-nouns.txt`. Альтернативный источник — форки из поиска GitHub по `russian_nouns.txt`.

- [ ] **Step 3: Проверить первые строки файла**

```bash
head -10 data/raw-nouns.txt
```

Ожидается: список существительных в нижнем регистре, по одному на строку (`абажур`, `абзац`, …). Если файл начинается с BOM или содержит разделители — оставить как есть, скрипт в Task 2 это переварит.

- [ ] **Step 4: Создать `data/extra-words.txt` с кураторским набором**

Записать в `data/extra-words.txt` следующее содержимое:

```
# Ручная добавка к литературному словарю: сленг, современные заимствования,
# имена собственные. По одному слову на строку. Строки, начинающиеся с #, игнорируются.

# Сленг / современные
кринж
вайб
краш
чилить
дроп
свайп
лайк
репост
стрим
флекс
база
имба
рофл
факап
дедлайн
митинг
стендап
ревью
деплой
крашнуть
свайпнуть
тренд
хейт
токсик
абьюз
фастфуд
хейтить
триггер
фрустрация

# Имена собственные (топонимы, бренды)
Москва
Россия
Камчатка
Царицыно
Байкал
Гугл
Яндекс
Тинькофф
Воронеж
Сибирь
Урал
Волга
Дон
Амур
```

(Примечание: дубликаты скрипт удалит сам, так что повторы в файле не страшны.)

- [ ] **Step 5: Закоммитить**

```bash
git add data/raw-nouns.txt data/extra-words.txt
git commit -m "feat(data): seed russian-noun list and curated slang/proper-noun extras"
```

---

### Task 2: Build-скрипт и первый JSON

**Files:**
- Create: `scripts/build-pairs.mjs`
- Create: `src/data/letterPairs.json` (генерируется)
- Modify: `package.json` (добавить скрипт `build:pairs`)

**Interfaces:**
- Consumes: `data/raw-nouns.txt`, `data/extra-words.txt` (из Task 1)
- Produces: `src/data/letterPairs.json` со схемой:
  ```ts
  {
    version: 1,
    generatedAt: string,         // ISO timestamp
    threshold: { minWords: 3, minLength: 3 },
    pairs: Array<{
      first: string,             // uppercase, 1 char
      last: string,              // uppercase, 1 char
      count: number,             // сколько слов в словаре на эту пару
      examples: string[]         // топ-3 коротких лемм
    }>
  }
  ```

- [ ] **Step 1: Создать директории**

```bash
mkdir -p scripts src/data
```

- [ ] **Step 2: Написать `scripts/build-pairs.mjs`**

Записать в `scripts/build-pairs.mjs`:

```js
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
```

- [ ] **Step 3: Добавить npm-скрипт в `package.json`**

В секции `"scripts"` добавить строку `build:pairs`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "build:pairs": "node scripts/build-pairs.mjs",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Остальные поля `package.json` оставить без изменений.

- [ ] **Step 4: Запустить скрипт и проверить вывод**

```bash
npm run build:pairs
wc -l src/data/letterPairs.json
head -25 src/data/letterPairs.json
```

Ожидается: в консоли `Wrote NNN pairs to .../src/data/letterPairs.json`, где NNN — порядка 200–500. В начале JSON — `version`, `generatedAt`, `threshold`, затем массив `pairs`. Пары отсортированы по алфавиту. Если скрипт упал с сообщением про `min 50 pairs` — значит `raw-nouns.txt` пустой или не то содержимое; вернуться к Task 1 Step 2.

- [ ] **Step 5: Проверить вывод глазами**

Глазами прочесть первые 5 пар из JSON. Для каждой пары проверить руками:
- `examples[0]` — самое короткое или одно из самых коротких слов на эту пару в `raw-nouns.txt`
- Каждое слово в `examples` начинается на `first` (lowercase) и заканчивается на `last` (lowercase)
- Ни в одном слове из `examples` нет буквы `ё`, заглавных букв, дефисов

Если что-то не так — дебажить скрипт, не двигаться дальше.

- [ ] **Step 6: Закоммитить**

```bash
git add scripts/build-pairs.mjs src/data/letterPairs.json package.json package-lock.json
git commit -m "feat(scripts): add build:pairs script that produces letterPairs.json from sources"
```

---

### Task 3: Переписать `letters.ts`

**Files:**
- Modify: `src/lib/letters.ts` (полная перезапись)
- Delete: `src/lib/__tests__/letters.test.ts`

**Interfaces:**
- Consumes: `src/data/letterPairs.json` (из Task 2)
- Produces:
  ```ts
  export function generateLetterPair(prev?: LetterPair): LetterPair
  export function getExamples(pair: LetterPair): string[]
  ```
  Сигнатура `generateLetterPair` намеренно совпадает со старой, чтобы `src/game/useGame.ts` не требовал изменений.

- [ ] **Step 1: Полностью перезаписать `src/lib/letters.ts`**

Заменить всё содержимое файла на:

```ts
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
```

- [ ] **Step 2: Удалить устаревший тест-файл**

```bash
rm src/lib/__tests__/letters.test.ts
```

Файл тестировал `LETTER_CONSTRAINTS` и хардкод-списки `NOT_FIRST`/`NOT_LAST`, которые больше не существуют.

- [ ] **Step 3: Проверить типы**

```bash
npx tsc -b --noEmit
```

Ожидается: без ошибок. Если TypeScript ругается на импорт JSON — убедиться, что в `tsconfig.json` есть `"resolveJsonModule": true` (там уже включено, проверять не нужно).

- [ ] **Step 4: Проверить, что существующие тесты не сломаны**

```bash
npm test
```

Ожидается: все остальные тесты (`GlassCard`, `SegmentedControl`, `Confetti`, `AppShell`, `BookLogo`, `FloatingDecor`, `BrandButton`, `validateWord`, `useGame`) проходят. Если `useGame.test.ts` ссылается на конкретные буквы из `generateLetterPair` — он может сломаться. В этом случае открыть `src/game/__tests__/useGame.test.ts`, найти зависящие от букв ассерты и ослабить их до проверки `letters.first !== letters.last`.

- [ ] **Step 5: Запустить dev-сервер и убедиться, что пары грузятся**

```bash
npm run dev
```

Открыть в браузере <http://localhost:5173/>, начать игру, несколько раз нажать «Следующее слово». Убедиться:
- Буквы всегда разные (`first !== last`)
- Видны пары, которых раньше быть не могло (например, на букву, которая раньше была запрещена — но таких нет, ограничения стали мягче)
- Не появляются пары, которых нет в `src/data/letterPairs.json`

Остановить dev-сервер (`Ctrl+C`).

- [ ] **Step 6: Закоммитить**

```bash
git add src/lib/letters.ts src/lib/__tests__/letters.test.ts
git commit -m "refactor(letters): generate pairs from precomputed dictionary JSON"
```

(Если в Step 4 правился `useGame.test.ts` — включить его в коммит тоже.)

---

### Task 4: Кнопка «Не помню слово?» в GameScreen

**Files:**
- Modify: `src/components/GameScreen.tsx`

**Interfaces:**
- Consumes: `getExamples(pair: LetterPair): string[]` из Task 3
- Produces: UI-элемент под кнопкой «Следующее слово» показывает до 3 примеров слов на текущую пару

- [ ] **Step 1: Обновить импорты в `src/components/GameScreen.tsx`**

Текущая первая строка файла:

```tsx
import { useEffect, useRef, type CSSProperties } from 'react'
```

Заменить на:

```tsx
import { useEffect, useRef, useState, type CSSProperties } from 'react'
```

Текущая строка импортов lucide-react (строка 2):

```tsx
import { Minus, Plus, RefreshCw } from 'lucide-react'
```

Заменить на:

```tsx
import { Eye, Minus, Plus, RefreshCw } from 'lucide-react'
```

После существующего импорта `import { useHaptics } from '../hooks/useHaptics'` добавить новую строку:

```tsx
import { getExamples } from '../lib/letters'
```

- [ ] **Step 2: Добавить состояние и примеры в тело `GameScreen`**

Найти в теле функции `GameScreen` строки (существующий код):

```tsx
  const { config, scores, round, letters } = state
  const haptics = useHaptics()
```

Заменить на:

```tsx
  const { config, scores, round, letters } = state
  const haptics = useHaptics()
  const [showExamples, setShowExamples] = useState(false)
  const examples = getExamples(letters)

  useEffect(() => {
    setShowExamples(false)
  }, [letters.first, letters.last, round])
```

- [ ] **Step 3: Добавить обработчик для кнопки**

В существующем наборе хендлеров (`handleAward`, `handlePenalize`, `handleNextWord`) добавить ещё один — `handleToggleExamples`. После `handleNextWord` вставить:

```tsx
  const handleNextWord = () => {
    haptics.select()
    nextWord()
  }

  const handleToggleExamples = () => {
    haptics.select()
    setShowExamples(v => !v)
  }
```

- [ ] **Step 4: Добавить UI-блок под кнопкой «Следующее слово»**

Найти в JSX существующий блок:

```tsx
          <BrandButton
            onPress={handleNextWord}
            variant="ghost"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 !rounded-full text-sm"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.25} />
            Следующее слово
          </BrandButton>
        </div>
```

Заменить на:

```tsx
          <BrandButton
            onPress={handleNextWord}
            variant="ghost"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 !rounded-full text-sm"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.25} />
            Следующее слово
          </BrandButton>

          {examples.length > 0 && (
            <>
              <BrandButton
                onPress={handleToggleExamples}
                variant="ghost"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 !rounded-full text-xs"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={2.25} />
                Не помню слово?
              </BrandButton>
              {showExamples && (
                <GlassCard className="mt-3 px-4 py-3 max-w-xs">
                  <div className="text-white/60 text-[0.65rem] uppercase tracking-[0.2em] mb-1">
                    Примеры
                  </div>
                  <div className="text-white text-base font-semibold capitalize">
                    {examples.join(' · ')}
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
```

- [ ] **Step 5: Проверить типы**

```bash
npx tsc -b --noEmit
```

Ожидается: без ошибок. Частые проблемы: `Eye` не найден (проверить, что lucide-react установлен и версия поддерживает `Eye` — в `lucide-react@0.469.0` есть), `useState`/`useEffect` не импортированы (Step 1).

- [ ] **Step 6: Проверить в браузере**

```bash
npm run dev
```

Открыть <http://localhost:5173/>, начать игру. Убедиться:
- Под кнопкой «Следующее слово» появилась маленькая кнопка «Не помню слово?»
- Тап показывает карточку с 3 словами через `·`
- Повторный тап — скрывает карточку
- После нажатия «Следующее слово» (или «+1») карточка автоматически скрывается
- Все три слова на экране начинаются на текущую первую букву и заканчиваются на последнюю

Остановить dev-сервер.

- [ ] **Step 7: Закоммитить**

```bash
git add src/components/GameScreen.tsx
git commit -m "feat(game): add 'Не помню слово?' button showing example words from dictionary"
```

---

### Task 5: Обновить README

**Files:**
- Modify: `README.md`

**Interfaces:** нет

- [ ] **Step 1: Обновить абзац про механику раунда**

Найти в `README.md` строку:

```
- **Раунд:** алгоритм выдаёт две случайные буквы (кириллица, исключены `Ъ`, `Ь`, `Ы`, `Й` на старте и `Ъ`, `Ь` в конце). Буквы показываются крупно в верхней части экрана.
```

Заменить на:

```
- **Раунд:** алгоритм выдаёт две буквы кириллицы (первая и последняя), выбранные из предподсчитанного списка валидных пар — для каждой пары в словаре существует минимум 3 реальных слова. Список генерируется из `data/raw-nouns.txt` ( lemma-список существительных) и `data/extra-words.txt` (ручной сленг/имена собственные) через `npm run build:pairs` → `src/data/letterPairs.json`. Под кнопкой «Следующее слово» есть «Не помню слово?» — показывает 3 коротких примера.
```

- [ ] **Step 2: Обновить секцию «Структура»**

Найти блок:

```
├── lib/
│   ├── letters.ts              # Генератор пар букв
│   ├── validateWord.ts         # Заглушка по ТЗ (не используется в основном флоу)
│   └── telegram.ts             # TWA SDK wrapper
```

Заменить на:

```
├── data/
│   └── letterPairs.json        # Сгенерированный список валидных пар (npm run build:pairs)
├── lib/
│   ├── letters.ts              # Сэмплинг пар из letterPairs.json + getExamples()
│   ├── validateWord.ts         # Заглушка по ТЗ (не используется в основном флоу)
│   └── telegram.ts             # TWA SDK wrapper
```

- [ ] **Step 3: Добавить запись в таблицу команд**

Найти:

```
| `npm run build` | Production-сборка в `dist/` (tsc + vite build) |
```

После неё добавить строку:

```
| `npm run build:pairs` | Перегенерить `src/data/letterPairs.json` из `data/*.txt` |
```

- [ ] **Step 4: Закоммитить**

```bash
git add README.md
git commit -m "docs: update README for dictionary-backed letter pair generation"
```

---

## Self-review checklist (после выполнения всех задач)

- [ ] `npm run build:pairs` отрабатывает без ошибок, JSON обновляется
- [ ] `npm run build` собирается без ошибок TypeScript
- [ ] `npm test` проходит (старые тесты кроме `letters.test.ts` не сломаны)
- [ ] В игре не выпадают пары с одинаковыми буквами (`first !== last`)
- [ ] В игре не выпадают пары, которых нет в `letterPairs.json`
- [ ] Кнопка «Не помнишь слово?» появляется на любой выпавшей паре (т.к. все пары имеют ≥3 примеров)
- [ ] README актуален
