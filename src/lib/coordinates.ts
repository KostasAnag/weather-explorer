import type { Coordinates } from '../types/weather'

const round4 = (n: number) => Math.round(n * 10000) / 10000

/**
 * MapLibre can report longitudes outside [-180, 180] when the user pans
 * across the repeated world. Open-Meteo expects a valid range, so wrap it.
 */
export function normalizeLngLat(lngLat: { lng: number; lat: number }): Coordinates {
  let lng = lngLat.lng
  if (lng > 180 || lng < -180) {
    lng = ((((lng + 180) % 360) + 360) % 360) - 180
    if (lng === -180 && lngLat.lng > 0) lng = 180
  }
  return { latitude: round4(lngLat.lat), longitude: round4(lng) }
}
