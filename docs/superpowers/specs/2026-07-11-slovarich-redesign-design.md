# Словарич — Visual Redesign Spec

**Date:** 2026-07-11
**Status:** Approved (pending spec review)
**Scope:** Full visual refresh of the Telegram Web App from neutral Telegram-themed UI to a branded "Словарич" identity derived from `static/main_screen.png`.

---

## 1. Goal

Rebrand the two-player word game from "Игра в слова" to **Словарич**, and apply a cohesive bright-blue + golden-yellow visual language across all three screens (Setup, Game, Winner). The redesign must:

- Match the design language of `static/main_screen.png` (gradient blue background, golden yellow accents, floating Cyrillic decorative letters).
- Embed the screenshot as a hero on the Setup (main) screen.
- Force the brand palette regardless of Telegram theme overrides.
- Keep all existing game logic, multitouch handling, and haptics intact.
- Add no new runtime dependencies.

## 2. Non-goals

- No change to game mechanics (letter generation, scoring, rounds, penalty logic).
- No change to the data model (`GameConfig`, `GameState`, `PlayerId`, options).
- No new third-party libraries (confetti is built by hand with CSS; no `canvas-confetti`).
- No backend, persistence, or multi-device work — still single-device two-player.
- No internationalization layer — UI copy stays Russian.

## 3. Brand identity

| Field | Old | New |
|---|---|---|
| App name | Игра в слова / Слова | **Словарич** |
| Logo | `Sparkles` icon from lucide | Custom open-book-with-СЛОВ inline SVG (`<BookLogo>`) |
| Tagline | "Для двоих игроков · назовите слова на заданные буквы" | **«Назови слово — забери балл»** |
| Hero | none | `static/main_screen.png` embedded on Setup |
| Document `<title>` | "Слова — Игра для двоих" | **«Словарич — Игра в слова»** |

## 4. Design tokens

### 4.1 Color tokens (CSS variables in `:root`)

```css
:root {
  /* Brand gradient background */
  --brand-blue-from:   #5CB3FF;
  --brand-blue-to:     #2196F3;

  /* Yellow accent family */
  --brand-yellow:      #FFD700;
  --brand-yellow-soft: #FFE25C;
  --brand-yellow-press:#F5C400;

  /* Decorative */
  --brand-cream:       #FFF9C4;  /* floating letters */

  /* Text */
  --brand-ink:         #1A2B4A;  /* on-yellow text */
  --brand-text:        #FFFFFF;  /* on-blue text */
  --brand-text-muted:  rgba(255, 255, 255, 0.72);

  /* Glassmorphic surfaces */
  --brand-card:        rgba(255, 255, 255, 0.14);
  --brand-card-border: rgba(255, 255, 255, 0.28);
  --brand-card-solid:  #FFFFFF;
  --brand-card-text:   #1A2B4A;  /* text when using solid card */

  /* Status */
  --brand-danger:      #FF5252;
  --brand-success:     #69F0AE;

  /* Shadows */
  --brand-shadow-sm:   0 2px 8px rgba(0, 0, 0, 0.12);
  --brand-shadow-md:   0 8px 24px rgba(0, 0, 0, 0.18);
  --brand-shadow-yellow: 0 6px 20px rgba(255, 215, 0, 0.35);
}
```

### 4.2 Tailwind extension

`tailwind.config.js` gains a `brand` color family so utilities like `bg-brand-yellow`, `text-brand-ink`, `border-brand-card-border` resolve to the tokens above. The existing `tg-*` colors are kept for backwards compatibility with any untouched code, but their `:root` defaults are repointed to brand colors (so `bg-tg-bg` resolves to a transparent base layer painted over the gradient).

### 4.3 Background utility

A new utility class `.app-bg` paints `linear-gradient(180deg, var(--brand-blue-from) 0%, var(--brand-blue-to) 100%)` plus a subtle radial highlight near the top center to evoke the screenshot's soft glow.

### 4.4 Typography

- Font stack unchanged (system sans for native Telegram feel).
- Display headings (Словарич, winner name, score numbers) use `font-weight: 800` with tight letter-spacing (`-0.02em`).
- Hint text uses `font-weight: 500` with `text-brand-text-muted`.

## 5. Component architecture

### 5.1 New components

| File | Responsibility |
|---|---|
| `src/components/AppShell.tsx` | Wraps every screen. Paints `.app-bg`, renders `<FloatingDecor/>` behind children, applies safe-area insets, mounts the screen-fade-in animation. |
| `src/components/FloatingDecor.tsx` | Renders absolutely-positioned cream Cyrillic letters/symbols with `filter: blur(1.5px)`, `opacity: 0.55`, and a `float` keyframe animation with per-element randomized duration (6–10s) and delay (0–3s). `pointer-events: none`. Accepts a `density?: "full" \| "low"` prop: `"full"` (default) renders 10 elements for Setup/Winner, `"low"` renders 6 for Game so it doesn't compete with the letter pair. |
| `src/components/BookLogo.tsx` | Inline SVG of the open-book-with-СЛОВ mark. Props: `size`, `className`. Uses `--brand-yellow` fill, white page edges, dark navy СЛОВ text. |
| `src/components/GlassCard.tsx` | `<div>` with `bg-brand-card`, backdrop-blur, white border, soft shadow, rounded-2xl. Props: `as`, `className`, `children`. |
| `src/components/SegmentedControl.tsx` | Replaces the existing option-group grid. Renders a pill-track with a sliding white indicator that animates via `transition-transform` between options. Props: `options`, `value`, `onChange`, `format`. |
| `src/components/Confetti.tsx` | Pure CSS confetti burst — 24 absolutely-positioned colored squares with `confetti-fall` keyframe animation (translateY + rotate). Colors drawn from the brand palette: `--brand-yellow`, `--brand-cream`, `--brand-text`, and a light-blue accent (`#B3E0FF`). Mounts on Winner screen, animates once (~2s), then becomes inert. |

### 5.2 Updated components

| File | Change |
|---|---|
| `src/components/PrimaryButton.tsx` | Becomes `BrandButton`. Variants: `primary` (yellow, ink text, yellow glow shadow), `ghost` (translucent white border, white text), `danger` (red bg, white text). Adds deeper press scale (`0.96`) and stronger brightness dip. Keeps `onPointerDown` multitouch-safe behavior. |
| `src/components/SetupScreen.tsx` | Full redesign per §6.1. |
| `src/components/GameScreen.tsx` | Full redesign per §6.2. |
| `src/components/WinnerScreen.tsx` | Full redesign per §6.3. |

### 5.3 Existing components kept as-is

- `src/game/useGame.ts` — state machine untouched.
- `src/game/useRoundTimer.ts` — timer untouched.
- `src/hooks/useHaptics.ts` — haptics untouched.
- `src/lib/letters.ts`, `src/lib/validateWord.ts` — game logic untouched.
- All `__tests__/` — assertions untouched.

## 6. Screen-by-screen redesign

### 6.1 Setup (main screen)

Layout (top to bottom, scrollable on small viewports):

1. **Hero image** — `static/main_screen.png` rendered via `<img>` with `rounded-3xl`, soft shadow, `aspect-video` object-cover crop. Width ~85% of container, centered.
2. **Brand header** — `<BookLogo size={56}>` + «Словарич» (text-3xl, font-extrabold, golden yellow, tight tracking) on one row; tagline below in `text-brand-text-muted`.
3. **Player name inputs** — two `<GlassCard>` rows. Each contains a numbered yellow circle badge + lucide `User` icon + `<input>`. Focus ring uses `--brand-yellow`. Placeholder text in `text-brand-text-muted`.
4. **Game options** — three `<SegmentedControl>` groups stacked: «Игра до» (3 / 5 / 10 / 15), «Штраф за неверное слово» (Без штрафа / −1 балл), «Таймер на раунд» (Без таймера / 30 сек / 60 сек).
5. **Helper text** — short rules summary in `text-brand-text-muted text-xs`.
6. **Start button** — sticky-bottom `<BrandButton primary>` «Начать игру» with `Play` icon, full width, height 56px.

All inside `<AppShell>`. The screen itself is scrollable; the start button sticks to bottom with safe-area inset.

### 6.2 Game

Layout:

1. **Top bar** — translucent pill (`<GlassCard>`) containing round counter on the left and timer (if enabled) on the right. Timer turns red below 5 seconds (unchanged behavior, restyled).
2. **Center stage** — letter pair, scaled from `text-8xl` to `text-9xl`. White fill with subtle drop-shadow (`drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]`). "Слово начинается и заканчивается на" caption above in `text-brand-text-muted`. First/last letter separated by `…` in muted color.
3. **Next-word button** — `<BrandButton ghost>` with `RefreshCw` icon, sits below the letters.
4. **Score row** — two `<BrandButton primary>` score buttons side by side, each showing:
   - Huge score number (text-5xl, font-extrabold, `--brand-ink` color) 
   - "из {target}" caption (small, muted ink)
   - Player name (semibold, truncated)
   - "+1 балл" affordance label with `Plus` icon
   - Leading player gets an additional outer glow (`ring-4 ring-yellow-200/40`)
   - Scale-pulse animation when score changes (track previous score, animate only on increase)
5. **Penalty row** (only if penalty mode) — two small `<BrandButton danger ghost>` buttons labeled «−1».

### 6.3 Winner

Layout:

1. **Confetti** — `<Confetti/>` mounted behind content, animates once on mount.
2. **Wordmark** — `<BookLogo size={40}>` + «Словарич» (smaller, top of screen).
3. **Trophy** — large golden trophy in a translucent yellow halo. Bounces in on mount.
4. **Winner text** — «Победил» label (uppercase, muted), then winner name in text-4xl golden yellow extrabold.
5. **Score** — `{score1} : {score2}` display with animated count-up from 0 to final over 800ms (using requestAnimationFrame). Winner's score highlighted.
6. **Player names** — small caption listing both players.
7. **New game button** — `<BrandButton primary>` «Новая игра» with `RotateCcw` icon, full width.

## 7. Micro-interactions

| Interaction | Implementation |
|---|---|
| Letter pair pop on round change | Reworked `letter-pop` keyframe: scale 0.8 → 1.08 → 1 with brightness flash. 280ms cubic-bezier. |
| Score increment | Track `prevScore` via `useRef`. When score increases, apply `.score-bump` class for 300ms (scale 1 → 1.15 → 1). |
| SegmentedControl slide | `transform: translateX()` with `transition-transform duration-200 ease-out`, computed from selected index and button width. |
| Screen mount | `.screen-mount` class: opacity 0 → 1, translateY 4px → 0, 240ms ease-out. Applied by `<AppShell>`. |
| Button press | `active:scale-[0.96]` + `active:brightness-95`. Yellow variant also reduces shadow. |
| Trophy entrance | `trophy-bounce` keyframe: translateY 0 → -24 → 0 with rotation, 700ms ease-out. |
| Confetti | 24 squares with `confetti-fall` keyframe, randomized horizontal position, rotation, delay (0–500ms), duration (1500–2200ms). Pure CSS. |

All keyframes live in `src/index.css` under `@layer utilities`. No JS animation libraries.

## 8. Telegram integration changes

`src/lib/telegram.ts`:

- `initTelegram()` unchanged — still calls `ready()`, `expand()`, `disableVerticalSwipes()`, and then `applyThemeParams()`.
- `applyThemeParams()` becomes a **no-op** — the brand palette is forced. The function still exists (and is still called from `initTelegram` and `onThemeChanged`) so existing call sites don't break; it just no longer writes to CSS variables.
- `onThemeChanged()` subscription kept in `App.tsx` (harmless) but does nothing visible. Alternative: remove the subscription entirely to clean up. **Decision: remove the subscription and the `onThemeChanged` import from `App.tsx`.** This is cleaner than a dead listener.
- `restoreVerticalSwipes()` unchanged.

## 9. Files touched

### New files
- `src/components/AppShell.tsx`
- `src/components/FloatingDecor.tsx`
- `src/components/BookLogo.tsx`
- `src/components/GlassCard.tsx`
- `src/components/SegmentedControl.tsx`
- `src/components/Confetti.tsx`
- `src/lib/brand.ts` — exports the token constants for use in JS (e.g., confetti colors, SVG fills)

### Edited files
- `src/index.css` — replace `:root` TG defaults with brand tokens, add new keyframes (`float`, `score-bump`, `screen-mount`, `trophy-bounce`, `confetti-fall`, reworked `letter-pop`), add `.app-bg` utility
- `tailwind.config.js` — add `brand` color family, keep `tg-*` colors (now brand-backed)
- `src/lib/telegram.ts` — make `applyThemeParams` a no-op
- `src/App.tsx` — remove `onThemeChanged` subscription; wrap screens in `<AppShell>` (or have each screen wrap itself — decision: `<AppShell>` is rendered by `App.tsx` around the screen switch)
- `src/components/PrimaryButton.tsx` — rename file to `BrandButton.tsx` (keep `PrimaryButton` as a re-export for one release, then remove — actually, per project conventions, just rename and update all imports in the same change)
- `src/components/SetupScreen.tsx` — full rewrite per §6.1
- `src/components/GameScreen.tsx` — full rewrite per §6.2
- `src/components/WinnerScreen.tsx` — full rewrite per §6.3
- `index.html` — update `<title>` to «Словарич — Игра в слова»
- `README.md` — update branding, screenshot hero mention

### Untouched
- `src/game/*`, `src/hooks/*`, `src/lib/letters.ts`, `src/lib/validateWord.ts`, `src/types.ts`, `src/main.tsx`
- All `__tests__/` files

## 10. Testing

### 10.1 Automated
- `npm test` must remain green — no game logic changes, so existing `useGame` and `letters` tests pass without modification.
- TypeScript build (`npm run build`) must succeed — no type drift.

### 10.2 Manual visual QA
At mobile width (375×667) and tablet width (768×1024), verify:
- Setup: screenshot hero crops nicely, gradient + decor visible, segmented control animates smoothly, name inputs accept Cyrillic, start button prominent yellow.
- Game: letter pair is huge and centered, score buttons are obvious yellow, leading player gets glow, penalty buttons appear only when penalty mode is selected, timer ticks red below 5s.
- Winner: confetti bursts once, trophy bounces, score counts up, new-game button works.
- All three screens: floating decor visible but not distracting, gradient covers full viewport including safe areas.

### 10.3 Telegram client QA
- Inside Telegram (mobile + desktop), verify `expand()`, haptics, and swipe-disable still work.
- Verify brand palette is **not** overridden by Telegram's theme — colors match the browser rendering.

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Screenshot aspect ratio (2816×1536 ≈ 1.83:1) may crop awkwardly at narrow widths | Use `object-cover` with `aspect-video`; on very narrow screens, reduce hero height and let it crop symmetrically. |
| Floating decor could distract from gameplay on Game screen | Keep decor opacity ≤ 0.55 and blur ≥ 1.5px; reduce count on Game screen to 6 elements. |
| Glassmorphism (`backdrop-blur`) is expensive on older Android WebView | Use `backdrop-blur-sm` (4px) not `backdrop-blur-xl`; provide solid white fallback via `@supports not (backdrop-filter: blur(2px))`. |
| Forcing brand palette may surprise users who expected theme-following | This is a deliberate brand decision per user approval; document in README. |
| Removing `onThemeChanged` could break a future feature that wants theme | Keep `onThemeChanged` and `applyThemeParams` exported from `telegram.ts` so they can be revived; just don't wire them up in `App.tsx`. |

## 12. Out of scope (deferred)

- Sound effects (tap, score, win) — not requested.
- Settings / preferences screen — not requested.
- Multi-device or online play — out of scope per original task.
- Internationalization (English UI) — not requested.
- Animations beyond what's described (no Lottie, no shared-element transitions).
- Custom fonts (e.g., Montserrat) — would require font loading; system sans matches Telegram native feel and avoids the cost.
