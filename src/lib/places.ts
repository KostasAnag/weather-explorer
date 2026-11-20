import { round4 } from './coordinates'
import type { SelectedLocation } from '../types/weather'

/** The few fields we read from a MapLibre vector-tile feature. */
export interface MapFeatureLike {
  sourceLayer?: string
  properties: Record<string, unknown>
  geometry: { type: string; coordinates?: unknown }
}

// Settlement classes in the OpenMapTiles `place` layer, biggest first.
const SETTLEMENT_RANK = ['city', 'town', 'village', 'hamlet']

/**
 * Picks the most important named settlement among the features under a click.
 * The name comes from the map's own tile data, so this is not reverse geocoding.
 */
export function findPlace(
  features: MapFeatureLike[],
): (Required<Pick<SelectedLocation, 'name'>> & SelectedLocation) | null {
  const candidates = features
    .filter(
      (f) =>
        f.sourceLayer === 'place' &&
        typeof f.properties.name === 'string' &&
        SETTLEMENT_RANK.includes(String(f.properties.class)) &&
        f.geometry.type === 'Point' &&
        Array.isArray(f.geometry.coordinates),
    )
    .sort(
      (a, b) =>
        SETTLEMENT_RANK.indexOf(String(a.properties.class)) -
        SETTLEMENT_RANK.indexOf(String(b.properties.class)),
    )
  const best = candidates[0]
  if (!best) return null
  const [longitude, latitude] = best.geometry.coordinates as number[]
  return { name: best.properties.name as string, latitude: round4(latitude), longitude: round4(longitude) }
}
