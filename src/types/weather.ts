export interface Coordinates {
  latitude: number
  longitude: number
}

/** Shape of the `current` block returned by Open-Meteo. */
export interface OpenMeteoCurrent {
  time: string
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  precipitation: number
  weather_code: number
  cloud_cover: number
  pressure_msl: number
  wind_speed_10m: number
  wind_direction_10m: number
  is_day: 0 | 1
}

export interface OpenMeteoForecastResponse {
  latitude: number
  longitude: number
  current: OpenMeteoCurrent
}

/** Application-level model: what the UI consumes. */
export interface CurrentWeather {
  time: string
  temperature: number
  feelsLike: number
  humidity: number
  precipitation: number
  weatherCode: number
  cloudCover: number
  pressure: number
  windSpeed: number
  windDirection: number
  isDay: boolean
}

/** A location the user picked on the map. `name` is only set for clicked cities. */
export interface SelectedLocation extends Coordinates {
  name?: string
}

/** Open-Meteo returns hourly/daily data as parallel arrays (one array per variable). */
export interface OpenMeteoHourly {
  time: string[]
  temperature_2m: number[]
  precipitation_probability: number[]
  weather_code: number[]
}

export interface OpenMeteoDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
}

export interface OpenMeteoFullForecastResponse {
  latitude: number
  longitude: number
  hourly: OpenMeteoHourly
  daily: OpenMeteoDaily
}

export interface HourlyForecastPoint {
  time: string
  temperature: number
  precipitationProbability: number
  weatherCode: number
}

export interface DailyForecastDay {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipitationSum: number
  precipitationProbability: number
}

export interface Forecast {
  hourly: HourlyForecastPoint[]
  daily: DailyForecastDay[]
}

/** What we persist: the place only. Weather is always fetched fresh. */
export interface SavedLocation extends Coordinates {
  id: string
  name?: string
}

/** One match from the Open-Meteo Geocoding API (forward geocoding: name -> coordinates). */
export interface PlaceSuggestion extends Coordinates {
  id: number
  name: string
  admin1?: string // region/state, helps tell same-named cities apart
  country?: string
}

export interface OpenMeteoGeocodingResponse {
  // The API omits `results` entirely when nothing matches.
  results?: Array<PlaceSuggestion & Record<string, unknown>>
}

/** What the map draws for one place: a small temperature badge. */
export interface MapBadge extends Coordinates {
  id: string
  label: string
  /** Weather fields are missing while that location's weather is still loading. */
  temperature?: number
  weatherCode?: number
  isDay?: boolean
  selected: boolean
}

/** One compared location with whatever has loaded so far. */
export interface ComparisonEntry {
  location: SavedLocation
  weather?: CurrentWeather
  forecast?: Forecast
  weatherError: boolean
  forecastError: boolean
}
