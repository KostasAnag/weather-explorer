import { render, screen } from '@testing-library/react'
import { WeatherPanel } from './WeatherPanel'
import type { CurrentWeather } from '../types/weather'

const weather: CurrentWeather = {
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
}
const coords = { latitude: 37.9838, longitude: 23.7275 }

describe('WeatherPanel', () => {
  it('shows an empty state when nothing is selected', () => {
    render(<WeatherPanel coordinates={null} />)
    expect(screen.getByText(/click anywhere on the map/i)).toBeInTheDocument()
  })

  it('shows a loading state', () => {
    render(<WeatherPanel coordinates={coords} isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
  })

  it('shows an error state', () => {
    render(<WeatherPanel coordinates={coords} error={new Error('x')} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/could not load weather/i)
  })

  it('renders all current metrics and the coordinates', () => {
    render(<WeatherPanel coordinates={coords} weather={weather} />)
    expect(screen.getByText('37.9838, 23.7275')).toBeInTheDocument()
    expect(screen.getByText('Overcast')).toBeInTheDocument()
    expect(screen.getByText('18.4 °C')).toBeInTheDocument()
    expect(screen.getByText(/feels like 17.1 °C/i)).toBeInTheDocument()
    expect(screen.getByText('62 %')).toBeInTheDocument()
    expect(screen.getByText('12.5 km/h')).toBeInTheDocument()
    expect(screen.getByText('0.2 mm')).toBeInTheDocument()
    expect(screen.getByText('88 %')).toBeInTheDocument()
    expect(screen.getByText('1015.3 hPa')).toBeInTheDocument()
  })
})
