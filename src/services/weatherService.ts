import axios from 'axios'
import type {
  Coordinates,
  CurrentWeather,
  OpenMeteoForecastResponse,
} from '../types/weather'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'is_day',
].join(',')

export async function fetchCurrentWeather({
  latitude,
  longitude,
}: Coordinates): Promise<CurrentWeather> {
  const { data } = await axios.get<OpenMeteoForecastResponse>(FORECAST_URL, {
    params: { latitude, longitude, current: CURRENT_VARIABLES, timezone: 'auto' },
  })
  const c = data.current
  return {
    time: c.time,
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    precipitation: c.precipitation,
    weatherCode: c.weather_code,
    cloudCover: c.cloud_cover,
    pressure: c.pressure_msl,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    isDay: c.is_day === 1,
  }
}
