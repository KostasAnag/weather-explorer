import { render } from '@testing-library/react'
import { WorldMap } from './WorldMap'

// Capture the registered handlers on a fake MapLibre map.
const handlers: Record<string, (e: unknown) => void> = {}
const remove = vi.fn()
const queryRenderedFeatures = vi.fn()

vi.mock('maplibre-gl', () => ({
  Map: vi.fn().mockImplementation(function () {
    return {
      on: (type: string, fn: (e: unknown) => void) => {
        handlers[type] = fn
      },
      addControl: vi.fn(),
      queryRenderedFeatures,
      remove,
    }
  }),
  NavigationControl: vi.fn(),
  Marker: vi.fn().mockImplementation(function () {
    return { setLngLat: vi.fn().mockReturnThis(), addTo: vi.fn().mockReturnThis(), remove: vi.fn() }
  }),
}))

const click = { lngLat: { lng: 2.36, lat: 48.85 }, point: { x: 100, y: 120 } }

describe('WorldMap', () => {
  beforeEach(() => queryRenderedFeatures.mockReset())

  it('reports clicked coordinates when no city is under the cursor', () => {
    queryRenderedFeatures.mockReturnValue([])
    const onSelect = vi.fn()
    render(<WorldMap selected={null} onSelect={onSelect} />)

    handlers.click(click)

    expect(onSelect).toHaveBeenCalledWith({ latitude: 48.85, longitude: 2.36 })
  })

  it('snaps to the city (name + exact point) when a city label is clicked', () => {
    queryRenderedFeatures.mockReturnValue([
      {
        sourceLayer: 'place',
        properties: { name: 'Paris', class: 'city' },
        geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
      },
    ])
    const onSelect = vi.fn()
    render(<WorldMap selected={null} onSelect={onSelect} />)

    handlers.click(click)

    expect(onSelect).toHaveBeenCalledWith({
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
    })
  })

  it('destroys the map on unmount', () => {
    const { unmount } = render(<WorldMap selected={null} onSelect={vi.fn()} />)
    unmount()
    expect(remove).toHaveBeenCalled()
  })
})
