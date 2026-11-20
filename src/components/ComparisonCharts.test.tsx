import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DailyHighsChart, HourlyTemperatureChart } from './ComparisonCharts'
import type { ComparisonEntry } from '../types/weather'

const forecastFor = (offset: number) => ({
  hourly: Array.from({ length: 24 }, (_, h) => ({
    time: `2026-11-20T${String(h).padStart(2, '0')}:00`,
    temperature: offset + h, precipitationProbability: 0, weatherCode: 0,
  })),
  daily: Array.from({ length: 7 }, (_, d) => ({
    date: `2026-11-${20 + d}`, weatherCode: 0, tempMax: offset + d, tempMin: 0,
    precipitationSum: 0, precipitationProbability: 0,
  })),
})
const mk = (i: number, name: string, withForecast = true): ComparisonEntry => ({
  location: { id: `${i},${i}`, name, latitude: i, longitude: i },
  weather: undefined,
  forecast: withForecast ? forecastFor(i * 10) : undefined,
  weatherError: false,
  forecastError: false,
})
const entries = [mk(1, 'Rome'), mk(2, 'Paris')]

describe('HourlyTemperatureChart', () => {
  it('has a heading and a text alternative naming the compared places', () => {
    render(<HourlyTemperatureChart entries={entries} />)
    expect(screen.getByRole('heading', { name: /next 24 hours/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /rome.*paris/i })).toBeInTheDocument()
  })

  it('offers the same data as a table (the color-independent view)', async () => {
    render(<HourlyTemperatureChart entries={entries} />)
    await userEvent.click(screen.getByText(/view data as table/i))
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Hours from now', 'Rome', 'Paris',
    ])
    expect(within(table).getAllByRole('row')).toHaveLength(25) // header + 24 hours
    expect(within(table).getByRole('row', { name: /^Now/ })).toHaveTextContent('10 °C')
    expect(within(table).getByRole('row', { name: /^Now/ })).toHaveTextContent('20 °C')
  })

  it('shows a loading message until some forecast has arrived', () => {
    render(<HourlyTemperatureChart entries={[mk(1, 'Rome', false), mk(2, 'Paris', false)]} />)
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('DailyHighsChart', () => {
  it('has a heading and a text alternative', () => {
    render(<DailyHighsChart entries={entries} />)
    expect(screen.getByRole('heading', { name: /7-day highs/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /rome.*paris/i })).toBeInTheDocument()
  })

  it('offers the daily highs as a table', async () => {
    render(<DailyHighsChart entries={entries} />)
    await userEvent.click(screen.getByText(/view data as table/i))
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(8) // header + 7 days
    expect(within(table).getByRole('row', { name: /^Today/ })).toHaveTextContent('10 °C')
    expect(within(table).getByRole('row', { name: /^Sat/ })).toHaveTextContent('11 °C')
  })
})
