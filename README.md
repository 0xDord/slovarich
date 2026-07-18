# Словарич — TWA для двоих

Telegram Web App: Словарич — игра в слова для двух игроков на одном устройстве, сидящих рядом. После старта раунда выдаются две случайные буквы кириллицы (первая и последняя); игроки называют слова вслух и проверяют друг друга. Кто первый назвал подходящее слово — жмёт свою кнопку «+1» внизу. Буквы обновляются каждый раунд. Побеждает тот, кто первым наберёт целевой счёт.

## Стек

- React 18 + TypeScript + Vite 6
- Tailwind CSS 3.4 (форсированная брендовая палитра Словарич в `:root`)
- `@twa-dev/sdk` для интеграции с Telegram
- `lucide-react` для иконок
- `vitest` для юнит-тестов

## Запуск локально

```bash
npm install
npm run dev
```

Откроется на http://localhost:5173/. Приложение работает и в обычном браузере (брендовая палитра Словарич форсируется через `:root` CSS-переменные).

## Команды

| Команда | Описание |
|---|---|
| `npm run dev` | Vite dev server с HMR |
| `npm run build` | Production-сборка в `dist/` (tsc + vite build) |
| `npm run build:pairs` | Перегенерить `src/data/letterPairs.json` из `data/*.txt` |
| `npm run preview` | Локальный preview собранного бандла |
| `npm test` | Юнит-тесты (vitest, single run) |
| `npm run test:watch` | Тесты в watch-режиме |

## Запуск внутри Telegram

1. Создайте бота через [@BotFather](https://t.me/BotFather): `/newbot` → имя → username.
2. Привяжите Web App: в BotFather → `/newapp` → выберите бота → укажите короткое имя. Потребуется публичный URL.
3. Для локальной разработки используйте туннель:
   ```bash
   npm run dev        # в одном терминале
   ngrok http 5173    # в другом
   ```
   Вывод `ngrok` (например `https://abc123.ngrok-free.app`) — это URL для BotFather.
4. Откройте бота в Telegram mobile, нажмите кнопку Web App.

SDK вызывается в `src/lib/telegram.ts`: при запуске внутри Telegram вызываются `ready()`, `expand()`, `disableVerticalSwipes()`. `applyThemeParams()` намеренно оставлен no-op — брендовая палитра Словарич форсируется через CSS-переменные в `src/index.css :root` и НЕ переопределяется темой Telegram. В обычном браузере вызовы тоже no-op, дефолты берутся из `src/index.css`.

## Игровая механика

- **Настройка (Setup screen):** имена двух игроков, целевой счёт (3 / 5 / 10 / 15), штраф за неверное слово (0 / −1), таймер на раунд (нет / 30 сек / 60 сек).
- **Раунд:** алгоритм выдаёт две буквы кириллицы (первая и последняя), выбранные из предподсчитанного списка валидных пар — для каждой пары в словаре существует минимум 3 реальных слова. Список генерируется из `data/raw-nouns.txt` ( lemma-список существительных) и `data/extra-words.txt` (ручной сленг/имена собственные) через `npm run build:pairs` → `src/data/letterPairs.json`. Под кнопкой «Следующее слово» есть «Не помню слово?» — показывает 3 коротких примера.
- **Очки:** две именные кнопки «+1 [Имя]» внизу. Тап — счёт растёт, буквы обновляются. В режиме штрафа под ними появляются маленькие кнопки «−1» (не уходит ниже 0).
- **Таймер:** если включён, обратный отсчёт до нуля → новый раунд без штрафа.
- **Победа:** кто первым достиг целевого счёта — побеждает; показывается экран Winner с именем победителя и финальным счётом.

## Структура

```
src/
├── App.tsx                     # Маршрутизация экранов + Telegram SDK init
├── main.tsx                    # React bootstrap
├── index.css                   # Tailwind + :root бренд-токены Словарич
├── types.ts                    # GameConfig, GameState, опции
├── data/
│   └── letterPairs.json        # Сгенерированный список валидных пар (npm run build:pairs)
├── lib/
│   ├── letters.ts              # Сэмплинг пар из letterPairs.json + getExamples()
│   ├── validateWord.ts         # Заглушка по ТЗ (не используется в основном флоу)
│   └── telegram.ts             # TWA SDK wrapper
├── game/
│   ├── useGame.ts              # useReducer (state machine setup→game→winner)
│   └── useRoundTimer.ts        # Обратный отсчёт с рестартом по раундам
├── hooks/
│   └── useHaptics.ts           # Тактильная отдача
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

## Замечания по реализации

- **Multitouch:** кнопки используют `onPointerDown`, а не `onClick` — на iOS WebView обычный click ненадёжен при одновременном тапе двумя пальцами. Pointer Events нативно поддерживают multiple concurrent pointers.
- **Layout:** игроки сидят рядом на одной стороне устройства. Буквы крупно в верхней части экрана, две именные кнопки «+1 [Имя]» — внизу.
- **Тема:** Брендовая палитра Словарич форсируется через CSS-переменные в `src/index.css :root` (синий градиент `#5CB3FF`→`#2196F3`, золотой `#FFD700`). `applyThemeParams()` в `src/lib/telegram.ts` — no-op, тема Telegram НЕ переопределяет бренд.
- **Бренд:** Палитра Словарич форсируется через CSS-переменные в `src/index.css :root` (синий градиент `#5CB3FF`→`#2196F3`, золотой `#FFD700`). `applyThemeParams()` в `src/lib/telegram.ts` намеренно стал no-op — тема Telegram не переопределяет бренд. Скриншот-заставка лежит в `static/main_screen.png`.
- **Нативное ощущение:** `user-select: none` везде, кроме `<input>` (кастомное разрешение в `index.css`); `overflow: hidden`, `position: fixed` на html/body/#root, `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`, `viewport-fit=cover` + `env(safe-area-inset-*)`.
- **`validateWord`** реализован в `src/lib/validateWord.ts` как утилита (по требованию ТЗ), но в основном игровом флоу не используется — игроки проверяют слова устно. Пригодится, если в будущем добавится поле ввода.

## Известные отклонения от исходного ТЗ

1. Нет поля ввода и автопроверки слова — упрощено до счётчика по решению пользователя.
2. Игроки сидят рядом (не друг напротив друга), кнопки «+1 [Имя]» внизу — без поворота половин.
3. Добавлены имена игроков и экран настройки.
