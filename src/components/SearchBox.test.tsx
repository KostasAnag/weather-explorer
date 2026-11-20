import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBox } from './SearchBox'
import * as service from '../services/geocodingService'
import type { PlaceSuggestion } from '../types/weather'

vi.mock('../services/geocodingService')

const athensGr: PlaceSuggestion = {
  id: 1, name: 'Athens', latitude: 37.98, longitude: 23.72, admin1: 'Attica', country: 'Greece',
}
const athensUs: PlaceSuggestion = {
  id: 2, name: 'Athens', latitude: 33.96, longitude: -83.38, admin1: 'Georgia', country: 'United States',
}

function renderBox(onSelect = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <SearchBox onSelect={onSelect} />
    </QueryClientProvider>,
  )
  return { onSelect, input: screen.getByRole('combobox', { name: /search for a city/i }) }
}

describe('SearchBox', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(service.searchPlaces).mockResolvedValue([athensGr, athensUs])
  })

  it('suggests places while typing, labelled with region and country', async () => {
    const { input } = renderBox()
    await userEvent.type(input, 'Ath')

    const options = await screen.findAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual([
      'Athens, Attica, Greece',
      'Athens, Georgia, United States',
    ])
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects a suggestion with the mouse, clears the box and closes the list', async () => {
    const { input, onSelect } = renderBox()
    await userEvent.type(input, 'Ath')

    await userEvent.click(await screen.findByRole('option', { name: 'Athens, Georgia, United States' }))

    expect(onSelect).toHaveBeenCalledWith(athensUs)
    expect(input).toHaveValue('')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports keyboard selection: ArrowDown + Enter', async () => {
    const { input, onSelect } = renderBox()
    await userEvent.type(input, 'Ath')
    await screen.findAllByRole('option')

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0].id)

    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledWith(athensUs)
  })

  it('closes the list with Escape', async () => {
    const { input } = renderBox()
    await userEvent.type(input, 'Ath')
    await screen.findAllByRole('option')

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not search until 2 characters are typed', async () => {
    const { input } = renderBox()
    await userEvent.type(input, 'A')
    await new Promise((r) => setTimeout(r, 400))
    expect(service.searchPlaces).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows a loading state while searching', async () => {
    vi.mocked(service.searchPlaces).mockReturnValue(new Promise(() => {}))
    const { input } = renderBox()
    await userEvent.type(input, 'Ath')
    expect(await screen.findByRole('status')).toHaveTextContent(/searching/i)
  })

  it('shows an empty state when nothing matches', async () => {
    vi.mocked(service.searchPlaces).mockResolvedValue([])
    const { input } = renderBox()
    await userEvent.type(input, 'zzzz')
    expect(await screen.findByText(/no places found/i)).toBeInTheDocument()
  })

  it('shows an error state when the search fails', async () => {
    vi.mocked(service.searchPlaces).mockRejectedValue(new Error('boom'))
    const { input } = renderBox()
    await userEvent.type(input, 'Ath')
    expect(await screen.findByRole('alert')).toHaveTextContent(/search failed/i)
  })
})
