import type { PlaceSuggestion, SavedLocation, SelectedLocation } from '../types/weather'
import { round4 } from './coordinates'

/** Same rounded coordinates = same place, which is how duplicates are detected. */
export function locationId({ latitude, longitude }: SelectedLocation): string {
  return `${round4(latitude)},${round4(longitude)}`
}

export function toSavedLocation(location: SelectedLocation): SavedLocation {
  const saved: SavedLocation = {
    id: locationId(location),
    latitude: round4(location.latitude),
    longitude: round4(location.longitude),
  }
  if (location.name) saved.name = location.name
  return saved
}

export function locationLabel(location: SelectedLocation): string {
  return location.name ?? `${location.latitude}, ${location.longitude}`
}

/** 'Athens, Attica, Greece': region and country disambiguate same-named cities. */
export function suggestionLabel({ name, admin1, country }: PlaceSuggestion): string {
  const parts = [name, admin1, country].filter((p): p is string => Boolean(p))
  return [...new Set(parts)].join(', ')
}
