import { useQuery } from '@tanstack/react-query'
import { searchPlaces } from '../services/geocodingService'
import { useDebouncedValue } from './useDebouncedValue'

export const MIN_SEARCH_LENGTH = 2

export function usePlaceSearch(query: string, debounceMs = 300) {
  const trimmed = query.trim()
  const debounced = useDebouncedValue(trimmed, debounceMs)

  const active = trimmed.length >= MIN_SEARCH_LENGTH
  const search = useQuery({
    queryKey: ['placeSearch', debounced.toLowerCase()],
    // TanStack passes an AbortSignal: outdated requests are cancelled automatically.
    queryFn: ({ signal }) => searchPlaces(debounced, signal),
    enabled: debounced.length >= MIN_SEARCH_LENGTH,
    staleTime: 5 * 60 * 1000,
  })

  return {
    results: active ? (search.data ?? []) : [],
    // "Loading" also covers the debounce wait, so we never flash "No places found" mid-typing.
    isLoading: active && (trimmed !== debounced || search.isFetching),
    isError: active && search.isError,
  }
}
