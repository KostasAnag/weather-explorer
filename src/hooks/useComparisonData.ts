import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchCurrentWeather, fetchForecast } from '../services/weatherService'
import type { ComparisonEntry, SavedLocation } from '../types/weather'

/**
 * Current weather + forecast for each location. Query keys match the rest of the app
 * (useCurrentWeather / useForecast), so places already viewed come straight from cache.
 */
export function useComparisonData(locations: SavedLocation[]): ComparisonEntry[] {
  const weather = useQueries({
    queries: locations.map((l) => ({
      queryKey: ['currentWeather', l.latitude, l.longitude],
      queryFn: () => fetchCurrentWeather(l),
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => results.map((r) => ({ data: r.data, isError: r.isError })),
  })
  const forecast = useQueries({
    queries: locations.map((l) => ({
      queryKey: ['forecast', l.latitude, l.longitude],
      queryFn: () => fetchForecast(l),
      staleTime: 10 * 60 * 1000,
    })),
    combine: (results) => results.map((r) => ({ data: r.data, isError: r.isError })),
  })

  return useMemo(
    () =>
      locations.map((location, i) => ({
        location,
        weather: weather[i]?.data,
        forecast: forecast[i]?.data,
        weatherError: weather[i]?.isError ?? false,
        forecastError: forecast[i]?.isError ?? false,
      })),
    [locations, weather, forecast],
  )
}
