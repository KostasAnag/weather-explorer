import { useQuery } from '@tanstack/react-query'
import { fetchCurrentWeather } from '../services/weatherService'
import type { Coordinates } from '../types/weather'

export function useCurrentWeather(coordinates: Coordinates | null) {
  return useQuery({
    // Coordinates are part of the key: each location gets its own cache entry.
    queryKey: ['currentWeather', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => fetchCurrentWeather(coordinates!),
    enabled: coordinates !== null,
    staleTime: 5 * 60 * 1000,
  })
}
