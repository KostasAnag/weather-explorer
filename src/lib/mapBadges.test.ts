import { buildMapBadges } from './mapBadges'
import type { CurrentWeather, SavedLocation } from '../types/weather'

const weather = (temperature: number, weatherCode = 3): CurrentWeather => ({
  time: 't', temperature, feelsLike: 0, humidity: 0, precipitation: 0, weatherCode,
  cloudCover: 0, pressure: 0, windSpeed: 0, windDirection: 0, isDay: true,
})

const rome: SavedLocation = { id: '41.9028,12.4964', name: 'Rome', latitude: 41.9028, longitude: 12.4964 }
const unnamed: SavedLocation = { id: '10,20', latitude: 10, longitude: 20 }

describe('buildMapBadges', () => {
  it('returns nothing when there is nothing to show', () => {
    expect(buildMapBadges({ saved: [], selected: null, weatherById: {} })).toEqual([])
  })

  it('makes a badge per saved location with its current weather', () => {
    const badges = buildMapBadges({
      saved: [rome, unnamed],
      selected: null,
      weatherById: { [rome.id]: weather(18.4, 63) },
    })
    expect(badges).toEqual([
      {
        id: rome.id, latitude: 41.9028, longitude: 12.4964, label: 'Rome',
        temperature: 18.4, weatherCode: 63, isDay: true, selected: false,
      },
      { id: unnamed.id, latitude: 10, longitude: 20, label: '10, 20', selected: false },
    ])
  })

  it('has no temperature while a location is still loading', () => {
    const [badge] = buildMapBadges({ saved: [rome], selected: null, weatherById: {} })
    expect(badge.temperature).toBeUndefined()
  })

  it('adds the selected location as a highlighted badge when it is not saved', () => {
    const badges = buildMapBadges({
      saved: [rome],
      selected: { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
      weatherById: { '48.8566,2.3522': weather(9) },
    })
    expect(badges).toHaveLength(2)
    expect(badges[1]).toMatchObject({ id: '48.8566,2.3522', label: 'Paris', temperature: 9, selected: true })
    expect(badges[0].selected).toBe(false)
  })

  it('does not duplicate a selected location that is also saved: it is highlighted instead', () => {
    const badges = buildMapBadges({
      saved: [rome],
      selected: { name: 'Rome', latitude: 41.9028, longitude: 12.4964 },
      weatherById: {},
    })
    expect(badges).toHaveLength(1)
    expect(badges[0].selected).toBe(true)
  })
})
