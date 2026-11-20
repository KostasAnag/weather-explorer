import axios from 'axios'
import { fetchCurrentWeather, fetchForecast } from './weatherService'
import type { OpenMeteoForecastResponse, OpenMeteoFullForecastResponse } from '../types/weather'

vi.mock('axios')
const mockedGet = vi.mocked(axios.get)

const apiResponse: OpenMeteoForecastResponse = {
  latitude: 37.98,
  longitude: 23.72,
  current: {
    time: '2026-11-20T12:00',
    temperature_2m: 18.4,
    apparent_temperature: 17.1,
    relative_humidity_2m: 62,
    precipitation: 0.2,
    weather_code: 3,
    cloud_cover: 88,
    pressure_msl: 1015.3,
    wind_speed_10m: 12.5,
    wind_direction_10m: 270,
    is_day: 1,
  },
}

describe('fetchCurrentWeather', () => {
  beforeEach(() => mockedGet.mockReset())

  it('requests Open-Meteo with latitude/longitude and the current variables', async () => {
    mockedGet.mockResolvedValueOnce({ data: apiResponse })

    await fetchCurrentWeather({ latitude: 37.98, longitude: 23.72 })

    const [url, config] = mockedGet.mock.calls[0]
    const params = config?.params as Record<string, unknown>
    expect(url).toBe('https://api.open-meteo.com/v1/forecast')
    expect(params).toMatchObject({ latitude: 37.98, longitude: 23.72 })
    expect(params.current).toContain('temperature_2m')
    expect(params.current).toContain('apparent_temperature')
    expect(params.current).toContain('pressure_msl')
  })

  it('maps the API response to the app model', async () => {
    mockedGet.mockResolvedValueOnce({ data: apiResponse })

    const weather = await fetchCurrentWeather({ latitude: 1, longitude: 2 })

    expect(weather).toEqual({
      time: '2026-11-20T12:00',
      temperature: 18.4,
      feelsLike: 17.1,
      humidity: 62,
      precipitation: 0.2,
      weatherCode: 3,
      cloudCover: 88,
      pressure: 1015.3,
      windSpeed: 12.5,
      windDirection: 270,
      isDay: true,
    })
  })

  it('propagates network errors so the query can show an error state', async () => {
    mockedGet.mockRejectedValueOnce(new Error('Network Error'))
    await expect(
      fetchCurrentWeather({ latitude: 1, longitude: 2 }),
    ).rejects.toThrow('Network Error')
  })
})

const forecastResponse: OpenMeteoFullForecastResponse = {
  latitude: 1,
  longitude: 2,
  hourly: {
    time: ['2026-11-20T12:00', '2026-11-20T13:00'],
    temperature_2m: [21, 22.5],
    precipitation_probability: [10, 40],
    weather_code: [3, 61],
  },
  daily: {
    time: ['2026-11-20', '2026-11-21'],
    weather_code: [3, 63],
    temperature_2m_max: [21.1, 19],
    temperature_2m_min: [17.3, 15.2],
    precipitation_sum: [0, 4.2],
    precipitation_probability_max: [5, 80],
  },
}

describe('fetchForecast', () => {
  beforeEach(() => mockedGet.mockReset())

  it('requests 24 hourly points and 7 daily points by latitude/longitude', async () => {
    mockedGet.mockResolvedValueOnce({ data: forecastResponse })

    await fetchForecast({ latitude: 37.98, longitude: 23.72 })

    const [url, config] = mockedGet.mock.calls[0]
    const params = config?.params as Record<string, unknown>
    expect(url).toBe('https://api.open-meteo.com/v1/forecast')
    expect(params).toMatchObject({
      latitude: 37.98,
      longitude: 23.72,
      forecast_days: 7,
      forecast_hours: 24,
      timezone: 'auto',
    })
    expect(params.hourly).toContain('precipitation_probability')
    expect(params.daily).toContain('temperature_2m_max')
  })

  it('turns Open-Meteo parallel arrays into arrays of objects', async () => {
    mockedGet.mockResolvedValueOnce({ data: forecastResponse })

    const forecast = await fetchForecast({ latitude: 1, longitude: 2 })

    expect(forecast.hourly).toEqual([
      { time: '2026-11-20T12:00', temperature: 21, precipitationProbability: 10, weatherCode: 3 },
      { time: '2026-11-20T13:00', temperature: 22.5, precipitationProbability: 40, weatherCode: 61 },
    ])
    expect(forecast.daily).toEqual([
      { date: '2026-11-20', weatherCode: 3, tempMax: 21.1, tempMin: 17.3, precipitationSum: 0, precipitationProbability: 5 },
      { date: '2026-11-21', weatherCode: 63, tempMax: 19, tempMin: 15.2, precipitationSum: 4.2, precipitationProbability: 80 },
    ])
  })

  it('propagates network errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('Network Error'))
    await expect(fetchForecast({ latitude: 1, longitude: 2 })).rejects.toThrow('Network Error')
  })
})
