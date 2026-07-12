import type { CSSProperties } from 'react'
import { Minus, Plus, RefreshCw } from 'lucide-react'
import type { PlayerId } from '../types'
import type { GameState } from '../game/useGame'
import { useRoundTimer } from '../game/useRoundTimer'
import { useHaptics } from '../hooks/useHaptics'

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
  onAward: () => void
}

function ScoreButton({ name, score, targetScore, leading, onAward }: ScoreButtonProps) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()
        onAward()
      }}
      style={{ touchAction: 'manipulation' } as CSSProperties}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-5 rounded-2xl transition-[filter,transform] duration-75 active:brightness-90 active:scale-[0.98] ${
        leading
          ? 'bg-tg-button text-tg-btn-text'
          : 'bg-tg-sec-bg text-tg-text'
      }`}
    >
      <span className="text-5xl font-bold tabular-nums leading-none">{score}</span>
      <span className="text-sm opacity-80 tabular-nums">из {targetScore}</span>
      <span className="text-base font-semibold mt-2 max-w-full truncate px-3">{name}</span>
      <span className="flex items-center gap-1 text-xs font-medium opacity-80 mt-0.5">
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
    <button
      type="button"
      aria-label={`${name}: −1 штраф`}
      onPointerDown={(e) => {
        e.preventDefault()
        onPenalize()
      }}
      style={{ touchAction: 'manipulation' } as CSSProperties}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium active:brightness-95"
    >
      <Minus className="w-4 h-4" strokeWidth={2.5} />
      <span>−1</span>
    </button>
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
    <div
      className="h-full w-full flex flex-col bg-tg-bg"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <span className="text-tg-hint text-sm">
          Раунд <span className="text-tg-text font-semibold tabular-nums">{round}</span>
        </span>
        {config.roundSec > 0 && (
          <span
            className={`text-sm font-semibold tabular-nums ${
              remaining <= 5 ? 'text-red-500' : 'text-tg-text'
            }`}
          >
            {remaining} сек
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-5">
        <div className="text-tg-hint text-xs uppercase tracking-[0.3em] mb-4">Слово начинается и заканчивается на</div>
        <div
          key={`${letters.first}-${letters.last}-${round}`}
          className="flex items-center gap-4 text-8xl font-bold text-tg-text leading-none letter-pop"
        >
          <span>{letters.first}</span>
          <span className="text-3xl text-tg-hint">…</span>
          <span>{letters.last}</span>
        </div>
        <div className="text-tg-hint text-sm mt-4">первая и последняя буквы</div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault()
            handleNextWord()
          }}
          style={{ touchAction: 'manipulation' } as CSSProperties}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tg-sec-bg text-tg-text text-sm font-medium active:brightness-95"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2.25} />
          Следующее слово
        </button>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-2 shrink-0">
        <div className="flex gap-3">
          <ScoreButton
            name={name1}
            score={scores[0]}
            targetScore={config.targetScore}
            leading={leading === 1}
            onAward={() => handleAward(1)}
          />
          <ScoreButton
            name={name2}
            score={scores[1]}
            targetScore={config.targetScore}
            leading={leading === 2}
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
  )
}
