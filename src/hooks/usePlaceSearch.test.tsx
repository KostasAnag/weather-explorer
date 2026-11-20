import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlaceSearch } from './usePlaceSearch'
import * as service from '../services/geocodingService'
import type { PlaceSuggestion } from '../types/weather'

vi.mock('../services/geocodingService')

const athens: PlaceSuggestion = {
  id: 1, name: 'Athens', latitude: 37.98, longitude: 23.72, admin1: 'Attica', country: 'Greece',
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('usePlaceSearch', () => {
  beforeEach(() => vi.resetAllMocks())

  it('does not search for fewer than 2 characters', async () => {
    const { result } = renderHook(() => usePlaceSearch('a', 10), { wrapper })
    await new Promise((r) => setTimeout(r, 50))
    expect(service.searchPlaces).not.toHaveBeenCalled()
    expect(result.current.results).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('searches with the trimmed query and returns results', async () => {
    vi.mocked(service.searchPlaces).mockResolvedValue([athens])
    const { result } = renderHook(() => usePlaceSearch('  Ath  ', 10), { wrapper })

    await waitFor(() => expect(result.current.results).toEqual([athens]))
    expect(vi.mocked(service.searchPlaces).mock.calls[0][0]).toBe('Ath')
    expect(result.current.isLoading).toBe(false)
  })

  it('is "loading" while the user is still typing (debounce pending)', () => {
    vi.mocked(service.searchPlaces).mockResolvedValue([athens])
    const { result, rerender } = renderHook(({ q }) => usePlaceSearch(q, 500), {
      wrapper,
      initialProps: { q: '' }, // the search box starts empty, then the user types
    })
    rerender({ q: 'Ath' })
    expect(result.current.isLoading).toBe(true)
    expect(service.searchPlaces).not.toHaveBeenCalled()
  })

  it('sends one request for rapid typing, not one per keystroke', async () => {
    vi.mocked(service.searchPlaces).mockResolvedValue([athens])
    const { result, rerender } = renderHook(({ q }) => usePlaceSearch(q, 50), {
      wrapper,
      initialProps: { q: '' },
    })
    rerender({ q: 'at' })
    rerender({ q: 'ath' })
    rerender({ q: 'athe' })
    await waitFor(() => expect(result.current.results).toEqual([athens]))
    expect(service.searchPlaces).toHaveBeenCalledTimes(1)
    expect(vi.mocked(service.searchPlaces).mock.calls[0][0]).toBe('athe')
  })

  it('exposes errors', async () => {
    vi.mocked(service.searchPlaces).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => usePlaceSearch('Ath', 10), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.results).toEqual([])
  })
})
