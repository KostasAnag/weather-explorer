import { act, render } from '@testing-library/react'
import { WorldMap } from './WorldMap'
import type { MapBadge } from '../types/weather'

// Capture handlers and markers created on a fake MapLibre map.
const handlers: Record<string, (e: unknown) => void> = {}
const remove = vi.fn()
const queryRenderedFeatures = vi.fn()
const flyTo = vi.fn()

interface FakeMarker {
  options: { element: HTMLElement; anchor?: string }
  lngLat?: [number, number]
  remove: ReturnType<typeof vi.fn>
}
const markers: FakeMarker[] = []

vi.mock('maplibre-gl', () => ({
  Map: vi.fn().mockImplementation(function () {
    return {
      on: (type: string, fn: (e: unknown) => void) => {
        handlers[type] = fn
      },
      addControl: vi.fn(),
      queryRenderedFeatures,
      flyTo,
      remove,
    }
  }),
  NavigationControl: vi.fn(),
  Marker: vi.fn().mockImplementation(function (options: FakeMarker['options']) {
    const marker: FakeMarker & { setLngLat: unknown; addTo: unknown } = {
      options,
      remove: vi.fn(),
      setLngLat(lngLat: [number, number]) {
        marker.lngLat = lngLat
        return marker
      },
      addTo: () => marker,
    }
    markers.push(marker)
    return marker
  }),
}))

const click = { lngLat: { lng: 2.36, lat: 48.85 }, point: { x: 100, y: 120 } }

const rome: MapBadge = {
  id: 'rome', latitude: 41.9, longitude: 12.5, label: 'Rome',
  temperature: 18.4, weatherCode: 3, isDay: true, selected: false,
}
const athens: MapBadge = { id: 'athens', latitude: 37.98, longitude: 23.72, label: 'Athens', selected: true }

describe('WorldMap', () => {
  beforeEach(() => {
    queryRenderedFeatures.mockReset()
    flyTo.mockReset()
    markers.length = 0
  })

  it('reports clicked coordinates when no city is under the cursor', () => {
    queryRenderedFeatures.mockReturnValue([])
    const onSelect = vi.fn()
    render(<WorldMap badges={[]} onSelect={onSelect} />)

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
    render(<WorldMap badges={[]} onSelect={onSelect} />)

    handlers.click(click)

    expect(onSelect).toHaveBeenCalledWith({ name: 'Paris', latitude: 48.8566, longitude: 2.3522 })
  })

  it('flies to the focus point (centre + zoom) without selecting anything', () => {
    const onSelect = vi.fn()
    const { rerender } = render(<WorldMap badges={[]} focus={null} onSelect={onSelect} />)
    expect(flyTo).not.toHaveBeenCalled()

    rerender(<WorldMap badges={[]} focus={{ latitude: 37.98, longitude: 23.72 }} onSelect={onSelect} />)

    expect(flyTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [23.72, 37.98], zoom: expect.any(Number) }),
    )
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('destroys the map on unmount', () => {
    const { unmount } = render(<WorldMap badges={[]} onSelect={vi.fn()} />)
    unmount()
    expect(remove).toHaveBeenCalled()
  })

  describe('weather badges', () => {
    it('draws one marker per badge, positioned at its coordinates', () => {
      render(<WorldMap badges={[rome, athens]} onSelect={vi.fn()} />)
      expect(markers).toHaveLength(2)
      expect(markers[0].lngLat).toEqual([12.5, 41.9])
      expect(markers[1].lngLat).toEqual([23.72, 37.98])
    })

    it('shows icon and rounded temperature, with an accessible name', () => {
      render(<WorldMap badges={[rome]} onSelect={vi.fn()} />)
      const el = markers[0].options.element
      expect(el.tagName).toBe('BUTTON')
      expect(el.textContent).toBe('☁️ 18°')
      expect(el.getAttribute('aria-label')).toBe('Rome: 18°C, Overcast')
    })

    it('shows an ellipsis while the weather is loading', () => {
      render(<WorldMap badges={[athens]} onSelect={vi.fn()} />)
      const el = markers[0].options.element
      expect(el.textContent).toBe('…')
      expect(el.getAttribute('aria-label')).toBe('Athens: loading weather')
    })

    it('highlights the selected badge', () => {
      render(<WorldMap badges={[rome, athens]} onSelect={vi.fn()} />)
      expect(markers[0].options.element).not.toHaveClass('selected')
      expect(markers[1].options.element).toHaveClass('selected')
    })

    it('never renders "-0°" for slightly negative temperatures', () => {
      render(<WorldMap badges={[{ ...rome, temperature: -0.3 }]} onSelect={vi.fn()} />)
      expect(markers[0].options.element.textContent).toBe('☁️ 0°')
    })

    it('replaces markers when the badges change', () => {
      const { rerender } = render(<WorldMap badges={[rome]} onSelect={vi.fn()} />)
      rerender(<WorldMap badges={[rome, athens]} onSelect={vi.fn()} />)
      expect(markers[0].remove).toHaveBeenCalled()
      expect(markers.filter((m) => m.remove.mock.calls.length === 0)).toHaveLength(2)
    })

    it('does not rebuild markers when a new array has the same content', () => {
      const { rerender } = render(<WorldMap badges={[rome]} onSelect={vi.fn()} />)
      rerender(<WorldMap badges={[{ ...rome }]} onSelect={vi.fn()} />)
      expect(markers).toHaveLength(1)
      expect(markers[0].remove).not.toHaveBeenCalled()
    })

    it('removes its markers on unmount', () => {
      const { unmount } = render(<WorldMap badges={[rome]} onSelect={vi.fn()} />)
      unmount()
      expect(markers[0].remove).toHaveBeenCalled()
    })

    it('reports a badge click with the badge id', () => {
      const onBadgeClick = vi.fn()
      render(<WorldMap badges={[rome]} onSelect={vi.fn()} onBadgeClick={onBadgeClick} />)
      act(() => markers[0].options.element.click())
      expect(onBadgeClick).toHaveBeenCalledWith('rome')
    })

    it('ignores map clicks that land on a badge, so the point underneath is not selected', () => {
      const onSelect = vi.fn()
      render(<WorldMap badges={[rome]} onSelect={onSelect} />)
      handlers.click({ ...click, originalEvent: { target: markers[0].options.element } })
      expect(onSelect).not.toHaveBeenCalled()
    })
  })
})
