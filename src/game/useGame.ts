import { useReducer, useCallback } from 'react'
import type { GameConfig, LetterPair, PlayerId, Screen } from '../types'
import { DEFAULT_PLAYER_NAMES } from '../types'
import { generateLetterPair } from '../lib/letters'

export interface GameState {
  screen: Screen
  config: GameConfig
  scores: [number, number]
  round: number
  letters: LetterPair
  winner: PlayerId | null
}

export type GameAction =
  | { type: 'START_GAME'; config: GameConfig }
  | { type: 'AWARD_POINT'; player: PlayerId }
  | { type: 'PENALIZE'; player: PlayerId }
  | { type: 'NEXT_ROUND' }
  | { type: 'TIMER_EXPIRED' }
  | { type: 'RESET' }

export const DEFAULT_CONFIG: GameConfig = {
  targetScore: 5,
  penalty: 0,
  roundSec: 0,
  playerNames: DEFAULT_PLAYER_NAMES,
}

export const initialState: GameState = {
  screen: 'setup',
  config: DEFAULT_CONFIG,
  scores: [0, 0],
  round: 1,
  letters: { first: 'А', last: 'К' },
  winner: null,
}

function newRound(state: GameState): Pick<GameState, 'round' | 'letters'> {
  return {
    round: state.round + 1,
    letters: generateLetterPair(state.letters),
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        screen: 'game',
        config: action.config,
        letters: generateLetterPair(),
      }

    case 'AWARD_POINT': {
      if (state.screen !== 'game') return state
      const idx = action.player - 1
      const scores: [number, number] = [state.scores[0], state.scores[1]]
      scores[idx] += 1
      if (scores[idx] >= state.config.targetScore) {
        return { ...state, scores, screen: 'winner', winner: action.player }
      }
      return { ...state, scores, ...newRound(state) }
    }

    case 'PENALIZE': {
      if (state.screen !== 'game') return state
      if (state.config.penalty !== -1) return state
      const idx = action.player - 1
      const scores: [number, number] = [state.scores[0], state.scores[1]]
      scores[idx] = Math.max(0, scores[idx] - 1)
      return { ...state, scores, ...newRound(state) }
    }

    case 'NEXT_ROUND':
    case 'TIMER_EXPIRED': {
      if (state.screen !== 'game') return state
      return { ...state, ...newRound(state) }
    }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const startGame = useCallback((config: GameConfig) => dispatch({ type: 'START_GAME', config }), [])
  const awardPoint = useCallback((player: PlayerId) => dispatch({ type: 'AWARD_POINT', player }), [])
  const penalize = useCallback((player: PlayerId) => dispatch({ type: 'PENALIZE', player }), [])
  const nextRound = useCallback(() => dispatch({ type: 'NEXT_ROUND' }), [])
  const timerExpired = useCallback(() => dispatch({ type: 'TIMER_EXPIRED' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return { state, startGame, awardPoint, penalize, nextRound, timerExpired, reset }
}
