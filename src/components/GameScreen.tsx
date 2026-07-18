import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Eye, Minus, Plus, RefreshCw } from 'lucide-react'
import type { PlayerId } from '../types'
import type { GameState } from '../game/useGame'
import { useRoundTimer } from '../game/useRoundTimer'
import { useHaptics } from '../hooks/useHaptics'
import { getExamples } from '../lib/letters'
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
  const [showExamples, setShowExamples] = useState(false)
  const examples = getExamples(letters)

  useEffect(() => {
    setShowExamples(false)
  }, [letters.first, letters.last, round])

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

  const handleToggleExamples = () => {
    haptics.select()
    setShowExamples(v => !v)
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
