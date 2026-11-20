import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SaveLocationButton } from './SaveLocationButton'

describe('SaveLocationButton', () => {
  it('saves when clicked', async () => {
    const onSave = vi.fn()
    render(<SaveLocationButton isSaved={false} onSave={onSave} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save location' }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('shows "Saved" and is disabled when already saved (no duplicates)', () => {
    render(<SaveLocationButton isSaved onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: /saved/i })).toBeDisabled()
  })
})
