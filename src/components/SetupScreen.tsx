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
import heroImage from '../../static/main_screen.jpg'

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
