import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import ComparePage from './ComparePage'
import * as service from '../services/weatherService'
import type { CurrentWeather, Forecast, SavedLocation } from '../types/weather'

vi.mock('../services/weatherService')

const place = (i: number, name?: string): SavedLocation => ({
  id: `${i},${i}`, name, latitude: i, longitude: i,
})
const rome = place(1, 'Rome')
const paris = place(2, 'Paris')
const athens = place(3, 'Athens')
const many = [rome, paris, athens, place(4, 'Tokyo'), place(5, 'Lima'), place(6, 'Oslo')]

const weatherFor = (latitude: number): CurrentWeather => ({
  time: 't', temperature: latitude * 10, feelsLike: 1, humidity: 50, precipitation: 0,
  weatherCode: 3, cloudCover: 10, pressure: 1000, windSpeed: 5, windDirection: 0, isDay: true,
})
const forecastFor = (latitude: number): Forecast => ({
  hourly: Array.from({ length: 24 }, (_, h) => ({
    time: `2026-11-20T${String(h).padStart(2, '0')}:00`,
    temperature: latitude * 10 + h, precipitationProbability: 0, weatherCode: 0,
  })),
  daily: Array.from({ length: 7 }, (_, d) => ({
    date: `2026-11-${20 + d}`, weatherCode: 0, tempMax: latitude * 10 + d, tempMin: 0,
    precipitationSum: 0, precipitationProbability: 0,
  })),
})

function seed(locations: SavedLocation[]) {
  localStorage.setItem('weather-explorer:saved-locations', JSON.stringify(locations))
}

function Probe() {
  return <output data-testid="search">{useLocation().search}</output>
}

function renderPage(route = '/compare') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <ComparePage />
        <Probe />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
// The charts also contain (collapsed) data tables, so always scope to the comparison table.
const compareTable = () => screen.getByRole('table', { name: /current weather comparison/i })
const query = (...ids: string[]) =>
  '/compare?' + new URLSearchParams(ids.map((id) => ['loc', id])).toString()

describe('ComparePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(service.fetchCurrentWeather).mockImplementation(async ({ latitude }) => weatherFor(latitude))
    vi.mocked(service.fetchForecast).mockImplementation(async ({ latitude }) => forecastFor(latitude))
  })

  it('has a heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /compare locations/i })).toBeInTheDocument()
  })

  it('explains what to do when nothing is saved, and links back to the map', () => {
    renderPage()
    expect(screen.getByText(/save at least 2 locations/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /map/i })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('also asks for more when only one location is saved', () => {
    seed([rome])
    renderPage()
    expect(screen.getByText(/save at least 2 locations/i)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('prompts to select 2 to 5 locations, without fetching anything yet', () => {
    seed([rome, paris])
    renderPage()
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    expect(screen.getByText(/select 2 to 5 locations/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(service.fetchCurrentWeather).not.toHaveBeenCalled()
  })

  it('still waits when only one is selected', async () => {
    seed([rome, paris])
    renderPage()
    await userEvent.click(screen.getByRole('checkbox', { name: /rome/i }))
    expect(screen.getByText(/select 2 to 5 locations/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(service.fetchCurrentWeather).not.toHaveBeenCalled()
  })

  it('shows the table and both charts once two locations are selected', async () => {
    seed([rome, paris])
    renderPage()

    await userEvent.click(screen.getByRole('checkbox', { name: /rome/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /paris/i }))

    const table = await screen.findByRole('table', { name: /current weather comparison/i })
    expect(within(table).getAllByRole('row')).toHaveLength(3)
    expect(await within(table).findByText('10 °C')).toBeInTheDocument() // Rome
    expect(within(table).getByText('20 °C')).toBeInTheDocument() // Paris
    expect(await screen.findByRole('heading', { name: /next 24 hours/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /7-day highs/i })).toBeInTheDocument()
  })

  it('stores the selection in the URL', async () => {
    seed([rome, paris])
    renderPage()
    await userEvent.click(screen.getByRole('checkbox', { name: /rome/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /paris/i }))
    expect(screen.getByTestId('search')).toHaveTextContent(query('1,1', '2,2').slice('/compare'.length))
  })

  it('restores the selection from the URL', async () => {
    seed([rome, paris, athens])
    renderPage(query('1,1', '3,3'))

    expect(screen.getByRole('checkbox', { name: /rome/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /athens/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /paris/i })).not.toBeChecked()
    const table = await screen.findByRole('table', { name: /current weather comparison/i })
    expect(within(table).getAllByRole('row')).toHaveLength(3)
  })

  it('ignores ids in the URL that are no longer saved', async () => {
    seed([rome, paris])
    renderPage(query('999,999', '1,1', '2,2'))
    const table = await screen.findByRole('table', { name: /current weather comparison/i })
    expect(within(table).getAllByRole('row')).toHaveLength(3)
  })

  it('caps the selection at 5 locations', async () => {
    seed(many)
    renderPage(query('1,1', '2,2', '3,3', '4,4'))
    await userEvent.click(screen.getByRole('checkbox', { name: /lima/i }))

    expect(screen.getByRole('checkbox', { name: /oslo/i })).toBeDisabled()
    expect(screen.getByText(/maximum of 5/i)).toBeInTheDocument()
    await waitFor(() =>
      expect(within(compareTable()).getAllByRole('row')).toHaveLength(6),
    )
  })

  it('removing a selection down to one hides the comparison again', async () => {
    seed([rome, paris])
    renderPage(query('1,1', '2,2'))
    await screen.findByRole('table', { name: /current weather comparison/i })
    await userEvent.click(screen.getByRole('checkbox', { name: /paris/i }))
    expect(screen.queryByRole('table', { name: /current weather comparison/i })).not.toBeInTheDocument()
  })

  it('shows an error row for a location that fails, keeping the rest', async () => {
    seed([rome, paris])
    vi.mocked(service.fetchCurrentWeather).mockImplementation(async ({ latitude }) => {
      if (latitude === 1) throw new Error('boom')
      return weatherFor(latitude)
    })
    renderPage(query('1,1', '2,2'))

    expect(await screen.findByText(/could not load weather/i)).toBeInTheDocument()
    expect(await within(compareTable()).findByText('20 °C')).toBeInTheDocument()
  })
})
