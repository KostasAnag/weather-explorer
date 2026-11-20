import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationPicker } from './LocationPicker'
import type { SavedLocation } from '../types/weather'

const mk = (i: number, name?: string): SavedLocation => ({
  id: `${i},${i}`, name, latitude: i, longitude: i,
})
const six = [mk(1, 'Rome'), mk(2, 'Paris'), mk(3, 'Athens'), mk(4, 'Tokyo'), mk(5, 'Lima'), mk(6)]

describe('LocationPicker', () => {
  it('lists saved locations as checkboxes in a labelled group', () => {
    render(<LocationPicker locations={six} selectedIds={[]} onToggle={vi.fn()} />)
    const group = screen.getByRole('group', { name: /locations to compare/i })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(6)
    expect(screen.getByRole('checkbox', { name: /rome/i })).not.toBeChecked()
  })

  it('shows coordinates next to names so same-named places can be told apart', () => {
    render(<LocationPicker locations={[mk(1, 'Rome')]} selectedIds={[]} onToggle={vi.fn()} />)
    expect(screen.getByRole('checkbox', { name: /rome.*1, 1/i })).toBeInTheDocument()
  })

  it('reflects the selection and reports toggles by id', async () => {
    const onToggle = vi.fn()
    render(<LocationPicker locations={six} selectedIds={['2,2']} onToggle={onToggle} />)
    expect(screen.getByRole('checkbox', { name: /paris/i })).toBeChecked()

    await userEvent.click(screen.getByRole('checkbox', { name: /rome/i }))
    expect(onToggle).toHaveBeenCalledWith('1,1')
  })

  it('disables unchecked boxes once 5 are selected, but keeps checked ones usable', () => {
    render(
      <LocationPicker
        locations={six}
        selectedIds={['1,1', '2,2', '3,3', '4,4', '5,5']}
        onToggle={vi.fn()}
      />,
    )
    expect(screen.getByRole('checkbox', { name: /1, 1/i })).toBeEnabled()
    expect(screen.getAllByRole('checkbox').filter((c) => (c as HTMLInputElement).disabled)).toHaveLength(1)
    expect(screen.getByText(/maximum of 5/i)).toBeInTheDocument()
  })
})
