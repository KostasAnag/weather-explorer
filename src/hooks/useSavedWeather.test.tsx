import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useSavedWeather } from './useSavedWeather'
import * as service from '../services/weatherService'
import type { CurrentWeather, SavedLocation } from '../types/weather'

vi.mock('../services/weatherService')

const weather = (temperature: number): CurrentWeather => ({
  time: 't', temperature, feelsLike: 0, humidity: 0, precipitation: 0, weatherCode: 0,
  cloudCover: 0, pressure: 0, windSpeed: 0, windDirection: 0, isDay: true,
})

const a: SavedLocation = { id: '1,2', latitude: 1, longitude: 2 }
const b: SavedLocation = { id: '3,4', name: 'B', latitude: 3, longitude: 4 }

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useSavedWeather', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns an empty map for no saved locations', () => {
    const { result } = renderHook(() => useSavedWeather([]), { wrapper })
    expect(result.current).toEqual({})
    expect(service.fetchCurrentWeather).not.toHaveBeenCalled()
  })

  it('fetches current weather for every saved location, keyed by id', async () => {
    vi.mocked(service.fetchCurrentWeather).mockImplementation(async ({ latitude }) =>
      weather(latitude * 10),
    )
    const { result } = renderHook(() => useSavedWeather([a, b]), { wrapper })

    await waitFor(() => expect(Object.keys(result.current)).toHaveLength(2))
    expect(result.current['1,2'].temperature).toBe(10)
    expect(result.current['3,4'].temperature).toBe(30)
  })

  it('omits locations whose request failed instead of breaking the others', async () => {
    vi.mocked(service.fetchCurrentWeather).mockImplementation(async ({ latitude }) => {
      if (latitude === 1) throw new Error('boom')
      return weather(5)
    })
    const { result } = renderHook(() => useSavedWeather([a, b]), { wrapper })

    await waitFor(() => expect(result.current['3,4']).toBeDefined())
    expect(result.current['1,2']).toBeUndefined()
  })
})
