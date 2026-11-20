import { render, screen, within } from '@testing-library/react'
import { ComparisonTable } from './ComparisonTable'
import type { ComparisonEntry, CurrentWeather } from '../types/weather'

const weather: CurrentWeather = {
  time: 't', temperature: 18.4, feelsLike: 17.1, humidity: 62, precipitation: 0.2,
  weatherCode: 3, cloudCover: 88, pressure: 1015.3, windSpeed: 12.5, windDirection: 270, isDay: true,
}
const base = { forecast: undefined, weatherError: false, forecastError: false }
const rome: ComparisonEntry = {
  ...base, weather, location: { id: 'r', name: 'Rome', latitude: 1, longitude: 2 },
}
const loading: ComparisonEntry = {
  ...base, weather: undefined, location: { id: 'p', name: 'Paris', latitude: 3, longitude: 4 },
}
const failed: ComparisonEntry = {
  ...base, weather: undefined, weatherError: true,
  location: { id: 'a', name: 'Athens', latitude: 5, longitude: 6 },
}

describe('ComparisonTable', () => {
  it('has a column per metric and a row per location', () => {
    render(<ComparisonTable entries={[rome, loading]} />)
    const table = screen.getByRole('table', { name: /current weather comparison/i })
    const headers = within(table).getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual([
      'Location', 'Conditions', 'Temperature', 'Feels like', 'Humidity',
      'Wind', 'Precipitation', 'Cloud cover', 'Pressure',
    ])
    expect(within(table).getAllByRole('row')).toHaveLength(3) // header + 2
  })

  it('shows every current metric with units', () => {
    render(<ComparisonTable entries={[rome]} />)
    const row = screen.getByRole('row', { name: /rome/i })
    for (const text of ['Overcast', '18.4 °C', '17.1 °C', '62 %', '12.5 km/h', '0.2 mm', '88 %', '1015.3 hPa']) {
      expect(within(row).getByText(text)).toBeInTheDocument()
    }
  })

  it('shows placeholders while a location is loading', () => {
    render(<ComparisonTable entries={[loading]} />)
    const row = screen.getByRole('row', { name: /paris/i })
    expect(within(row).getAllByText('…').length).toBeGreaterThan(0)
  })

  it('shows an error message for a location that failed, without hiding the others', () => {
    render(<ComparisonTable entries={[rome, failed]} />)
    expect(screen.getByRole('row', { name: /athens/i })).toHaveTextContent(/could not load weather/i)
    expect(screen.getByRole('row', { name: /rome/i })).toHaveTextContent('18.4 °C')
  })
})
