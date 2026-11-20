import { useQuery } from '@tanstack/react-query'
import { fetchForecast } from '../services/weatherService'
import type { Coordinates } from '../types/weather'

export function useForecast(coordinates: Coordinates | null) {
  return useQuery({
    queryKey: ['forecast', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => fetchForecast(coordinates!),
    enabled: coordinates !== null,
    staleTime: 10 * 60 * 1000,
  })
}
