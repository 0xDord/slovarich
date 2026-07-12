import { useMemo } from 'react'
import { CONFETTI_COLORS } from '../lib/brand'

interface Piece {
  left: number       // vw %
  delay: number      // ms
  duration: number   // ms
  size: number       // px
  color: string
}

function buildPieces(): Piece[] {
  const pieces: Piece[] = []
  for (let i = 0; i < 24; i++) {
    pieces.push({
      left: (i * 37) % 100,
      delay: (i * 47) % 500,
      duration: 1500 + ((i * 113) % 700),
      size: 8 + ((i * 7) % 8),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })
  }
  return pieces
}

export function Confetti() {
  const pieces = useMemo(buildPieces, [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          data-confetti-piece
          className="absolute top-0"
          style={{
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}ms linear ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  )
}
