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
