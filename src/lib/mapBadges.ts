import type { CurrentWeather, MapBadge, SavedLocation, SelectedLocation } from '../types/weather'
import { locationId, locationLabel } from './locations'

interface BuildMapBadgesInput {
  saved: SavedLocation[]
  selected: SelectedLocation | null
  /** Current weather by location id. Missing entries mean "still loading". */
  weatherById: Record<string, CurrentWeather | undefined>
}

/** Merges saved places and the current selection into one list of map badges. */
export function buildMapBadges({ saved, selected, weatherById }: BuildMapBadgesInput): MapBadge[] {
  const selectedId = selected ? locationId(selected) : null

  const toBadge = (location: SelectedLocation, id: string): MapBadge => {
    const badge: MapBadge = {
      id,
      latitude: location.latitude,
      longitude: location.longitude,
      label: locationLabel(location),
      selected: id === selectedId,
    }
    const weather = weatherById[id]
    if (weather) {
      badge.temperature = weather.temperature
      badge.weatherCode = weather.weatherCode
      badge.isDay = weather.isDay
    }
    return badge
  }

  const badges = saved.map((location) => toBadge(location, location.id))
  // A selected place that is not saved still deserves a badge (it replaces the old pin).
  if (selected && selectedId && !saved.some((l) => l.id === selectedId)) {
    badges.push(toBadge(selected, selectedId))
  }
  return badges
}
