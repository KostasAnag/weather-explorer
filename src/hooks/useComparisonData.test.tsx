import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useComparisonData } from './useComparisonData'
import * as service from '../services/weatherService'
import type { CurrentWeather, Forecast, SavedLocation } from '../types/weather'

vi.mock('../services/weatherService')

const weather = (temperature: number): CurrentWeather => ({
  time: 't', temperature, feelsLike: 0, humidity: 0, precipitation: 0, weatherCode: 0,
  cloudCover: 0, pressure: 0, windSpeed: 0, windDirection: 0, isDay: true,
})
const forecast: Forecast = { hourly: [], daily: [] }

const a: SavedLocation = { id: '1,2', name: 'A', latitude: 1, longitude: 2 }
const b: SavedLocation = { id: '3,4', name: 'B', latitude: 3, longitude: 4 }

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useComparisonData', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns no entries and fetches nothing for no locations', () => {
    const { result } = renderHook(() => useComparisonData([]), { wrapper })
    expect(result.current).toEqual([])
    expect(service.fetchCurrentWeather).not.toHaveBeenCalled()
    expect(service.fetchForecast).not.toHaveBeenCalled()
  })

  it('returns one entry per location with its weather and forecast', async () => {
    vi.mocked(service.fetchCurrentWeather).mockImplementation(async ({ latitude }) => weather(latitude))
    vi.mocked(service.fetchForecast).mockResolvedValue(forecast)

    const { result } = renderHook(() => useComparisonData([a, b]), { wrapper })

    await waitFor(() => expect(result.current.every((e) => e.weather && e.forecast)).toBe(true))
    expect(result.current.map((e) => e.location.id)).toEqual(['1,2', '3,4'])
    expect(result.current.map((e) => e.weather?.temperature)).toEqual([1, 3])
    expect(result.current[0]).toMatchObject({ weatherError: false, forecastError: false })
  })

  it('flags a failed location without breaking the others', async () => {
    vi.mocked(service.fetchCurrentWeather).mockImplementation(async ({ latitude }) => {
      if (latitude === 1) throw new Error('boom')
      return weather(5)
    })
    vi.mocked(service.fetchForecast).mockResolvedValue(forecast)

    const { result } = renderHook(() => useComparisonData([a, b]), { wrapper })

    await waitFor(() => expect(result.current[0].weatherError).toBe(true))
    expect(result.current[0].weather).toBeUndefined()
    await waitFor(() => expect(result.current[1].weather?.temperature).toBe(5))
  })
})
