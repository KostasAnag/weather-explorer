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

describe('App: click map -> fetch -> display weather', () => {
  it('starts empty, then shows weather after a map click', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        latitude: 48.85,
        longitude: 2.35,
        current: {
          time: '2026-11-20T12:00', temperature_2m: 9.5, apparent_temperature: 7,
          relative_humidity_2m: 80, precipitation: 1.2, weather_code: 63,
          cloud_cover: 100, pressure_msl: 1002, wind_speed_10m: 20,
          wind_direction_10m: 200, is_day: 1,
        },
      },
    })
    features = []
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Weather explorer' })).toBeInTheDocument()
    expect(screen.getByText(/click on any location to view the weather/i)).toBeInTheDocument()
    expect(screen.getByText(/select a location/i)).toBeInTheDocument()

    handlers.click({ lngLat: { lng: 2.3522, lat: 48.8566 }, point: { x: 1, y: 1 } })

    expect(await screen.findByText('Moderate rain')).toBeInTheDocument()
    expect(screen.getByText('9.5 °C')).toBeInTheDocument()
    expect(vi.mocked(axios.get).mock.calls[0][1]?.params as object).toMatchObject({
      latitude: 48.8566,
      longitude: 2.3522,
    })
  })

  it('shows the city name when a city is clicked', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        latitude: 41.9, longitude: 12.5,
        current: {
          time: 't', temperature_2m: 15, apparent_temperature: 14,
          relative_humidity_2m: 60, precipitation: 0, weather_code: 0,
          cloud_cover: 0, pressure_msl: 1010, wind_speed_10m: 5,
          wind_direction_10m: 10, is_day: 1,
        },
      },
    })
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
