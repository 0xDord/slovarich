import { Trophy, RotateCcw } from 'lucide-react'
import type { PlayerId } from '../types'
import { PrimaryButton } from './PrimaryButton'

interface Props {
  winner: PlayerId
  winnerName: string
  scores: [number, number]
  playerNames: [string, string]
  onNewGame: () => void
}

export function WinnerScreen({ winner, winnerName, scores, playerNames, onNewGame }: Props) {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center bg-tg-bg text-tg-text px-6 gap-8"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="w-24 h-24 rounded-full bg-tg-button/10 flex items-center justify-center">
        <Trophy className="w-14 h-14 text-tg-button" strokeWidth={1.5} />
      </div>
      <div className="text-center space-y-2">
        <div className="text-tg-hint text-sm uppercase tracking-wider">Победил</div>
        <div className="text-3xl font-bold">{winnerName}</div>
        <div className="text-xl text-tg-hint tabular-nums pt-2">
          <span className={winner === 1 ? 'text-tg-text font-semibold' : ''}>{scores[0]}</span>
          <span className="mx-2">:</span>
          <span className={winner === 2 ? 'text-tg-text font-semibold' : ''}>{scores[1]}</span>
        </div>
        <div className="text-tg-hint text-xs pt-1">
          {playerNames[0]} · {playerNames[1]}
        </div>
      </div>
      <PrimaryButton
        onPress={onNewGame}
        variant="primary"
        className="w-full max-w-xs h-14 text-lg flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Новая игра
      </PrimaryButton>
    </div>
  )
}
