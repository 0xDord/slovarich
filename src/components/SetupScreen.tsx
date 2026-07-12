import { useState } from 'react'
import { Play, User, Sparkles } from 'lucide-react'
import type { GameConfig, Penalty, RoundSeconds, TargetScore } from '../types'
import {
  DEFAULT_PLAYER_NAMES,
  MAX_NAME_LENGTH,
  PENALTY_OPTIONS,
  ROUND_SEC_OPTIONS,
  TARGET_SCORE_OPTIONS,
} from '../types'
import { BrandButton } from './BrandButton'

interface Props {
  onStart: (config: GameConfig) => void
}

interface OptionGroupProps<T extends string | number> {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  format: (v: T) => string
}

function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format,
}: OptionGroupProps<T>) {
  return (
    <div className="space-y-2">
      <div className="text-tg-hint text-xs uppercase tracking-wider px-1">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => {
          const selected = opt === value
          return (
            <button
              key={String(opt)}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                onChange(opt)
              }}
              style={{ touchAction: 'manipulation' }}
              className={`py-3 rounded-xl text-base font-medium transition-[filter] duration-75 active:brightness-90 ${
                selected
                  ? 'bg-tg-button text-tg-btn-text'
                  : 'bg-tg-sec-bg text-tg-text'
              }`}
            >
              {format(opt)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface NameInputProps {
  index: 1 | 2
  value: string
  onChange: (v: string) => void
}

function NameInput({ index, value, onChange }: NameInputProps) {
  return (
    <label className="flex items-center gap-3 bg-tg-sec-bg rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-tg-button transition">
      <span className="w-8 h-8 shrink-0 rounded-full bg-tg-button text-tg-btn-text text-sm font-bold flex items-center justify-center">
        {index}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <User className="w-4 h-4 text-tg-hint shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_NAME_LENGTH))}
          placeholder={DEFAULT_PLAYER_NAMES[index - 1]}
          maxLength={MAX_NAME_LENGTH}
          className="flex-1 min-w-0 bg-transparent outline-none text-tg-text placeholder:text-tg-hint text-base"
          autoComplete="off"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
        />
      </div>
    </label>
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
    <div className="h-full w-full overflow-y-auto bg-tg-bg overscroll-contain">
      <div
        className="min-h-full flex flex-col px-5 gap-6"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
        }}
      >
        <header className="flex flex-col items-center gap-3 pt-4 pb-2">
          <div className="w-16 h-16 rounded-2xl bg-tg-button text-tg-btn-text flex items-center justify-center shadow-lg shadow-tg-button/30">
            <Sparkles className="w-9 h-9" strokeWidth={1.75} />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-tg-text">Игра в слова</h1>
            <p className="text-tg-hint text-sm">Для двоих игроков · назовите слова на заданные буквы</p>
          </div>
        </header>

        <section className="space-y-2">
          <div className="text-tg-hint text-xs uppercase tracking-wider px-1">Имена игроков</div>
          <NameInput index={1} value={name1} onChange={setName1} />
          <NameInput index={2} value={name2} onChange={setName2} />
        </section>

        <OptionGroup<TargetScore>
          label="Игра до"
          options={TARGET_SCORE_OPTIONS}
          value={targetScore}
          onChange={setTargetScore}
          format={v => `${v} очков`}
        />

        <OptionGroup<Penalty>
          label="Штраф за неверное слово"
          options={PENALTY_OPTIONS}
          value={penalty}
          onChange={setPenalty}
          format={v => (v === 0 ? 'Без штрафа' : '−1 балл')}
        />

        <OptionGroup<RoundSeconds>
          label="Таймер на раунд"
          options={ROUND_SEC_OPTIONS}
          value={roundSec}
          onChange={setRoundSec}
          format={v => (v === 0 ? 'Без таймера' : `${v} сек`)}
        />

        <div className="flex-1" />

        <div className="text-tg-hint text-xs leading-relaxed px-1">
          Назовите слова вслух. Кто первый назвал слово на заданные буквы —
          нажимает свою кнопку «+1» внизу. Буквы обновляются каждый раунд.
        </div>

        <BrandButton
          onPress={handleStart}
          variant="primary"
          className="w-full h-14 text-lg flex items-center justify-center gap-2 shadow-md"
        >
          <Play className="w-5 h-5" />
          Начать игру
        </BrandButton>
      </div>
    </div>
  )
}
