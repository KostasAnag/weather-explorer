import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useForecast } from './useForecast'
import * as service from '../services/weatherService'
import type { Forecast } from '../types/weather'

vi.mock('../services/weatherService')

const forecast: Forecast = { hourly: [], daily: [] }

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useForecast', () => {
  beforeEach(() => vi.resetAllMocks())

  it('does not fetch while no location is selected', () => {
    const { result } = renderHook(() => useForecast(null), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(service.fetchForecast).not.toHaveBeenCalled()
  })

  it('fetches the forecast for the selected coordinates', async () => {
    vi.mocked(service.fetchForecast).mockResolvedValue(forecast)
    const coords = { latitude: 1, longitude: 2 }
    const { result } = renderHook(() => useForecast(coords), { wrapper })
    await waitFor(() => expect(result.current.data).toEqual(forecast))
    expect(service.fetchForecast).toHaveBeenCalledWith(coords)
  })

  it('exposes errors', async () => {
    vi.mocked(service.fetchForecast).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useForecast({ latitude: 1, longitude: 2 }), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
