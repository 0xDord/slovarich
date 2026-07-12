import { useMemo } from 'react'

interface Props {
  density?: 'full' | 'low'
}

const LETTERS = ['С', 'Л', 'О', 'В', 'А', 'Р', 'И', 'Ч', '✦', '✧']

interface DecorItem {
  letter: string
  top: string
  left: string
  size: number
  duration: number
  delay: number
  blur: number
  opacity: number
}

function buildItems(count: number): DecorItem[] {
  const items: DecorItem[] = []
  for (let i = 0; i < count; i++) {
    items.push({
      letter: LETTERS[i % LETTERS.length],
      top:  `${5 + Math.floor((i * 37) % 90)}%`,
      left: `${5 + Math.floor((i * 53) % 90)}%`,
      size: 24 + ((i * 17) % 36),
      duration: 6 + ((i * 3) % 5),
      delay: (i * 0.7) % 3,
      blur: 1.5,
      opacity: 0.55,
    })
  }
  return items
}

export function FloatingDecor({ density = 'full' }: Props) {
  const count = density === 'low' ? 6 : 10
  const items = useMemo(() => buildItems(count), [count])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          data-decor-letter
          className="absolute text-brand-cream font-extrabold select-none opacity-55"
          style={{
            top: it.top,
            left: it.left,
            fontSize: `${it.size}px`,
            filter: `blur(${it.blur}px)`,
            animation: `float ${it.duration}s ease-in-out ${it.delay}s infinite`,
          }}
        >
          {it.letter}
        </span>
      ))}
    </div>
  )
}
