import { act, renderHook } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300))
    expect(result.current).toBe('a')
  })

  it('only updates after the value has been stable for the delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'at' })
    act(() => void vi.advanceTimersByTime(200))
    rerender({ v: 'ath' }) // typing again restarts the wait
    act(() => void vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')

    act(() => void vi.advanceTimersByTime(100))
    expect(result.current).toBe('ath')
  })
})
