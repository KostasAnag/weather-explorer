import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

// Importing the map library would throw: so this file only passes if the
// Explorer page (and MapLibre with it) is NOT loaded when visiting /compare.
vi.mock('maplibre-gl', () => {
  throw new Error('The map chunk must not be loaded on /compare')
})

// Kept in its own file: React.lazy caches after the first load, so the loading
// state is only observable on a page's very first render.
describe('route code splitting', () => {
  it('shows a loading state, then the compare page, without loading the map', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/compare']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i)
    expect(await screen.findByRole('heading', { name: /compare locations/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Weather explorer' })).toBeInTheDocument()
  })
})
