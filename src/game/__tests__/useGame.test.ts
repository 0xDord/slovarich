import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../useGame'
import type { GameConfig } from '../../types'

const cfg = (overrides: Partial<GameConfig> = {}): GameConfig => ({
  targetScore: 5,
  penalty: 0,
  roundSec: 0,
  playerNames: ['Игрок 1', 'Игрок 2'],
  ...overrides,
})

describe('gameReducer', () => {
  it('starts in setup', () => {
    expect(initialState.screen).toBe('setup')
    expect(initialState.scores).toEqual([0, 0])
  })

  it('START_GAME switches to game screen with fresh scores', () => {
    const state = gameReducer(initialState, { type: 'START_GAME', config: cfg({ targetScore: 10 }) })
    expect(state.screen).toBe('game')
    expect(state.scores).toEqual([0, 0])
    expect(state.config.targetScore).toBe(10)
    expect(state.round).toBe(1)
  })

  it('AWARD_POINT increments and starts new round', () => {
    const started = gameReducer(initialState, { type: 'START_GAME', config: cfg() })
    const before = started.letters
    const next = gameReducer(started, { type: 'AWARD_POINT', player: 2 })
    expect(next.scores).toEqual([0, 1])
    expect(next.round).toBe(2)
    expect(next.letters).not.toEqual(before)
  })

  it('AWARD_POINT ends game when target reached', () => {
    const target5 = cfg({ targetScore: 3 })
    let s = gameReducer(initialState, { type: 'START_GAME', config: target5 })
    s = gameReducer(s, { type: 'AWARD_POINT', player: 1 })
    s = gameReducer(s, { type: 'AWARD_POINT', player: 1 })
    expect(s.screen).toBe('game')
    s = gameReducer(s, { type: 'AWARD_POINT', player: 1 })
    expect(s.screen).toBe('winner')
    expect(s.winner).toBe(1)
    expect(s.scores).toEqual([3, 0])
  })

  it('PENALIZE no-op when penalty mode is 0', () => {
    const started = gameReducer(initialState, { type: 'START_GAME', config: cfg({ penalty: 0 }) })
    const before = started.scores[0]
    const next = gameReducer(started, { type: 'PENALIZE', player: 1 })
    expect(next.scores[0]).toBe(before)
  })

  it('PENALIZE decrements but not below 0 in penalty mode', () => {
    const started = gameReducer(
      initialState,
      { type: 'START_GAME', config: cfg({ penalty: -1 }) },
    )
    const next = gameReducer(started, { type: 'PENALIZE', player: 1 })
    expect(next.scores[0]).toBe(0)
  })

  it('PENALIZE in penalty mode after a point', () => {
    let s = gameReducer(initialState, { type: 'START_GAME', config: cfg({ penalty: -1 }) })
    s = gameReducer(s, { type: 'AWARD_POINT', player: 1 })
    expect(s.scores[0]).toBe(1)
    s = gameReducer(s, { type: 'PENALIZE', player: 1 })
    expect(s.scores[0]).toBe(0)
  })

  it('TIMER_EXPIRED on game screen starts new round without scoring', () => {
    const started = gameReducer(initialState, { type: 'START_GAME', config: cfg() })
    const next = gameReducer(started, { type: 'TIMER_EXPIRED' })
    expect(next.scores).toEqual([0, 0])
    expect(next.round).toBe(2)
  })

  it('TIMER_EXPIRED is no-op on setup screen', () => {
    const next = gameReducer(initialState, { type: 'TIMER_EXPIRED' })
    expect(next).toBe(initialState)
  })

  it('RESET returns to setup', () => {
    let s = gameReducer(initialState, { type: 'START_GAME', config: cfg() })
    s = gameReducer(s, { type: 'AWARD_POINT', player: 1 })
    s = gameReducer(s, { type: 'RESET' })
    expect(s.screen).toBe('setup')
    expect(s.scores).toEqual([0, 0])
  })
})
