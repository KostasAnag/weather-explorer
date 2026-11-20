import type { GeolocationErrorReason, GeolocationState } from '../types/geolocation'

const MESSAGES: Record<GeolocationErrorReason, string> = {
  denied: 'Location permission was denied. Allow it in your browser settings to use this.',
  unavailable: 'Your location could not be determined.',
  timeout: 'Finding your location timed out. Please try again.',
  unsupported: 'Geolocation is not supported by this browser.',
}

interface LocateButtonProps {
  state: GeolocationState
  onLocate: () => void
}

export function LocateButton({ state, onLocate }: LocateButtonProps) {
  const loading = state.status === 'loading'
  return (
    <div className="locate">
      <button type="button" onClick={onLocate} disabled={loading}>
        {loading ? 'Locating…' : 'Use my location'}
      </button>
      {state.status === 'error' && <p role="alert">{MESSAGES[state.reason]}</p>}
    </div>
  )
}
