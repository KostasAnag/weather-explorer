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
