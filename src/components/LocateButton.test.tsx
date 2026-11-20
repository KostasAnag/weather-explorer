import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocateButton } from './LocateButton'

describe('LocateButton', () => {
  it('calls onLocate when clicked', async () => {
    const onLocate = vi.fn()
    render(<LocateButton state={{ status: 'idle' }} onLocate={onLocate} />)
    await userEvent.click(screen.getByRole('button', { name: /use my location/i }))
    expect(onLocate).toHaveBeenCalledTimes(1)
  })

  it('is disabled and says "Locating…" while loading', () => {
    render(<LocateButton state={{ status: 'loading' }} onLocate={vi.fn()} />)
    expect(screen.getByRole('button', { name: /locating/i })).toBeDisabled()
  })

  it.each([
    ['denied', /permission was denied/i],
    ['unavailable', /could not be determined/i],
    ['timeout', /timed out/i],
    ['unsupported', /not supported/i],
  ] as const)('shows a helpful alert for "%s"', (reason, message) => {
    render(<LocateButton state={{ status: 'error', reason }} onLocate={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent(message)
  })

  it('shows no alert when idle or successful', () => {
    const { rerender } = render(<LocateButton state={{ status: 'idle' }} onLocate={vi.fn()} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    rerender(
      <LocateButton
        state={{ status: 'success', coordinates: { latitude: 1, longitude: 2 } }}
        onLocate={vi.fn()}
      />,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
