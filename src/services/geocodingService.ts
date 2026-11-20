import axios from 'axios'
import type { OpenMeteoGeocodingResponse, PlaceSuggestion } from '../types/weather'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

/** Forward geocoding only: turns a typed name into candidate places with coordinates. */
export async function searchPlaces(name: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  const { data } = await axios.get<OpenMeteoGeocodingResponse>(GEOCODING_URL, {
    params: { name, count: 5, language: 'en', format: 'json' },
    signal,
  })
  return (data.results ?? []).map(({ id, name, latitude, longitude, admin1, country }) => ({
    id,
    name,
    latitude,
    longitude,
    admin1,
    country,
  }))
}
