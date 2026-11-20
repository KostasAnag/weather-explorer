import axios from 'axios'
import type {
  Coordinates,
  CurrentWeather,
  Forecast,
  OpenMeteoForecastResponse,
  OpenMeteoFullForecastResponse,
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

export async function fetchForecast({
  latitude,
  longitude,
}: Coordinates): Promise<Forecast> {
  const { data } = await axios.get<OpenMeteoFullForecastResponse>(FORECAST_URL, {
    params: {
      latitude,
      longitude,
      hourly: 'temperature_2m,precipitation_probability,weather_code',
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
      forecast_days: 7,
      forecast_hours: 24, // starts at the current hour
      timezone: 'auto',
    },
  })
  const { hourly: h, daily: d } = data
  return {
    // Open-Meteo sends one array per variable; zip them into one object per hour/day.
    hourly: h.time.map((time, i) => ({
      time,
      temperature: h.temperature_2m[i],
      precipitationProbability: h.precipitation_probability[i],
      weatherCode: h.weather_code[i],
    })),
    daily: d.time.map((date, i) => ({
      date,
      weatherCode: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      precipitationSum: d.precipitation_sum[i],
      precipitationProbability: d.precipitation_probability_max[i],
    })),
  }
}
