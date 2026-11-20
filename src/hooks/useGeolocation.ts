import { useCallback, useState } from 'react'
import { round4 } from '../lib/coordinates'
import type { GeolocationErrorReason, GeolocationState } from '../types/geolocation'
import type { Coordinates } from '../types/weather'

// Standard GeolocationPositionError codes.
const REASONS: Record<number, GeolocationErrorReason> = {
  1: 'denied',
  2: 'unavailable',
  3: 'timeout',
}

/** Asks the browser for the user's position. Only runs when `locate()` is called. */
export function useGeolocation(onSuccess?: (coordinates: Coordinates) => void) {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', reason: 'unsupported' })
      return
    }
    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // A fresh object each time, so consumers re-center even for the same spot.
        const coordinates = {
          latitude: round4(coords.latitude),
          longitude: round4(coords.longitude),
        }
        setState({ status: 'success', coordinates })
        onSuccess?.(coordinates)
      },
      (error) => setState({ status: 'error', reason: REASONS[error.code] ?? 'unavailable' }),
      { timeout: 10_000 },
    )
  }, [onSuccess])

  return { state, locate }
}
