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
