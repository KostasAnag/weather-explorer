import { act, renderHook } from '@testing-library/react'
import { useSavedLocations } from './useSavedLocations'
import { SAVED_LOCATIONS_KEY } from '../services/savedLocationsStorage'

const rome = { name: 'Rome', latitude: 41.9028, longitude: 12.4964 }
const click = { latitude: 10, longitude: 20 }

describe('useSavedLocations', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useSavedLocations())
    expect(result.current.locations).toEqual([])
  })

  it('adds a location and persists only location data', () => {
    const { result } = renderHook(() => useSavedLocations())
    let outcome: string | undefined
    act(() => {
      outcome = result.current.add(rome)
    })
    expect(outcome).toBe('added')
    expect(result.current.locations).toEqual([{ id: '41.9028,12.4964', ...rome }])
    expect(JSON.parse(localStorage.getItem(SAVED_LOCATIONS_KEY)!)).toEqual([
      { id: '41.9028,12.4964', ...rome },
    ])
  })

  it('refuses duplicates (same rounded coordinates), even with a different name', () => {
    const { result } = renderHook(() => useSavedLocations())
    act(() => void result.current.add(rome))
    let outcome: string | undefined
    act(() => {
      outcome = result.current.add({ latitude: 41.90281, longitude: 12.49641 })
    })
    expect(outcome).toBe('duplicate')
    expect(result.current.locations).toHaveLength(1)
  })

  it('reports whether a location is saved', () => {
    const { result } = renderHook(() => useSavedLocations())
    expect(result.current.isSaved(rome)).toBe(false)
    act(() => void result.current.add(rome))
    expect(result.current.isSaved(rome)).toBe(true)
    expect(result.current.isSaved(click)).toBe(false)
  })

  it('removes by id and updates storage', () => {
    const { result } = renderHook(() => useSavedLocations())
    act(() => void result.current.add(rome))
    act(() => void result.current.add(click))
    act(() => result.current.remove('41.9028,12.4964'))
    expect(result.current.locations.map((l) => l.id)).toEqual(['10,20'])
    expect(JSON.parse(localStorage.getItem(SAVED_LOCATIONS_KEY)!)).toHaveLength(1)
  })

  it('restores saved locations on the next mount', () => {
    const first = renderHook(() => useSavedLocations())
    act(() => void first.result.current.add(rome))
    first.unmount()

    const second = renderHook(() => useSavedLocations())
    expect(second.result.current.locations).toHaveLength(1)
    expect(second.result.current.locations[0].name).toBe('Rome')
  })
})
