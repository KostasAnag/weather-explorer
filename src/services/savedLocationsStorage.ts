import type { SavedLocation } from '../types/weather'

export const SAVED_LOCATIONS_KEY = 'weather-explorer:saved-locations'

// localStorage is user-editable input: never trust its shape.
function isSavedLocation(value: unknown): value is SavedLocation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    Number.isFinite(v.latitude) &&
    Number.isFinite(v.longitude) &&
    (v.name === undefined || typeof v.name === 'string')
  )
}

export function loadSavedLocations(): SavedLocation[] {
  try {
    const raw = localStorage.getItem(SAVED_LOCATIONS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSavedLocation) : []
  } catch {
    return [] // corrupt JSON or storage blocked
  }
}

export function saveSavedLocations(locations: SavedLocation[]): void {
  try {
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(locations))
  } catch {
    // Quota exceeded / private mode: the app keeps working, just without persistence.
  }
}
