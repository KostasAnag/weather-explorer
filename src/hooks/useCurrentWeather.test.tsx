import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useCurrentWeather } from './useCurrentWeather'
import * as service from '../services/weatherService'
import type { CurrentWeather } from '../types/weather'

vi.mock('../services/weatherService')

const weather: CurrentWeather = {
  time: 't',
  temperature: 20,
  feelsLike: 19,
  humidity: 50,
  precipitation: 0,
  weatherCode: 0,
  cloudCover: 10,
  pressure: 1013,
  windSpeed: 5,
  windDirection: 90,
  isDay: true,
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useCurrentWeather', () => {
  beforeEach(() => vi.resetAllMocks())

  it('does not fetch while no location is selected', () => {
    const { result } = renderHook(() => useCurrentWeather(null), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(service.fetchCurrentWeather).not.toHaveBeenCalled()
  })

  it('fetches weather for the selected coordinates', async () => {
    vi.mocked(service.fetchCurrentWeather).mockResolvedValue(weather)
    const coords = { latitude: 1, longitude: 2 }

    const { result } = renderHook(() => useCurrentWeather(coords), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(weather))
    expect(service.fetchCurrentWeather).toHaveBeenCalledWith(coords)
  })

  it('exposes errors', async () => {
    vi.mocked(service.fetchCurrentWeather).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(
      () => useCurrentWeather({ latitude: 1, longitude: 2 }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
