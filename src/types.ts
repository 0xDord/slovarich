export type PlayerId = 1 | 2

export type Screen = 'setup' | 'game' | 'winner'

export type TargetScore = 3 | 5 | 10 | 15

export type Penalty = 0 | -1

export type RoundSeconds = 0 | 30 | 60

export interface GameConfig {
  targetScore: TargetScore
  penalty: Penalty
  roundSec: RoundSeconds
  playerNames: [string, string]
}

export interface LetterPair {
  first: string
  last: string
}

export const TARGET_SCORE_OPTIONS: TargetScore[] = [3, 5, 10, 15]
export const PENALTY_OPTIONS: Penalty[] = [0, -1]
export const ROUND_SEC_OPTIONS: RoundSeconds[] = [0, 30, 60]

export const DEFAULT_PLAYER_NAMES: [string, string] = ['Игрок 1', 'Игрок 2']
export const MAX_NAME_LENGTH = 20
