import axios from 'axios'
import { fetchCurrentWeather } from './weatherService'
import type { OpenMeteoForecastResponse } from '../types/weather'

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
