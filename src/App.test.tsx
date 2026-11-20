import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { MemoryRouter } from 'react-router'
import App from './App'

const handlers: Record<string, (e: unknown) => void> = {}
let features: unknown[] = []
const flyTo = vi.fn()
const markers: Array<{ element: HTMLElement; removed: boolean }> = []
vi.mock('maplibre-gl', () => ({
  ...{
    Map: vi.fn().mockImplementation(function () {
      return { on: (t: string, fn: (e: unknown) => void) => (handlers[t] = fn), addControl: vi.fn(), queryRenderedFeatures: () => features, flyTo, remove: vi.fn() }
    }),
    NavigationControl: vi.fn(),
    Marker: vi.fn().mockImplementation(function (options: { element: HTMLElement }) {
      const marker = { element: options.element, removed: false }
      markers.push(marker)
      const api = {
        setLngLat: () => api,
        addTo: () => api,
        remove: () => {
          marker.removed = true
        },
      }
      return api
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
  vi.mocked(axios.get).mockImplementation(async (url, config) => {
    if (String(url).includes('geocoding')) {
      return {
        data: {
          results: [
            { id: 264371, name: 'Athens', latitude: 37.98376, longitude: 23.72784, admin1: 'Attica', country: 'Greece' },
          ],
        },
      }
    }
    const params = (config?.params ?? {}) as Record<string, unknown>
    return { data: params.current ? currentBody(temp, code) : forecastBody }
  })
}

/** Pages are lazy-loaded, so wait until the route's page has actually rendered. */
async function renderApp(route = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  if (route === '/') await screen.findByRole('combobox', { name: /search for a city/i })
  if (route.startsWith('/compare')) await screen.findByRole('heading', { name: /compare locations/i })
  return view
}

const clickMap = (lng: number, lat: number) =>
  act(() => handlers.click({ lngLat: { lng, lat }, point: { x: 1, y: 1 } }))

const rome = {
  sourceLayer: 'place',
  properties: { name: 'Rome', class: 'city' },
  geometry: { type: 'Point', coordinates: [12.4964, 41.9028] },
}

describe('App: click map -> fetch -> display weather', () => {
  it('starts empty, then shows weather after a map click', async () => {
    fakeApi(9.5, 63)
    features = []
    await renderApp()
    expect(screen.getByRole('heading', { level: 1, name: 'Weather explorer' })).toBeInTheDocument()
    expect(screen.getByText(/search for a city or click anywhere on the map/i)).toBeInTheDocument()
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
    await renderApp()

    handlers.click({ lngLat: { lng: 12.5, lat: 41.9 }, point: { x: 1, y: 1 } })

    expect(await screen.findByRole('heading', { name: 'Rome' })).toBeInTheDocument()
    expect(vi.mocked(axios.get).mock.calls.at(-1)?.[1]?.params as object).toMatchObject({
      latitude: 41.9028,
      longitude: 12.4964,
    })
  })

  it('selects the exact user position: flies there and shows its weather (no name lookup)', async () => {
    vi.mocked(axios.get).mockReset()
    flyTo.mockClear()
    fakeApi(18, 0)
    features = []
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (ok: (p: GeolocationPosition) => void) =>
          ok({ coords: { latitude: 51.5074, longitude: -0.1278 } } as GeolocationPosition),
      },
    })
    await renderApp()

    await userEvent.click(screen.getByRole('button', { name: /zoom to my location/i }))

    expect(flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [-0.1278, 51.5074] }))
    expect(await screen.findByRole('heading', { name: 'My location' })).toBeInTheDocument()
    expect(screen.getByText('51.5074, -0.1278')).toBeInTheDocument()
    expect(await screen.findByText('18 °C')).toBeInTheDocument()
    expect(await screen.findByRole('list', { name: /7-day forecast/i })).toBeInTheDocument()

    // Only forecast requests, by exact coordinates: no geocoding of any kind.
    const calls = vi.mocked(axios.get).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    for (const [url, config] of calls) {
      expect(String(url)).toBe('https://api.open-meteo.com/v1/forecast')
      expect(config?.params).toMatchObject({ latitude: 51.5074, longitude: -0.1278 })
    }
    vi.unstubAllGlobals()
  })
})

describe('App: saved locations', () => {
  async function selectAndSaveRome() {
    features = [rome]
    clickMap(12.5, 41.9)
    await screen.findByRole('heading', { name: 'Rome' })
    await userEvent.click(screen.getByRole('button', { name: 'Save location' }))
  }

  beforeEach(() => {
    vi.mocked(axios.get).mockReset()
    flyTo.mockClear()
    fakeApi(10, 0)
  })

  it('starts with an empty-state message', async () => {
    await renderApp()
    expect(screen.getByText(/no saved locations yet/i)).toBeInTheDocument()
  })

  it('saves the selected place, shows it in the list and stores only location data', async () => {
    await renderApp()
    await selectAndSaveRome()

    const list = screen.getByRole('list', { name: /saved locations/i })
    expect(within(list).getByRole('button', { name: 'Rome' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saved/i })).toBeDisabled()
    expect(JSON.parse(localStorage.getItem('weather-explorer:saved-locations')!)).toEqual([
      { id: '41.9028,12.4964', name: 'Rome', latitude: 41.9028, longitude: 12.4964 },
    ])
  })

  it('restores saved locations after a reload', async () => {
    const first = await renderApp()
    await selectAndSaveRome()
    first.unmount()

    await renderApp()
    expect(screen.getByRole('button', { name: 'Rome' })).toBeInTheDocument()
  })

  it('removes a saved location', async () => {
    await renderApp()
    await selectAndSaveRome()
    await userEvent.click(screen.getByRole('button', { name: 'Remove Rome' }))
    expect(screen.getByText(/no saved locations yet/i)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('weather-explorer:saved-locations')!)).toEqual([])
  })

  it('revisiting a saved place flies there and fetches fresh weather', async () => {
    await renderApp()
    await selectAndSaveRome()
    await screen.findByRole('list', { name: /hourly forecast/i })
    const romeCalls = () =>
      vi.mocked(axios.get).mock.calls.filter(
        ([, c]) => (c?.params as { latitude: number }).latitude === 41.9028,
      ).length
    expect(romeCalls()).toBe(2) // current + forecast

    features = []
    clickMap(2.35, 48.85) // select somewhere else
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Rome' })).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Rome' }))

    expect(flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [12.4964, 41.9028] }))
    expect(await screen.findByRole('heading', { name: 'Rome' })).toBeInTheDocument()
    // cached data is still "fresh" for minutes, yet revisiting must re-request it
    await waitFor(() => expect(romeCalls()).toBe(4))
  })
})

describe('App: search by city name', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset()
    flyTo.mockClear()
    fakeApi(21, 0)
  })

  it('autocompletes a city, then shows its weather, forecast and flies the map there', async () => {
    await renderApp()

    await userEvent.type(screen.getByRole('combobox', { name: /search for a city/i }), 'Ath')
    await userEvent.click(await screen.findByRole('option', { name: 'Athens, Attica, Greece' }))

    expect(await screen.findByRole('heading', { name: 'Athens' })).toBeInTheDocument()
    expect(await screen.findByText('21 °C')).toBeInTheDocument()
    expect(await screen.findByRole('list', { name: /7-day forecast/i })).toBeInTheDocument()
    expect(flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [23.7278, 37.9838] }))

    const weatherCall = vi.mocked(axios.get).mock.calls.find(([, c]) => (c?.params as { current?: string })?.current)
    expect(weatherCall?.[1]?.params).toMatchObject({ latitude: 37.9838, longitude: 23.7278 })
  })

  it('lets the user save a searched city', async () => {
    await renderApp()
    await userEvent.type(screen.getByRole('combobox', { name: /search for a city/i }), 'Ath')
    await userEvent.click(await screen.findByRole('option', { name: 'Athens, Attica, Greece' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Save location' }))

    expect(screen.getByRole('list', { name: /saved locations/i })).toHaveTextContent('Athens')
  })
})

describe('App: weather badges on the map', () => {
  const liveBadges = () => markers.filter((m) => !m.removed).map((m) => m.element)
  const badgeTexts = () => liveBadges().map((el) => el.textContent)

  beforeEach(() => {
    vi.mocked(axios.get).mockReset()
    flyTo.mockClear()
    markers.length = 0
    features = []
    fakeApi(10, 0)
  })

  it('shows the selected place as a badge with its temperature', async () => {
    await renderApp()
    expect(liveBadges()).toHaveLength(0)

    clickMap(2.35, 48.85)

    await waitFor(() => expect(badgeTexts()).toEqual(['☀️ 10°']))
    expect(liveBadges()[0]).toHaveClass('selected')
  })

  it('shows saved places on the map right after load, fetching their weather', async () => {
    localStorage.setItem(
      'weather-explorer:saved-locations',
      JSON.stringify([{ id: '41.9028,12.4964', name: 'Rome', latitude: 41.9028, longitude: 12.4964 }]),
    )
    await renderApp()

    await waitFor(() => expect(badgeTexts()).toEqual(['☀️ 10°']))
    expect(liveBadges()[0]).toHaveAttribute('aria-label', expect.stringContaining('Rome'))
    expect(liveBadges()[0]).not.toHaveClass('selected')
  })

  it('keeps a saved place on the map after selecting somewhere else', async () => {
    await renderApp()
    features = [rome]
    clickMap(12.5, 41.9)
    await screen.findByRole('heading', { name: 'Rome' })
    await userEvent.click(screen.getByRole('button', { name: 'Save location' }))

    features = []
    clickMap(2.35, 48.85)

    await waitFor(() => expect(liveBadges()).toHaveLength(2))
    expect(liveBadges().filter((el) => el.classList.contains('selected'))).toHaveLength(1)
  })

  it('clicking a saved badge revisits that place', async () => {
    localStorage.setItem(
      'weather-explorer:saved-locations',
      JSON.stringify([{ id: '41.9028,12.4964', name: 'Rome', latitude: 41.9028, longitude: 12.4964 }]),
    )
    await renderApp()
    await waitFor(() => expect(badgeTexts()).toEqual(['☀️ 10°']))

    await act(async () => liveBadges()[0].click())

    expect(flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [12.4964, 41.9028] }))
    expect(await screen.findByRole('heading', { name: 'Rome' })).toBeInTheDocument()
  })
})

describe('App: routing', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset()
    flyTo.mockClear()
    features = []
    fakeApi(10, 0)
  })

  it('shows the app title and navigation on every page', async () => {
    await renderApp('/compare')
    expect(screen.getByRole('heading', { level: 1, name: 'Weather explorer' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: /main/i })
    expect(within(nav).getByRole('link', { name: 'Map' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Compare' })).toBeInTheDocument()
  })

  it('renders the map page at "/" and the compare page at "/compare"', async () => {
    const { unmount } = await renderApp('/')
    expect(screen.getByRole('combobox', { name: /search for a city/i })).toBeInTheDocument()
    unmount()
    await renderApp('/compare')
    expect(screen.getByRole('heading', { name: /compare locations/i })).toBeInTheDocument()
  })

  it('marks the current page link in the navigation', async () => {
    await renderApp('/compare')
    expect(screen.getByRole('link', { name: 'Compare' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Map' })).not.toHaveAttribute('aria-current')
  })

  it('shows a not-found page for unknown routes', async () => {
    await renderApp('/nope')
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to the map/i })).toHaveAttribute('href', '/')
  })

  it('navigates between pages with the links', async () => {
    await renderApp('/')
    await userEvent.click(screen.getByRole('link', { name: 'Compare' }))
    expect(screen.getByRole('heading', { name: /compare locations/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Map' }))
    expect(screen.getByRole('combobox', { name: /search for a city/i })).toBeInTheDocument()
  })

  it('end to end: save two places on the map, then compare them', async () => {
    await renderApp('/')
    features = [rome]
    clickMap(12.5, 41.9)
    await screen.findByRole('heading', { name: 'Rome' })
    await userEvent.click(screen.getByRole('button', { name: 'Save location' }))

    features = []
    clickMap(2.35, 48.85)
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Rome' })).not.toBeInTheDocument())
    await userEvent.click(await screen.findByRole('button', { name: 'Save location' }))

    await userEvent.click(screen.getByRole('link', { name: 'Compare' }))
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(2)
    await userEvent.click(boxes[0])
    await userEvent.click(boxes[1])

    const table = await screen.findByRole('table', { name: /current weather comparison/i })
    expect(within(table).getAllByRole('row')).toHaveLength(3)
    expect(await within(table).findAllByText('10 °C')).toHaveLength(2)
  })
})
