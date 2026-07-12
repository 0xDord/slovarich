import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl } from '../SegmentedControl'

describe('SegmentedControl', () => {
  const opts = [3, 5, 10, 15] as const

  it('renders all options', () => {
    render(
      <SegmentedControl
        options={opts}
        value={5}
        onChange={() => {}}
        format={v => `${v} очков`}
      />
    )
    expect(screen.getByText('3 очков')).toBeInTheDocument()
    expect(screen.getByText('5 очков')).toBeInTheDocument()
    expect(screen.getByText('10 очков')).toBeInTheDocument()
    expect(screen.getByText('15 очков')).toBeInTheDocument()
  })

  it('calls onChange with the selected value on pointer down', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SegmentedControl
        options={opts}
        value={5}
        onChange={onChange}
        format={v => `${v} очков`}
      />
    )
    await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('10 очков') })
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('positions the indicator at the selected index', () => {
    render(
      <SegmentedControl
        options={opts}
        value={10}
        onChange={() => {}}
        format={v => `${v} очков`}
      />
    )
    const indicator = document.querySelector('[data-indicator]') as HTMLElement
    expect(indicator).not.toBeNull()
    // 10 is index 2 of 4 → translateX(200%)
    expect(indicator.style.transform).toContain('200')
  })
})
