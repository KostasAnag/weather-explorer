import { useEffect, useState } from 'react'

/** Returns `value`, but only after it has stopped changing for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer) // each keystroke cancels the previous wait
  }, [value, delay])

  return debounced
}
