import { render, screen } from '@testing-library/react'
import axios from 'axios'
import App from './App'

const handlers: Record<string, (e: unknown) => void> = {}
let features: unknown[] = []
vi.mock('maplibre-gl', () => ({
  ...{
    Map: vi.fn().mockImplementation(function () {
      return { on: (t: string, fn: (e: unknown) => void) => (handlers[t] = fn), addControl: vi.fn(), queryRenderedFeatures: () => features, remove: vi.fn() }
    }),
    NavigationControl: vi.fn(),
    Marker: vi.fn().mockImplementation(function () {
      return { setLngLat: vi.fn().mockReturnThis(), addTo: vi.fn().mockReturnThis(), remove: vi.fn() }
    }),
  },
}))
vi.mock('axios')

const currentBody = (temp: number, code: number) => ({
  latitude: 0, longitude: 0,
  current: {
    time: '2026-11-20T12:00', temperature_2m: temp, apparent_temperature: 7,
    relative_humidity_2m: 80, precipitation: 1.2, weather_code: code,
    cloud_cover: 100, pressure_msl: 1002, wind_speed_10m: 20,
    wind_direction_10m: 200, is_day: 1,
  },
})
const forecastBody = {
  latitude: 0, longitude: 0,
  hourly: {
    time: ['2026-11-20T12:00', '2026-11-20T13:00'],
    temperature_2m: [9, 10], precipitation_probability: [20, 30], weather_code: [3, 3],
  },
  daily: {
    time: ['2026-11-20', '2026-11-21'], weather_code: [3, 61],
    temperature_2m_max: [12, 13], temperature_2m_min: [4, 5],
    precipitation_sum: [1, 2], precipitation_probability_max: [40, 60],
  },
}
function fakeApi(temp: number, code: number) {
  vi.mocked(axios.get).mockImplementation(async (_url, config) => {
    const params = (config?.params ?? {}) as Record<string, unknown>
    return { data: params.current ? currentBody(temp, code) : forecastBody }
  })
}

describe('App: click map -> fetch -> display weather', () => {
  it('starts empty, then shows weather after a map click', async () => {
    fakeApi(9.5, 63)
    features = []
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Weather explorer' })).toBeInTheDocument()
    expect(screen.getByText(/click on any location to view the weather/i)).toBeInTheDocument()
    expect(screen.getByText(/select a location/i)).toBeInTheDocument()

    handlers.click({ lngLat: { lng: 2.3522, lat: 48.8566 }, point: { x: 1, y: 1 } })

    expect(await screen.findByText('Moderate rain')).toBeInTheDocument()
    expect(screen.getByText('9.5 °C')).toBeInTheDocument()
    // forecast sections appear too
    expect(await screen.findByRole('list', { name: /hourly forecast/i })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /7-day forecast/i })).toBeInTheDocument()
    expect(vi.mocked(axios.get).mock.calls[0][1]?.params as object).toMatchObject({
      latitude: 48.8566,
      longitude: 2.3522,
    })
  })

  it('shows the city name when a city is clicked', async () => {
    fakeApi(15, 0)
    features = [{
      sourceLayer: 'place',
      properties: { name: 'Rome', class: 'city' },
      geometry: { type: 'Point', coordinates: [12.4964, 41.9028] },
    }]
    render(<App />)

    handlers.click({ lngLat: { lng: 12.5, lat: 41.9 }, point: { x: 1, y: 1 } })

    expect(await screen.findByRole('heading', { name: 'Rome' })).toBeInTheDocument()
    expect(vi.mocked(axios.get).mock.calls.at(-1)?.[1]?.params as object).toMatchObject({
      latitude: 41.9028,
      longitude: 12.4964,
    })
  })
})
