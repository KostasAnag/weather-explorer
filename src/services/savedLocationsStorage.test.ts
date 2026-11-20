import {
  loadSavedLocations,
  SAVED_LOCATIONS_KEY,
  saveSavedLocations,
} from './savedLocationsStorage'
import type { SavedLocation } from '../types/weather'

const rome: SavedLocation = { id: '41.9028,12.4964', name: 'Rome', latitude: 41.9028, longitude: 12.4964 }

describe('savedLocationsStorage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns [] when nothing is stored', () => {
    expect(loadSavedLocations()).toEqual([])
  })

  it('round-trips locations', () => {
    saveSavedLocations([rome])
    expect(loadSavedLocations()).toEqual([rome])
    expect(localStorage.getItem(SAVED_LOCATIONS_KEY)).toContain('Rome')
  })

  it('returns [] for corrupt JSON instead of throwing', () => {
    localStorage.setItem(SAVED_LOCATIONS_KEY, '{not json')
    expect(loadSavedLocations()).toEqual([])
  })

  it('returns [] when the stored value is not an array', () => {
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify({ a: 1 }))
    expect(loadSavedLocations()).toEqual([])
  })

  it('drops invalid entries but keeps valid ones', () => {
    localStorage.setItem(
      SAVED_LOCATIONS_KEY,
      JSON.stringify([rome, { id: 'x', latitude: 'nope', longitude: 1 }, null, 42, { latitude: 1 }]),
    )
    expect(loadSavedLocations()).toEqual([rome])
  })

  it('survives a blocked localStorage (private mode / quota)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(loadSavedLocations()).toEqual([])
    expect(() => saveSavedLocations([rome])).not.toThrow()
  })
})
