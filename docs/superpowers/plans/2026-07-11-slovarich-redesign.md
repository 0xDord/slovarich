# Словарич Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the two-player word game to "Словарич" and apply a cohesive bright-blue + golden-yellow visual language across all three screens (Setup, Game, Winner), matching the design language of `static/main_screen.png`.

**Architecture:** Replace Telegram-theme-driven styling with a forced brand palette (CSS custom properties + Tailwind extension). Introduce six new presentational components (`AppShell`, `FloatingDecor`, `BookLogo`, `GlassCard`, `SegmentedControl`, `Confetti`) and one renamed button (`PrimaryButton` → `BrandButton`). Rewrite the three screens using these primitives. No game logic, no new deps.

**Tech Stack:** React 18, TypeScript 5, Vite 6, Tailwind CSS 3.4, lucide-react, vitest.

## Global Constraints

- **No new runtime dependencies.** Confetti is built by hand with CSS keyframes (no `canvas-confetti`).
- **Brand palette is forced.** `applyThemeParams()` becomes a no-op — Telegram's theme variables must not override brand colors.
- **Game logic is untouched.** `useGame`, `useRoundTimer`, `letters.ts`, `validateWord.ts`, `useHaptics`, all `__tests__/` files: zero edits.
- **Multitouch behavior preserved.** All buttons use `onPointerDown` (not `onClick`) for iOS WebView multi-finger support.
- **UI copy is Russian.** No i18n layer.
- **Color tokens (exact hexes from spec §4.1):** `--brand-blue-from: #5CB3FF`, `--brand-blue-to: #2196F3`, `--brand-yellow: #FFD700`, `--brand-yellow-soft: #FFE25C`, `--brand-yellow-press: #F5C400`, `--brand-cream: #FFF9C4`, `--brand-ink: #1A2B4A`, `--brand-text: #FFFFFF`, `--brand-card: rgba(255,255,255,0.14)`, `--brand-card-border: rgba(255,255,255,0.28)`, `--brand-card-solid: #FFFFFF`, `--brand-danger: #FF5252`, `--brand-success: #69F0AE`. Light-blue accent for confetti: `#B3E0FF`.
- **App name:** Словарич. **Document title:** «Словарич — Игра в слова». **Tagline:** «Назови слово — забери балл».
- **Screenshot hero:** `static/main_screen.png` (2816×1536, ~1.83:1), imported via Vite asset import.

---

## File Structure

**New files:**
- `src/lib/brand.ts` — brand token constants (used by Confetti colors and any JS-side color refs)
- `src/components/AppShell.tsx` — gradient background + decor wrapper
- `src/components/FloatingDecor.tsx` — animated background letters
- `src/components/BookLogo.tsx` — inline SVG logo
- `src/components/GlassCard.tsx` — glassmorphic surface
- `src/components/SegmentedControl.tsx` — sliding pill option group
- `src/components/Confetti.tsx` — CSS confetti burst
- `src/components/BrandButton.tsx` — renamed/extended PrimaryButton

**New test files:**
- `src/components/__tests__/BrandButton.test.tsx`
- `src/components/__tests__/GlassCard.test.tsx`
- `src/components/__tests__/BookLogo.test.tsx`
- `src/components/__tests__/FloatingDecor.test.tsx`
- `src/components/__tests__/SegmentedControl.test.tsx`
- `src/components/__tests__/Confetti.test.tsx`
- `src/components/__tests__/AppShell.test.tsx`

**Deleted files:**
- `src/components/PrimaryButton.tsx` (replaced by `BrandButton.tsx`)

**Edited files:**
- `src/index.css`, `tailwind.config.js`, `src/lib/telegram.ts`, `src/App.tsx`
- `src/components/SetupScreen.tsx`, `src/components/GameScreen.tsx`, `src/components/WinnerScreen.tsx`
- `index.html`, `README.md`

---

## Task 1: Initialize git and verify clean baseline

**Files:**
- Create: `.gitignore` (if missing)
- Modify: repo root

**Why:** Establishes version control so every later task can commit a clean checkpoint. Currently this directory is not a git repo.

- [ ] **Step 1: Verify .gitignore covers node_modules and build output**

Run: `cat /Users/naualex/vibe_projects/tg_app_words/.gitignore`
Expected output should include `node_modules`, `dist`, and `*.tsbuildinfo`. If missing, write this content to `.gitignore`:

```
node_modules
dist
*.tsbuildinfo
.DS_Store
.vite
```

- [ ] **Step 2: Initialize the repo and make a baseline commit**

Run:
```bash
git init
git add .
git commit -m "chore: baseline before slovarich redesign"
```
Expected: commit succeeds, `git status` shows clean tree.

- [ ] **Step 3: Verify the existing test suite and build pass before any changes**

Run: `npm test && npm run build`
Expected: all `useGame` and `letters` tests pass; build completes without errors.

- [ ] **Step 4: Commit (no code changes — verification only)**

If the previous step made no file changes, skip the commit. Otherwise:
```bash
git add -A
git commit -m "chore: verify baseline tests and build"
```

---

## Task 2: Foundation — brand tokens, Tailwind config, index.css overhaul

**Files:**
- Create: `src/lib/brand.ts`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `src/lib/brand.ts` exports `BRAND_COLORS` constant (typed `Record<string, string>`); CSS variables `--brand-*` available in `:root`; Tailwind utilities `bg-brand-yellow`, `text-brand-ink`, `bg-brand-card`, `border-brand-card-border`, etc.; utility class `.app-bg` paints the gradient.

- [ ] **Step 1: Write `src/lib/brand.ts`**

Create the file with this exact content:

```ts
export const BRAND_COLORS = {
  blueFrom: '#5CB3FF',
  blueTo: '#2196F3',
  yellow: '#FFD700',
  yellowSoft: '#FFE25C',
  yellowPress: '#F5C400',
  cream: '#FFF9C4',
  ink: '#1A2B4A',
  text: '#FFFFFF',
  cardSolid: '#FFFFFF',
  danger: '#FF5252',
  success: '#69F0AE',
  lightBlueAccent: '#B3E0FF',
} as const

export const CONFETTI_COLORS: readonly string[] = [
  BRAND_COLORS.yellow,
  BRAND_COLORS.cream,
  BRAND_COLORS.text,
  BRAND_COLORS.lightBlueAccent,
] as const
```

- [ ] **Step 2: Replace `tailwind.config.js` contents**

Overwrite the file with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          'blue-from':    'var(--brand-blue-from)',
          'blue-to':      'var(--brand-blue-to)',
          yellow:         'var(--brand-yellow)',
          'yellow-soft':  'var(--brand-yellow-soft)',
          'yellow-press': 'var(--brand-yellow-press)',
          cream:          'var(--brand-cream)',
          ink:            'var(--brand-ink)',
          text:           'var(--brand-text)',
          'text-muted':   'var(--brand-text-muted)',
          card:           'var(--brand-card)',
          'card-border':  'var(--brand-card-border)',
          'card-solid':   'var(--brand-card-solid)',
          'card-text':    'var(--brand-card-text)',
          danger:         'var(--brand-danger)',
          success:        'var(--brand-success)',
        },
        // Keep tg-* aliases for backwards compat; :root values are repointed to brand palette.
        'tg-bg':       'var(--tg-theme-bg-color)',
        'tg-text':     'var(--tg-theme-text-color)',
        'tg-hint':     'var(--tg-theme-hint-color)',
        'tg-button':   'var(--tg-theme-button-color)',
        'tg-btn-text': 'var(--tg-theme-button-text-color)',
        'tg-sec-bg':   'var(--tg-theme-secondary-bg-color)',
        'tg-link':     'var(--tg-theme-link-color)',
      },
      fontFamily: {
        sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      },
      boxShadow: {
        'brand-sm':     '0 2px 8px rgba(0, 0, 0, 0.12)',
        'brand-md':     '0 8px 24px rgba(0, 0, 0, 0.18)',
        'brand-yellow': '0 6px 20px rgba(255, 215, 0, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Replace `src/index.css` contents**

Overwrite the file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand gradient background */
    --brand-blue-from:    #5CB3FF;
    --brand-blue-to:      #2196F3;

    /* Yellow accent family */
    --brand-yellow:       #FFD700;
    --brand-yellow-soft:  #FFE25C;
    --brand-yellow-press: #F5C400;

    /* Decorative */
    --brand-cream:        #FFF9C4;

    /* Text */
    --brand-ink:          #1A2B4A;
    --brand-text:         #FFFFFF;
    --brand-text-muted:   rgba(255, 255, 255, 0.72);

    /* Surfaces */
    --brand-card:         rgba(255, 255, 255, 0.14);
    --brand-card-border:  rgba(255, 255, 255, 0.28);
    --brand-card-solid:   #FFFFFF;
    --brand-card-text:    #1A2B4A;

    /* Status */
    --brand-danger:       #FF5252;
    --brand-success:      #69F0AE;

    /* tg-* aliases repointed to brand palette so untouched code still works */
    --tg-theme-bg-color:          transparent;
    --tg-theme-text-color:        #FFFFFF;
    --tg-theme-hint-color:        rgba(255, 255, 255, 0.72);
    --tg-theme-button-color:      #FFD700;
    --tg-theme-button-text-color: #1A2B4A;
    --tg-theme-secondary-bg-color: rgba(255, 255, 255, 0.14);
    --tg-theme-link-color:        #FFD700;
  }

  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    position: fixed;
    overflow: hidden;
    overscroll-behavior: none;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  * {
    -webkit-tap-highlight-color: transparent;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: inherit;
  }

  input,
  textarea {
    -webkit-user-select: text;
    user-select: text;
    -webkit-touch-callout: default;
  }

  /* Glassmorphism fallback for older WebView without backdrop-filter */
  @supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
    .backdrop-blur-sm {
      background-color: var(--brand-card-solid) !important;
      color: var(--brand-card-text);
    }
  }
}

@layer utilities {
  .app-bg {
    background:
      radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 55%),
      linear-gradient(180deg, var(--brand-blue-from) 0%, var(--brand-blue-to) 100%);
  }

  @keyframes letter-pop {
    0%   { opacity: 0; transform: scale(0.8); filter: brightness(1.6); }
    60%  { opacity: 1; transform: scale(1.08); filter: brightness(1.25); }
    100% { opacity: 1; transform: scale(1); filter: brightness(1); }
  }
  .letter-pop { animation: letter-pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1); }

  @keyframes score-bump {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  .score-bump { animation: score-bump 300ms ease-out; }

  @keyframes screen-mount {
    0%   { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .screen-mount { animation: screen-mount 240ms ease-out; }

  @keyframes trophy-bounce {
    0%   { transform: translateY(0) rotate(0deg); }
    35%  { transform: translateY(-26px) rotate(-6deg); }
    65%  { transform: translateY(8px) rotate(4deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
  .trophy-bounce { animation: trophy-bounce 700ms cubic-bezier(0.34, 1.56, 0.64, 1); }

  @keyframes confetti-fall {
    0%   { transform: translateY(-12vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(112vh) rotate(720deg); opacity: 0.9; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(-18px) rotate(5deg); }
  }
}
```

- [ ] **Step 4: Verify the build still compiles**

Run: `npm run build`
Expected: TypeScript build succeeds, Vite produces `dist/`. No errors.

- [ ] **Step 5: Verify the existing test suite still passes**

Run: `npm test`
Expected: all tests pass (no behavioral change yet).

- [ ] **Step 6: Commit**

```bash
git add src/lib/brand.ts tailwind.config.js src/index.css
git commit -m "feat(brand): add slovarich color tokens, tailwind extension, and utilities"
```

---

## Task 3: Telegram integration cleanup — make `applyThemeParams` a no-op

**Files:**
- Modify: `src/lib/telegram.ts`

**Interfaces:**
- Produces: `applyThemeParams()` is now a no-op (kept for backwards compatibility of call sites). `onThemeChanged()` and `restoreVerticalSwipes()` unchanged.

- [ ] **Step 1: Replace the `applyThemeParams` function in `src/lib/telegram.ts`**

Locate the existing `applyThemeParams` function (lines 34–55) and replace it entirely with:

```ts
export function applyThemeParams(): void {
  // Brand palette is forced via :root tokens in src/index.css.
  // Intentionally a no-op so Telegram's themeParams cannot override brand colors.
}
```

Leave the rest of the file (`initTelegram`, `restoreVerticalSwipes`, `onThemeChanged`) untouched.

- [ ] **Step 2: Verify the build still passes**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Verify tests still pass**

Run: `npm test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add src/lib/telegram.ts
git commit -m "feat(telegram): make applyThemeParams a no-op so brand palette wins"
```

---

## Task 4: `BrandButton` component (rename of `PrimaryButton` + variants)

**Files:**
- Create: `src/components/BrandButton.tsx`
- Create: `src/components/__tests__/BrandButton.test.tsx`
- Delete: `src/components/PrimaryButton.tsx`
- Modify: any file currently importing `PrimaryButton` — search and update to `BrandButton`

**Interfaces:**
- Produces: `BrandButton` named export with this signature:
  ```ts
  interface BrandButtonProps {
    onPress: () => void
    children: ReactNode
    variant?: 'primary' | 'ghost' | 'danger'
    className?: string
    ariaLabel?: string
    disabled?: boolean
    type?: 'button' | 'submit'
  }
  ```
- Variants: `primary` → `bg-brand-yellow text-brand-ink shadow-brand-yellow`; `ghost` → translucent white border + white text; `danger` → `bg-brand-danger text-white`.
- Consumes: tokens from Task 2.

- [ ] **Step 1: Install jsdom-based test environment**

Check whether `@testing-library/react` is installed:

Run: `npm ls @testing-library/react 2>&1 | head -5`

If not installed, install dev dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Then create `vitest.config.ts` at the repo root (if not present):

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

(If `vitest.config.ts` already exists, merge the `test` block instead of overwriting.)

- [ ] **Step 2: Write the failing test**

Create `src/components/__tests__/BrandButton.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandButton } from '../BrandButton'

describe('BrandButton', () => {
  it('renders children', () => {
    render(<BrandButton onPress={() => {}}>Click me</BrandButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onPress on pointer down (multitouch-safe)', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(<BrandButton onPress={onPress}>Go</BrandButton>)
    await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('Go') })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant classes by default', () => {
    render(<BrandButton onPress={() => {}}>Go</BrandButton>)
    const button = screen.getByText('Go').closest('button')!
    expect(button.className).toContain('bg-brand-yellow')
    expect(button.className).toContain('text-brand-ink')
  })

  it('applies ghost variant classes', () => {
    render(<BrandButton onPress={() => {}} variant="ghost">Ghost</BrandButton>)
    const button = screen.getByText('Ghost').closest('button')!
    expect(button.className).toContain('bg-white/10')
    expect(button.className).toContain('text-white')
  })

  it('applies danger variant classes', () => {
    render(<BrandButton onPress={() => {}} variant="danger">Del</BrandButton>)
    const button = screen.getByText('Del').closest('button')!
    expect(button.className).toContain('bg-brand-danger')
  })

  it('does not call onPress when disabled', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(<BrandButton onPress={onPress} disabled>No</BrandButton>)
    await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('No') })
    expect(onPress).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- src/components/__tests__/BrandButton.test.tsx`
Expected: FAIL — `BrandButton` module not found.

- [ ] **Step 4: Write `src/components/BrandButton.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface Props {
  onPress: () => void
  children: ReactNode
  variant?: Variant
  className?: string
  ariaLabel?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-yellow text-brand-ink shadow-brand-yellow',
  ghost:   'bg-white/10 text-white border border-white/40 backdrop-blur-sm',
  danger:  'bg-brand-danger text-white',
}

export function BrandButton({
  onPress,
  children,
  variant = 'primary',
  className = '',
  ariaLabel,
  disabled = false,
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={(e) => {
        if (disabled) return
        e.preventDefault()
        onPress()
      }}
      style={{ touchAction: 'manipulation' } as CSSProperties}
      className={`select-none rounded-2xl font-semibold transition-[filter,transform] duration-75 active:brightness-95 active:scale-[0.96] disabled:opacity-40 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/__tests__/BrandButton.test.tsx`
Expected: all 6 tests PASS.

- [ ] **Step 6: Update existing consumers of `PrimaryButton`**

Run: `grep -rn "PrimaryButton" src/`

For each match, replace the import and JSX:
- `import { PrimaryButton } from './PrimaryButton'` → `import { BrandButton } from './BrandButton'`
- `<PrimaryButton ` → `<BrandButton `

Files to update: `src/components/SetupScreen.tsx`, `src/components/WinnerScreen.tsx` (these will be fully rewritten in Tasks 10 and 12, so a quick import swap here is fine).

- [ ] **Step 7: Delete `src/components/PrimaryButton.tsx`**

Run: `rm src/components/PrimaryButton.tsx`

- [ ] **Step 8: Verify the full build and test suite pass**

Run: `npm run build && npm test`
Expected: success, all tests green.

- [ ] **Step 9: Commit**

```bash
git add src/components/BrandButton.tsx src/components/__tests__/BrandButton.test.tsx src/components/SetupScreen.tsx src/components/WinnerScreen.tsx vitest.config.ts src/test-setup.ts package.json package-lock.json
git rm src/components/PrimaryButton.tsx
git commit -m "feat(ui): rename PrimaryButton to BrandButton with brand variants"
```

---

## Task 5: `GlassCard` component

**Files:**
- Create: `src/components/GlassCard.tsx`
- Create: `src/components/__tests__/GlassCard.test.tsx`

**Interfaces:**
- Produces: `GlassCard` named export with this signature:
  ```ts
  interface GlassCardProps {
    children: ReactNode
    className?: string
    as?: 'div' | 'section' | 'label'
  }
  ```

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/GlassCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '../GlassCard'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Inside</GlassCard>)
    expect(screen.getByText('Inside')).toBeInTheDocument()
  })

  it('applies glassmorphic classes', () => {
    render(<GlassCard>X</GlassCard>)
    const el = screen.getByText('X').closest('div')!
    expect(el.className).toContain('bg-brand-card')
    expect(el.className).toContain('backdrop-blur-sm')
    expect(el.className).toContain('border')
    expect(el.className).toContain('border-brand-card-border')
  })

  it('merges custom className', () => {
    render(<GlassCard className="mt-4">X</GlassCard>)
    expect(screen.getByText('X').closest('div')!.className).toContain('mt-4')
  })

  it('renders as a label when as="label"', () => {
    render(<GlassCard as="label">X</GlassCard>)
    expect(screen.getByText('X').tagName).toBe('LABEL')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/__tests__/GlassCard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/GlassCard.tsx`**

```tsx
import type { ElementType, ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function GlassCard({ children, className = '', as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={`bg-brand-card backdrop-blur-sm border border-brand-card-border rounded-2xl shadow-brand-sm ${className}`}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/__tests__/GlassCard.test.tsx`
Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/GlassCard.tsx src/components/__tests__/GlassCard.test.tsx
git commit -m "feat(ui): add GlassCard component for glassmorphic surfaces"
```

---

## Task 6: `BookLogo` component (inline SVG)

**Files:**
- Create: `src/components/BookLogo.tsx`
- Create: `src/components/__tests__/BookLogo.test.tsx`

**Interfaces:**
- Produces: `BookLogo` named export:
  ```ts
  interface BookLogoProps {
    size?: number  // default 56
    className?: string
  }
  ```
- Renders an inline `<svg>` of an open book filled with `--brand-yellow`, white page edges, and dark navy «СЛОВ» text inside.

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/BookLogo.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    expect(container.querySelector('svg')!.className).toContain('mr-2')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/__tests__/BookLogo.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/BookLogo.tsx`**

```tsx
interface Props {
  size?: number
  className?: string
}

export function BookLogo({ size = 56, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Book spine + pages */}
      <path
        d="M32 14 L52 22 L52 50 L32 42 L12 50 L12 22 Z"
        fill="var(--brand-yellow)"
        stroke="#E6B800"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Page split line */}
      <path
        d="M32 14 L32 42"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left page highlight */}
      <path
        d="M14 23 L30 17 L30 39 L14 46 Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
      />
      {/* Right page highlight */}
      <path
        d="M34 17 L50 23 L50 46 L34 39 Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
      />
      {/* СЛОВ text */}
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
        fontSize="9"
        fontWeight="800"
        fill="var(--brand-ink)"
        letterSpacing="0.5"
      >
        СЛОВ
      </text>
    </svg>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/__tests__/BookLogo.test.tsx`
Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/BookLogo.tsx src/components/__tests__/BookLogo.test.tsx
git commit -m "feat(ui): add BookLogo SVG matching the slovarich screenshot mark"
```

---

## Task 7: `FloatingDecor` component

**Files:**
- Create: `src/components/FloatingDecor.tsx`
- Create: `src/components/__tests__/FloatingDecor.test.tsx`

**Interfaces:**
- Produces: `FloatingDecor` named export:
  ```ts
  interface FloatingDecorProps {
    density?: 'full' | 'low'  // default 'full'
  }
  ```
- `full` renders 10 letters, `low` renders 6. Container is `pointer-events-none`, `absolute inset-0`, `overflow-hidden`. Each letter is positioned absolutely with a randomized inline style (`top`, `left`, `font-size`, `animation-duration`, `animation-delay`).

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/FloatingDecor.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/__tests__/FloatingDecor.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/FloatingDecor.tsx`**

```tsx
import { useMemo } from 'react'

interface Props {
  density?: 'full' | 'low'
}

const LETTERS = ['С', 'Л', 'О', 'В', 'А', 'Р', 'И', 'Ч', '✦', '✧']

interface DecorItem {
  letter: string
  top: string
  left: string
  size: number
  duration: number
  delay: number
  blur: number
  opacity: number
}

function buildItems(count: number): DecorItem[] {
  const items: DecorItem[] = []
  for (let i = 0; i < count; i++) {
    items.push({
      letter: LETTERS[i % LETTERS.length],
      top:  `${5 + Math.floor((i * 37) % 90)}%`,
      left: `${5 + Math.floor((i * 53) % 90)}%`,
      size: 24 + ((i * 17) % 36),
      duration: 6 + ((i * 3) % 5),
      delay: (i * 0.7) % 3,
      blur: 1.5,
      opacity: 0.55,
    })
  }
  return items
}

export function FloatingDecor({ density = 'full' }: Props) {
  const count = density === 'low' ? 6 : 10
  const items = useMemo(() => buildItems(count), [count])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          data-decor-letter
          className="absolute text-brand-cream font-extrabold select-none"
          style={{
            top: it.top,
            left: it.left,
            fontSize: `${it.size}px`,
            opacity: it.opacity,
            filter: `blur(${it.blur}px)`,
            animation: `float ${it.duration}s ease-in-out ${it.delay}s infinite`,
          }}
        >
          {it.letter}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/__tests__/FloatingDecor.test.tsx`
Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/FloatingDecor.tsx src/components/__tests__/FloatingDecor.test.tsx
git commit -m "feat(ui): add FloatingDecor animated background letters"
```

---

## Task 8: `SegmentedControl` component

**Files:**
- Create: `src/components/SegmentedControl.tsx`
- Create: `src/components/__tests__/SegmentedControl.test.tsx`

**Interfaces:**
- Produces: `SegmentedControl` named export:
  ```ts
  interface SegmentedControlProps<T extends string | number> {
    options: readonly T[]
    value: T
    onChange: (v: T) => void
    format: (v: T) => string
    'aria-label'?: string
  }
  ```
- Renders a relative container with one absolutely-positioned sliding indicator (`.indicator`) and one button per option. The indicator's `transform: translateX(N%)` is computed from the selected option's index. Buttons use `onPointerDown` for multitouch safety.

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/SegmentedControl.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl } from '../SegmentedControl'

describe('SegmentedControl', () => {
  const opts = [3, 5, 10, 15] as const

  it('renders all options', () => {
    render(
      <SegmentedControl
        options={opts}
        value={5}
        onChange={() => {}}
        format={v => `${v} очков`}
      />
    )
    expect(screen.getByText('3 очков')).toBeInTheDocument()
    expect(screen.getByText('5 очков')).toBeInTheDocument()
    expect(screen.getByText('10 очков')).toBeInTheDocument()
    expect(screen.getByText('15 очков')).toBeInTheDocument()
  })

  it('calls onChange with the selected value on pointer down', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SegmentedControl
        options={opts}
        value={5}
        onChange={onChange}
        format={v => `${v} очков`}
      />
    )
    await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('10 очков') })
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('positions the indicator at the selected index', () => {
    render(
      <SegmentedControl
        options={opts}
        value={10}
        onChange={() => {}}
        format={v => `${v} очков`}
      />
    )
    const indicator = document.querySelector('[data-indicator]') as HTMLElement
    expect(indicator).not.toBeNull()
    // 10 is index 2 of 4 → translateX(200%)
    expect(indicator.style.transform).toContain('200')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/__tests__/SegmentedControl.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/SegmentedControl.tsx`**

```tsx
import type { CSSProperties } from 'react'

interface Props<T extends string | number> {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  format: (v: T) => string
  'aria-label'?: string
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  format,
  'aria-label': ariaLabel,
}: Props<T>) {
  const selectedIndex = Math.max(0, options.indexOf(value))
  const count = options.length
  const stepPct = 100 / count

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="relative flex bg-brand-card border border-brand-card-border backdrop-blur-sm rounded-2xl p-1"
    >
      <div
        data-indicator
        aria-hidden="true"
        className="absolute top-1 bottom-1 bg-brand-yellow rounded-xl shadow-brand-yellow transition-transform duration-200 ease-out"
        style={{
          left: '0.25rem',
          right: '0.25rem',
          width: `calc((100% - 0.5rem) / ${count})`,
          transform: `translateX(${selectedIndex * stepPct}%)`,
        } as CSSProperties}
      />
      {options.map(opt => {
        const selected = opt === value
        return (
          <button
            key={String(opt)}
            type="button"
            role="radio"
            aria-checked={selected}
            onPointerDown={(e) => {
              e.preventDefault()
              onChange(opt)
            }}
            style={{ touchAction: 'manipulation' } as CSSProperties}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors duration-150 ${
              selected ? 'text-brand-ink' : 'text-white/80'
            }`}
          >
            {format(opt)}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/__tests__/SegmentedControl.test.tsx`
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SegmentedControl.tsx src/components/__tests__/SegmentedControl.test.tsx
git commit -m "feat(ui): add SegmentedControl with sliding pill indicator"
```

---

## Task 9: `Confetti` component

**Files:**
- Create: `src/components/Confetti.tsx`
- Create: `src/components/__tests__/Confetti.test.tsx`

**Interfaces:**
- Produces: `Confetti` named export (no props). Renders 24 absolutely-positioned colored squares. Container is `pointer-events-none absolute inset-0 overflow-hidden z-0`. Each square uses the `confetti-fall` keyframe from Task 2 with randomized horizontal position, animation duration (1500–2200ms), delay (0–500ms), and color drawn from `CONFETTI_COLORS`.

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/Confetti.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/__tests__/Confetti.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/Confetti.tsx`**

```tsx
import { useMemo } from 'react'
import { CONFETTI_COLORS } from '../lib/brand'

interface Piece {
  left: number       // vw %
  delay: number      // ms
  duration: number   // ms
  size: number       // px
  color: string
}

function buildPieces(): Piece[] {
  const pieces: Piece[] = []
  for (let i = 0; i < 24; i++) {
    pieces.push({
      left: (i * 37) % 100,
      delay: (i * 47) % 500,
      duration: 1500 + ((i * 113) % 700),
      size: 8 + ((i * 7) % 8),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })
  }
  return pieces
}

export function Confetti() {
  const pieces = useMemo(buildPieces, [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          data-confetti-piece
          className="absolute top-0"
          style={{
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}ms linear ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/__tests__/Confetti.test.tsx`
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Confetti.tsx src/components/__tests__/Confetti.test.tsx
git commit -m "feat(ui): add CSS confetti component for the winner screen"
```

---

## Task 10: `AppShell` component

**Files:**
- Create: `src/components/AppShell.tsx`
- Create: `src/components/__tests__/AppShell.test.tsx`

**Interfaces:**
- Produces: `AppShell` named export:
  ```ts
  interface AppShellProps {
    children: ReactNode
    decorDensity?: 'full' | 'low'  // default 'full'
    className?: string
  }
  ```
- Renders `<div className="app-bg screen-mount ...">` containing `<FloatingDecor density={decorDensity} />` and `{children}` (z-indexed above decor).

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/AppShell.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '../AppShell'

describe('AppShell', () => {
  it('renders children', () => {
    render(<AppShell><div>Hi</div></AppShell>)
    expect(screen.getByText('Hi')).toBeInTheDocument()
  })

  it('applies the gradient background class', () => {
    const { container } = render(<AppShell><div>X</div></AppShell>)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('app-bg')
  })

  it('applies the screen-mount animation class', () => {
    const { container } = render(<AppShell><div>X</div></AppShell>)
    expect((container.firstElementChild as HTMLElement).className).toContain('screen-mount')
  })

  it('renders floating decor by default', () => {
    const { container } = render(<AppShell><div>X</div></AppShell>)
    expect(container.querySelectorAll('[data-decor-letter]').length).toBe(10)
  })

  it('passes decor density through', () => {
    const { container } = render(<AppShell decorDensity="low"><div>X</div></AppShell>)
    expect(container.querySelectorAll('[data-decor-letter]').length).toBe(6)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/__tests__/AppShell.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/AppShell.tsx`**

```tsx
import type { ReactNode } from 'react'
import { FloatingDecor } from './FloatingDecor'

interface Props {
  children: ReactNode
  decorDensity?: 'full' | 'low'
  className?: string
}

export function AppShell({ children, decorDensity = 'full', className = '' }: Props) {
  return (
    <div className={`app-bg screen-mount relative h-full w-full overflow-hidden ${className}`}>
      <FloatingDecor density={decorDensity} />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/__tests__/AppShell.test.tsx`
Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppShell.tsx src/components/__tests__/AppShell.test.tsx
git commit -m "feat(ui): add AppShell wrapper with gradient background and decor"
```

---

## Task 11: Rewrite `SetupScreen`

**Files:**
- Modify: `src/components/SetupScreen.tsx`
- Reference: `static/main_screen.png` (imported as a Vite asset)

**Interfaces:**
- Consumes: `AppShell`, `BookLogo`, `GlassCard`, `SegmentedControl`, `BrandButton` (Tasks 4, 5, 6, 8, 10).
- Produces: unchanged `SetupScreen({ onStart })` signature.

- [ ] **Step 1: Verify the screenshot import path resolves**

Run: `ls /Users/naualex/vibe_projects/tg_app_words/static/main_screen.png`
Expected: file exists.

- [ ] **Step 2: Replace `src/components/SetupScreen.tsx` with the rewrite**

```tsx
import { useState } from 'react'
import { Play, User } from 'lucide-react'
import type { GameConfig, Penalty, RoundSeconds, TargetScore } from '../types'
import {
  DEFAULT_PLAYER_NAMES,
  MAX_NAME_LENGTH,
  PENALTY_OPTIONS,
  ROUND_SEC_OPTIONS,
  TARGET_SCORE_OPTIONS,
} from '../types'
import { AppShell } from './AppShell'
import { BookLogo } from './BookLogo'
import { BrandButton } from './BrandButton'
import { GlassCard } from './GlassCard'
import { SegmentedControl } from './SegmentedControl'
import heroImage from '../../static/main_screen.png'

interface Props {
  onStart: (config: GameConfig) => void
}

interface NameInputProps {
  index: 1 | 2
  value: string
  onChange: (v: string) => void
}

function NameInput({ index, value, onChange }: NameInputProps) {
  return (
    <GlassCard as="label" className="flex items-center gap-3 px-4 py-3 transition focus-within:ring-2 focus-within:ring-brand-yellow">
      <span className="w-8 h-8 shrink-0 rounded-full bg-brand-yellow text-brand-ink text-sm font-bold flex items-center justify-center">
        {index}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <User className="w-4 h-4 text-white/70 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_NAME_LENGTH))}
          placeholder={DEFAULT_PLAYER_NAMES[index - 1]}
          maxLength={MAX_NAME_LENGTH}
          className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder:text-white/60 text-base"
          autoComplete="off"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
        />
      </div>
    </GlassCard>
  )
}

export function SetupScreen({ onStart }: Props) {
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [targetScore, setTargetScore] = useState<TargetScore>(5)
  const [penalty, setPenalty] = useState<Penalty>(0)
  const [roundSec, setRoundSec] = useState<RoundSeconds>(0)

  const handleStart = () => {
    onStart({
      targetScore,
      penalty,
      roundSec,
      playerNames: [
        name1.trim() || DEFAULT_PLAYER_NAMES[0],
        name2.trim() || DEFAULT_PLAYER_NAMES[1],
      ],
    })
  }

  return (
    <AppShell>
      <div
        className="h-full w-full overflow-y-auto overscroll-contain"
      >
        <div
          className="min-h-full flex flex-col px-5 gap-5"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)',
          }}
        >
          <img
            src={heroImage}
            alt="Словарич"
            className="w-full aspect-video object-cover rounded-3xl shadow-brand-md mt-2"
            draggable={false}
          />

          <header className="flex flex-col items-center gap-2 pb-1">
            <div className="flex items-center gap-3">
              <BookLogo size={48} />
              <h1 className="text-3xl font-extrabold text-brand-yellow tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                Словарич
              </h1>
            </div>
            <p className="text-white/80 text-sm text-center">
              Назови слово — забери балл
            </p>
          </header>

          <section className="space-y-2">
            <div className="text-white/70 text-xs uppercase tracking-wider px-1">Имена игроков</div>
            <NameInput index={1} value={name1} onChange={setName1} />
            <NameInput index={2} value={name2} onChange={setName2} />
          </section>

          <section className="space-y-2">
            <div className="text-white/70 text-xs uppercase tracking-wider px-1">Игра до</div>
            <SegmentedControl<TargetScore>
              options={TARGET_SCORE_OPTIONS}
              value={targetScore}
              onChange={setTargetScore}
              format={v => `${v} очков`}
              aria-label="Целевой счёт"
            />
          </section>

          <section className="space-y-2">
            <div className="text-white/70 text-xs uppercase tracking-wider px-1">Штраф за неверное слово</div>
            <SegmentedControl<Penalty>
              options={PENALTY_OPTIONS}
              value={penalty}
              onChange={setPenalty}
              format={v => (v === 0 ? 'Без штрафа' : '−1 балл')}
              aria-label="Штраф"
            />
          </section>

          <section className="space-y-2">
            <div className="text-white/70 text-xs uppercase tracking-wider px-1">Таймер на раунд</div>
            <SegmentedControl<RoundSeconds>
              options={ROUND_SEC_OPTIONS}
              value={roundSec}
              onChange={setRoundSec}
              format={v => (v === 0 ? 'Без таймера' : `${v} сек`)}
              aria-label="Таймер"
            />
          </section>

          <div className="flex-1" />

          <div className="text-white/70 text-xs leading-relaxed px-1">
            Назовите слова вслух. Кто первый назвал слово на заданные буквы —
            нажимает свою кнопку «+1» внизу. Буквы обновляются каждый раунд.
          </div>

          <BrandButton
            onPress={handleStart}
            variant="primary"
            className="w-full h-14 text-lg flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" strokeWidth={2.5} />
            Начать игру
          </BrandButton>
        </div>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 3: Verify TypeScript and build pass**

Run: `npm run build`
Expected: success (Vite resolves the .png import via vite/client types).

- [ ] **Step 4: Verify tests pass**

Run: `npm test`
Expected: all green.

- [ ] **Step 5: Manual visual QA in the browser**

Run: `npm run dev`
Open `http://localhost:5173/` and verify:
- Gradient blue background covers the viewport
- Floating decorative letters visible behind content
- Screenshot hero image at top with rounded corners and shadow
- «Словарич» title in golden yellow
- Player name inputs in glassmorphic cards with yellow focus ring
- Three segmented controls with yellow sliding indicator
- «Начать игру» button in bright yellow at bottom
Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add src/components/SetupScreen.tsx
git commit -m "feat(setup): rewrite setup screen with slovarich brand and hero image"
```

---

## Task 12: Rewrite `GameScreen`

**Files:**
- Modify: `src/components/GameScreen.tsx`

**Interfaces:**
- Consumes: `AppShell` (with `decorDensity="low"`), `BrandButton`.
- Produces: unchanged `GameScreen({ state, awardPoint, penalize, nextWord, timerExpired })` signature.
- Score button uses `useRef` to track previous score and applies the `.score-bump` class for 300ms when the score increases.

- [ ] **Step 1: Replace `src/components/GameScreen.tsx`**

```tsx
import { useEffect, useRef, type CSSProperties } from 'react'
import { Minus, Plus, RefreshCw } from 'lucide-react'
import type { PlayerId } from '../types'
import type { GameState } from '../game/useGame'
import { useRoundTimer } from '../game/useRoundTimer'
import { useHaptics } from '../hooks/useHaptics'
import { AppShell } from './AppShell'
import { BrandButton } from './BrandButton'
import { GlassCard } from './GlassCard'

interface Props {
  state: GameState
  awardPoint: (player: PlayerId) => void
  penalize: (player: PlayerId) => void
  nextWord: () => void
  timerExpired: () => void
}

interface ScoreButtonProps {
  name: string
  score: number
  targetScore: number
  leading: boolean
  bumpKey: number
  onAward: () => void
}

function ScoreButton({ name, score, targetScore, leading, bumpKey, onAward }: ScoreButtonProps) {
  const bumpRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!bumpRef.current || bumpKey === 0) return
    const el = bumpRef.current
    el.classList.remove('score-bump')
    void el.offsetWidth
    el.classList.add('score-bump')
    const t = setTimeout(() => el.classList.remove('score-bump'), 320)
    return () => clearTimeout(t)
  }, [bumpKey])

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()
        onAward()
      }}
      style={{ touchAction: 'manipulation' } as CSSProperties}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-5 rounded-2xl bg-brand-yellow text-brand-ink shadow-brand-yellow transition-[filter,transform] duration-75 active:brightness-95 active:scale-[0.96] ${
        leading ? 'ring-4 ring-yellow-200/40' : ''
      }`}
    >
      <span ref={bumpRef} className="text-5xl font-extrabold tabular-nums leading-none inline-block">
        {score}
      </span>
      <span className="text-sm opacity-70 tabular-nums">из {targetScore}</span>
      <span className="text-base font-semibold mt-2 max-w-full truncate px-3">{name}</span>
      <span className="flex items-center gap-1 text-xs font-medium opacity-70 mt-0.5">
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        балл
      </span>
    </button>
  )
}

interface PenaltyButtonProps {
  name: string
  onPenalize: () => void
}

function PenaltyButton({ name, onPenalize }: PenaltyButtonProps) {
  return (
    <BrandButton
      onPress={onPenalize}
      variant="ghost"
      ariaLabel={`${name}: −1 штраф`}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm !text-brand-danger !border-brand-danger/40"
    >
      <Minus className="w-4 h-4" strokeWidth={2.5} />
      <span>−1</span>
    </BrandButton>
  )
}

export function GameScreen({ state, awardPoint, penalize, nextWord, timerExpired }: Props) {
  const { config, scores, round, letters } = state
  const haptics = useHaptics()

  const remaining = useRoundTimer({
    seconds: config.roundSec,
    round,
    active: config.roundSec > 0,
    onExpire: timerExpired,
  })

  const penaltyMode = config.penalty === -1
  const [name1, name2] = config.playerNames
  const leading = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 1 : 2

  const handleAward = (player: PlayerId) => {
    haptics.impact('light')
    awardPoint(player)
  }

  const handlePenalize = (player: PlayerId) => {
    haptics.notify('warning')
    penalize(player)
  }

  const handleNextWord = () => {
    haptics.select()
    nextWord()
  }

  return (
    <AppShell decorDensity="low">
      <div
        className="h-full w-full flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <GlassCard className="px-3 py-1.5">
            <span className="text-white/80 text-sm">
              Раунд <span className="text-white font-semibold tabular-nums">{round}</span>
            </span>
          </GlassCard>
          {config.roundSec > 0 && (
            <GlassCard className="px-3 py-1.5">
              <span
                className={`text-sm font-semibold tabular-nums ${
                  remaining <= 5 ? 'text-brand-danger' : 'text-white'
                }`}
              >
                {remaining} сек
              </span>
            </GlassCard>
          )}
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-5">
          <div className="text-white/70 text-xs uppercase tracking-[0.3em] mb-4 text-center">
            Слово начинается и заканчивается на
          </div>
          <div
            key={`${letters.first}-${letters.last}-${round}`}
            className="flex items-center gap-4 text-9xl font-extrabold text-white leading-none letter-pop drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
          >
            <span>{letters.first}</span>
            <span className="text-3xl text-white/60">…</span>
            <span>{letters.last}</span>
          </div>
          <div className="text-white/70 text-sm mt-4">первая и последняя буквы</div>

          <BrandButton
            onPress={handleNextWord}
            variant="ghost"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 !rounded-full text-sm"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.25} />
            Следующее слово
          </BrandButton>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-2 shrink-0">
          <div className="flex gap-3">
            <ScoreButton
              name={name1}
              score={scores[0]}
              targetScore={config.targetScore}
              leading={leading === 1}
              bumpKey={scores[0]}
              onAward={() => handleAward(1)}
            />
            <ScoreButton
              name={name2}
              score={scores[1]}
              targetScore={config.targetScore}
              leading={leading === 2}
              bumpKey={scores[1]}
              onAward={() => handleAward(2)}
            />
          </div>
          {penaltyMode && (
            <div className="flex gap-3">
              <PenaltyButton name={name1} onPenalize={() => handlePenalize(1)} />
              <PenaltyButton name={name2} onPenalize={() => handlePenalize(2)} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 2: Verify build and tests pass**

Run: `npm run build && npm test`
Expected: success.

- [ ] **Step 3: Manual visual QA**

Run: `npm run dev`
Play through a game (Setup → Game → score a few rounds → Winner). Verify in Game:
- Gradient bg + lighter decor density
- Letter pair is huge (text-9xl), white with drop-shadow, animates on each round
- Round counter and timer in glass pills
- «Следующее слово» is a ghost pill button
- Two yellow score buttons, score number in dark navy, leading player has subtle yellow glow
- Score pulses on increment
- Penalty mode (setup with −1) shows small red-bordered penalty buttons
Stop dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameScreen.tsx
git commit -m "feat(game): rewrite game screen with brand palette and score-bump animation"
```

---

## Task 13: Rewrite `WinnerScreen`

**Files:**
- Modify: `src/components/WinnerScreen.tsx`

**Interfaces:**
- Consumes: `AppShell`, `BookLogo`, `BrandButton`, `Confetti`.
- Produces: unchanged `WinnerScreen({ winner, winnerName, scores, playerNames, onNewGame })` signature.
- Animates the score count-up from 0 → final over 800ms using `requestAnimationFrame`.

- [ ] **Step 1: Replace `src/components/WinnerScreen.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { RotateCcw, Trophy } from 'lucide-react'
import type { PlayerId } from '../types'
import { AppShell } from './AppShell'
import { BookLogo } from './BookLogo'
import { BrandButton } from './BrandButton'
import { Confetti } from './Confetti'

interface Props {
  winner: PlayerId
  winnerName: string
  scores: [number, number]
  playerNames: [string, string]
  onNewGame: () => void
}

function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])
  return value
}

export function WinnerScreen({ winner, winnerName, scores, playerNames, onNewGame }: Props) {
  const animatedLeft = useCountUp(scores[0])
  const animatedRight = useCountUp(scores[1])

  return (
    <AppShell>
      <div
        className="relative h-full w-full flex flex-col items-center justify-center px-6 gap-6"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
        }}
      >
        <Confetti />

        <div className="relative z-10 flex items-center gap-2">
          <BookLogo size={32} />
          <span className="text-xl font-extrabold text-brand-yellow tracking-tight">Словарич</span>
        </div>

        <div className="relative z-10 w-24 h-24 rounded-full bg-brand-yellow/15 flex items-center justify-center trophy-bounce">
          <Trophy className="w-14 h-14 text-brand-yellow drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]" strokeWidth={1.5} />
        </div>

        <div className="relative z-10 text-center space-y-2">
          <div className="text-white/70 text-sm uppercase tracking-wider">Победил</div>
          <div className="text-4xl font-extrabold text-brand-yellow drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            {winnerName}
          </div>
          <div className="text-2xl text-white tabular-nums pt-2">
            <span className={winner === 1 ? 'text-brand-yellow font-bold' : ''}>{animatedLeft}</span>
            <span className="mx-2 text-white/60">:</span>
            <span className={winner === 2 ? 'text-brand-yellow font-bold' : ''}>{animatedRight}</span>
          </div>
          <div className="text-white/70 text-xs pt-1">
            {playerNames[0]} · {playerNames[1]}
          </div>
        </div>

        <BrandButton
          onPress={onNewGame}
          variant="primary"
          className="relative z-10 w-full max-w-xs h-14 text-lg flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
          Новая игра
        </BrandButton>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 2: Verify build and tests pass**

Run: `npm run build && npm test`
Expected: success.

- [ ] **Step 3: Manual visual QA**

Run: `npm run dev`
Play a game to win. Verify on Winner screen:
- Confetti bursts once on mount and falls over ~2s
- «Словарич» wordmark at top
- Trophy bounces in inside a yellow halo
- «Победил {winnerName}» with winner name in big golden yellow
- Score counts up from 0 to final over ~800ms, winner's score highlighted yellow
- «Новая игра» returns to Setup
Stop dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/components/WinnerScreen.tsx
git commit -m "feat(winner): rewrite winner screen with confetti, trophy bounce, count-up"
```

---

## Task 14: Wire `App.tsx` cleanup + update `index.html` title

**Files:**
- Modify: `src/App.tsx`
- Modify: `index.html`

**Interfaces:**
- Produces: `App.tsx` no longer subscribes to `onThemeChanged` (brand palette is forced). Screens are wrapped by their own `<AppShell>` internally, so `App.tsx` only routes.

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { useEffect } from 'react'
import { useGame } from './game/useGame'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'
import { WinnerScreen } from './components/WinnerScreen'
import { initTelegram, restoreVerticalSwipes } from './lib/telegram'

export default function App() {
  const { state, startGame, awardPoint, penalize, nextRound, timerExpired, reset } = useGame()

  useEffect(() => {
    initTelegram()
    return () => {
      restoreVerticalSwipes()
    }
  }, [])

  if (state.screen === 'setup') {
    return <SetupScreen onStart={startGame} />
  }

  if (state.screen === 'winner' && state.winner !== null) {
    return (
      <WinnerScreen
        winner={state.winner}
        winnerName={state.config.playerNames[state.winner - 1]}
        scores={state.scores}
        playerNames={state.config.playerNames}
        onNewGame={reset}
      />
    )
  }

  return (
    <GameScreen
      state={state}
      awardPoint={awardPoint}
      penalize={penalize}
      nextWord={nextRound}
      timerExpired={timerExpired}
    />
  )
}
```

- [ ] **Step 2: Update `index.html` title**

Replace `<title>Слова — Игра для двоих</title>` with:

```html
<title>Словарич — Игра в слова</title>
```

Also update `<meta name="theme-color" content="#ffffff" />` to match the brand gradient bottom:

```html
<meta name="theme-color" content="#2196F3" />
```

- [ ] **Step 3: Verify build and tests pass**

Run: `npm run build && npm test`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx index.html
git commit -m "feat(app): drop theme subscription, update title and theme-color"
```

---

## Task 15: Update README and final QA

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README branding**

In `README.md`, replace the title line:

`# Слова — TWA для двоих`

with:

`# Словарич — TWA для двоих`

Update the first paragraph to read:

`Telegram Web App: Словарич — игра в слова для двух игроков на одном устройстве, сидящих рядом. После старта раунда выдаются две случайные буквы кириллицы (первая и последняя); игроки называют слова вслух и проверяют друг друга. Кто первый назвал подходящее слово — жмёт свою кнопку «+1» внизу. Буквы обновляются каждый раунд. Побеждает тот, кто первым наберёт целевой счёт.`

Under the «Структура» section, update the components list to reflect new files. Replace the existing `components/` block with:

```
└── components/
    ├── SetupScreen.tsx         # Hero + имена + опции
    ├── GameScreen.tsx          # Буквы сверху, именные +1 внизу
    ├── WinnerScreen.tsx        # Конфетти + имя победителя + счёт
    ├── AppShell.tsx            # Градиент + декор + safe-area
    ├── FloatingDecor.tsx       # Анимированный фон из букв
    ├── BookLogo.tsx            # SVG-логотип Словарич
    ├── BrandButton.tsx         # Желтая/ghost/danger кнопка (onPointerDown)
    ├── GlassCard.tsx           # Glassmorphic-контейнер
    ├── SegmentedControl.tsx    # Слайдинг-пилюля для опций
    └── Confetti.tsx            # CSS-конфетти на экране победы
```

Add a new section after «Тема» (under «Замечания по реализации»):

```markdown
- **Бренд:** Палитра Словарич форсируется через CSS-переменные в `src/index.css :root` (синий градиент `#5CB3FF`→`#2196F3`, золотой `#FFD700`). `applyThemeParams()` в `src/lib/telegram.ts` намеренно стал no-op — тема Telegram не переопределяет бренд. Скриншот-заставка лежит в `static/main_screen.png`.
```

- [ ] **Step 2: Verify the full pipeline**

Run: `npm run build && npm test`
Expected: build succeeds, all tests pass.

- [ ] **Step 3: Full end-to-end manual QA**

Run: `npm run dev`

Walk through:
1. Setup screen: gradient + decor visible, screenshot hero present, «Словарич» title golden, segmented controls work, name inputs accept Cyrillic, «Начать игру» is bright yellow.
2. Game screen: letters huge and animated, score buttons yellow with ink text, leading player glow, score-bump on tap, «Следующее слово» works, timer (if enabled) turns red below 5s, penalty buttons (if enabled) visible.
3. Winner screen: confetti bursts once, trophy bounces, winner name golden, score counts up, «Новая игра» returns to Setup.

Verify at both mobile width (375×667) and tablet width (768×1024).

Stop the dev server when done.

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "docs: rebrand readme to slovarich and document forced brand palette"
```

- [ ] **Step 5: Verify clean working tree**

Run: `git status`
Expected: clean tree.

---

## Self-Review

Spec coverage check (all sections of the spec):

- **§1 Goal** — rebrand to Словарич, brand palette across all screens, screenshot hero: covered by Tasks 11–15.
- **§2 Non-goals** — no game logic change (Tasks 11–13 preserve signatures), no new deps (only dev-deps added in Task 4 step 1 for testing), no backend work.
- **§3 Brand identity** — name (Tasks 14, 15), logo (Task 6), tagline (Task 11), hero image (Task 11), title (Task 14).
- **§4 Design tokens** — CSS variables (Task 2), Tailwind extension (Task 2), `.app-bg` utility (Task 2), typography decisions baked into each screen rewrite.
- **§5 Component architecture** — AppShell (Task 10), FloatingDecor (Task 7), BookLogo (Task 6), GlassCard (Task 5), SegmentedControl (Task 8), Confetti (Task 9), BrandButton (Task 4). All consumed by Tasks 11–13.
- **§6 Screen redesigns** — Setup (Task 11), Game (Task 12), Winner (Task 13).
- **§7 Micro-interactions** — `letter-pop` rework, `score-bump`, `screen-mount`, `trophy-bounce`, `confetti-fall`, `float` keyframes all defined in Task 2 step 3 and consumed in Tasks 10–13.
- **§8 Telegram integration** — `applyThemeParams` no-op (Task 3), `onThemeChanged` removed from App.tsx (Task 14), `restoreVerticalSwipes` kept.
- **§9 Files touched** — matches the plan's File Structure section above.
- **§10 Testing** — automated tests for every new component (Tasks 4–10), full suite verified at every commit, manual QA baked into Tasks 11–13 and 15.
- **§11 Risks** — screenshot aspect handled via `object-cover aspect-video` (Task 11); low density decor for Game (Task 12 passes `decorDensity="low"`); `backdrop-blur-sm` everywhere; brand palette documented (Task 15); `onThemeChanged` and `applyThemeParams` kept exported from telegram.ts (Task 3 only changes the function body).
- **§12 Out of scope** — no sounds, no settings, no online play, no i18n, no Lottie, no custom fonts. Plan respects all of these.

Type consistency check:
- `BrandButton` props (`onPress`, `children`, `variant`, `className`, `ariaLabel`, `disabled`, `type`) — defined Task 4, used Tasks 11–13. ✓
- `SegmentedControl` props (`options`, `value`, `onChange`, `format`, `aria-label`) — defined Task 8, used Task 11. ✓
- `GlassCard` props (`children`, `className`, `as`) — defined Task 5, used Tasks 11–12. ✓
- `FloatingDecor` props (`density`) — defined Task 7, used Task 10. ✓
- `AppShell` props (`children`, `decorDensity`, `className`) — defined Task 10, used Tasks 11–13. ✓
- `BookLogo` props (`size`, `className`) — defined Task 6, used Tasks 11, 13. ✓
- `Confetti` (no props) — defined Task 9, used Task 13. ✓
- `CONFETTI_COLORS` and `BRAND_COLORS` — exported Task 2, consumed Task 9. ✓

No TBDs, no TODOs, no "fill in details", no "similar to Task N" without repeat. Plan is complete.
