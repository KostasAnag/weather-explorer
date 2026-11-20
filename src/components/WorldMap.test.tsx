import { render } from '@testing-library/react'
import { WorldMap } from './WorldMap'

// Capture the registered handlers on a fake MapLibre map.
const handlers: Record<string, (e: unknown) => void> = {}
const remove = vi.fn()
const setLngLat = vi.fn().mockReturnThis()
const markerAddTo = vi.fn().mockReturnThis()
const markerRemove = vi.fn()

vi.mock('maplibre-gl', () => ({
  ...{
    Map: vi.fn().mockImplementation(function () {
      return {
        on: (type: string, fn: (e: unknown) => void) => {
          handlers[type] = fn
        },
        addControl: vi.fn(),
        remove,
      }
    }),
    NavigationControl: vi.fn(),
    Marker: vi.fn().mockImplementation(function () {
      return { setLngLat, addTo: markerAddTo, remove: markerRemove }
    }),
  },
}))

describe('WorldMap', () => {
  it('reports clicked coordinates as latitude/longitude', () => {
    const onSelect = vi.fn()
    render(<WorldMap selected={null} onSelect={onSelect} />)

    handlers.click({ lngLat: { lng: 23.7275, lat: 37.9838 } })

    expect(onSelect).toHaveBeenCalledWith({ latitude: 37.9838, longitude: 23.7275 })
  })

  it('destroys the map on unmount', () => {
    const { unmount } = render(<WorldMap selected={null} onSelect={vi.fn()} />)
    unmount()
    expect(remove).toHaveBeenCalled()
  })
})
