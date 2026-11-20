import { useCallback, useEffect, useState } from 'react'
import { locationId, toSavedLocation } from '../lib/locations'
import { loadSavedLocations, saveSavedLocations } from '../services/savedLocationsStorage'
import type { SavedLocation, SelectedLocation } from '../types/weather'

export function useSavedLocations() {
  // Lazy initializer: reads localStorage once, not on every render.
  const [locations, setLocations] = useState<SavedLocation[]>(loadSavedLocations)

  useEffect(() => {
    saveSavedLocations(locations)
  }, [locations])

  const isSaved = useCallback(
    (location: SelectedLocation) => locations.some((l) => l.id === locationId(location)),
    [locations],
  )

  const add = useCallback(
    (location: SelectedLocation): 'added' | 'duplicate' => {
      if (isSaved(location)) return 'duplicate'
      setLocations((prev) => [...prev, toSavedLocation(location)])
      return 'added'
    },
    [isSaved],
  )

  const remove = useCallback(
    (id: string) => setLocations((prev) => prev.filter((l) => l.id !== id)),
    [],
  )

  return { locations, add, remove, isSaved }
}
