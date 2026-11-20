import { useQueries } from '@tanstack/react-query'
import { fetchCurrentWeather } from '../services/weatherService'
import type { CurrentWeather, SavedLocation } from '../types/weather'

/**
 * Current weather for every saved location, keyed by location id.
 * Uses the same query keys as useCurrentWeather, so a place that is both
 * selected and saved is fetched (and cached) once.
 */
export function useSavedWeather(locations: SavedLocation[]) {
  return useQueries({
    queries: locations.map((location) => ({
      queryKey: ['currentWeather', location.latitude, location.longitude],
      queryFn: () => fetchCurrentWeather(location),
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => {
      const byId: Record<string, CurrentWeather> = {}
      results.forEach((result, i) => {
        if (result.data) byId[locations[i].id] = result.data // failed/loading ones are simply absent
      })
      return byId
    },
  })
}
