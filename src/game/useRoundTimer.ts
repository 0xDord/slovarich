import { useEffect, useRef, useState } from 'react'

interface UseRoundTimerArgs {
  seconds: number
  round: number
  active: boolean
  onExpire: () => void
}

export function useRoundTimer({ seconds, round, active, onExpire }: UseRoundTimerArgs): number {
  const [remaining, setRemaining] = useState(seconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!active || seconds <= 0) {
      setRemaining(seconds)
      return
    }

    const endTime = Date.now() + seconds * 1000
    setRemaining(seconds)

    const tick = () => {
      const ms = Math.max(0, endTime - Date.now())
      setRemaining(Math.ceil(ms / 1000))
      if (ms <= 0) {
        clearInterval(id)
        onExpireRef.current()
      }
    }

    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [seconds, round, active])

  return active && seconds > 0 ? remaining : 0
}
