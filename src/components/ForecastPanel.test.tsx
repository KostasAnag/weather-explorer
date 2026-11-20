import { render, screen, within } from '@testing-library/react'
import { ForecastPanel } from './ForecastPanel'
import type { Forecast } from '../types/weather'

const hours = Array.from({ length: 24 }, (_, i) => ({
  time: `2026-11-20T${String((12 + i) % 24).padStart(2, '0')}:00`,
  temperature: 20 + i,
  precipitationProbability: i,
  weatherCode: 0,
}))
const days = Array.from({ length: 7 }, (_, i) => ({
  date: `2026-11-${20 + i}`,
  weatherCode: i === 1 ? 63 : 3,
  tempMax: 20 + i,
  tempMin: 10 + i,
  precipitationSum: i,
  precipitationProbability: i * 10,
}))
const forecast: Forecast = { hourly: hours, daily: days }

describe('ForecastPanel', () => {
  it('renders nothing when no location is selected', () => {
    const { container } = render(<ForecastPanel forecast={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a loading state', () => {
    render(<ForecastPanel forecast={undefined} isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent(/loading forecast/i)
  })

  it('shows an error state', () => {
    render(<ForecastPanel forecast={undefined} error={new Error('x')} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/could not load forecast/i)
  })

  it('lists 24 hourly entries with time, temperature and rain chance', () => {
    render(<ForecastPanel forecast={forecast} />)
    const list = screen.getByRole('list', { name: /hourly forecast/i })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(24)
    expect(items[0]).toHaveTextContent('12:00')
    expect(items[0]).toHaveTextContent('20 °C')
    expect(items[1]).toHaveTextContent('13:00')
    expect(items[1]).toHaveTextContent('21 °C')
    expect(items[5]).toHaveTextContent('5 %')
  })

  it('lists 7 daily entries with day, conditions and min/max', () => {
    render(<ForecastPanel forecast={forecast} />)
    const list = screen.getByRole('list', { name: /7-day forecast/i })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(7)
    expect(items[0]).toHaveTextContent('Today')
    expect(items[0]).toHaveTextContent('Overcast')
    expect(items[0]).toHaveTextContent('10 °C')
    expect(items[0]).toHaveTextContent('20 °C')
    expect(items[1]).toHaveTextContent('Sat')
    expect(items[1]).toHaveTextContent('Moderate rain')
    expect(items[1]).toHaveTextContent('10 %')
  })
})
