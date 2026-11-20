import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SavedLocationsList } from './SavedLocationsList'
import type { SavedLocation } from '../types/weather'

const locations: SavedLocation[] = [
  { id: '41.9028,12.4964', name: 'Rome', latitude: 41.9028, longitude: 12.4964 },
  { id: '10,20', latitude: 10, longitude: 20 },
]

describe('SavedLocationsList', () => {
  it('shows an empty state', () => {
    render(<SavedLocationsList locations={[]} onSelect={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText(/no saved locations yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('tells the user they need 2 saved locations to compare, when none are saved', () => {
    render(<SavedLocationsList locations={[]} onSelect={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText(/save at least 2 locations to compare/i)).toBeInTheDocument()
  })

  it('asks for exactly one more when one location is saved', () => {
    render(<SavedLocationsList locations={[locations[0]]} onSelect={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText(/save 1 more location to compare/i)).toBeInTheDocument()
  })

  it('drops the hint once 2 locations are saved', () => {
    render(<SavedLocationsList locations={locations} onSelect={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.queryByText(/to compare/i)).not.toBeInTheDocument()
  })

  it('lists names, falling back to coordinates for unnamed places', () => {
    render(<SavedLocationsList locations={locations} onSelect={vi.fn()} onRemove={vi.fn()} />)
    const items = within(screen.getByRole('list', { name: /saved locations/i })).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Rome')
    expect(items[1]).toHaveTextContent('10, 20')
  })

  it('selects a location when its name is clicked', async () => {
    const onSelect = vi.fn()
    render(<SavedLocationsList locations={locations} onSelect={onSelect} onRemove={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Rome' }))
    expect(onSelect).toHaveBeenCalledWith(locations[0])
  })

  it('removes a location with its remove button', async () => {
    const onRemove = vi.fn()
    render(<SavedLocationsList locations={locations} onSelect={vi.fn()} onRemove={onRemove} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove Rome' }))
    expect(onRemove).toHaveBeenCalledWith('41.9028,12.4964')
  })

  it('marks the currently selected location', () => {
    render(
      <SavedLocationsList
        locations={locations}
        selectedId="10,20"
        onSelect={vi.fn()}
        onRemove={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: '10, 20' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Rome' })).not.toHaveAttribute('aria-current')
  })
})
