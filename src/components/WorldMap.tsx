import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { normalizeLngLat } from '../lib/coordinates'
import { findPlace, type MapFeatureLike } from '../lib/places'
import { describeWeatherCode } from '../lib/weatherCodes'
import { weatherIcon } from '../lib/weatherIcons'
import type { Coordinates, MapBadge, SelectedLocation } from '../types/weather'

interface WorldMapProps {
  /** Weather badges to draw: saved places and the current selection. */
  badges: MapBadge[]
  onBadgeClick?: (id: string) => void
  /** When set, the map flies here. It does not select a location. */
  focus?: Coordinates | null
  onSelect: (location: SelectedLocation) => void
}

/** Plain DOM badge (a real <button>, so it is keyboard- and screen-reader-friendly). */
function createBadgeElement(badge: MapBadge, onClick: () => void): HTMLButtonElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = badge.selected ? 'map-badge selected' : 'map-badge'
  if (badge.temperature === undefined || badge.weatherCode === undefined) {
    el.textContent = '…'
    el.setAttribute('aria-label', `${badge.label}: loading weather`)
  } else {
    const temp = Math.round(badge.temperature) || 0 // `|| 0` turns -0 into 0
    el.textContent = `${weatherIcon(badge.weatherCode, badge.isDay ?? true)} ${temp}°`
    el.setAttribute(
      'aria-label',
      `${badge.label}: ${temp}°C, ${describeWeatherCode(badge.weatherCode)}`,
    )
  }
  el.addEventListener('click', onClick)
  return el
}

export function WorldMap({ badges, onBadgeClick, focus = null, onSelect }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  // Keep the latest callback without re-creating the map when it changes.
  const onSelectRef = useRef(onSelect)
  const onBadgeClickRef = useRef(onBadgeClick)
  const badgesRef = useRef(badges)
  useEffect(() => {
    onSelectRef.current = onSelect
    onBadgeClickRef.current = onBadgeClick
    badgesRef.current = badges
  })

  // Create the map once; destroy it on unmount.
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      // Vector style (no API key): city labels are real features we can click.
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [0, 20],
      zoom: 2,
    })
    map.addControl(new maplibregl.NavigationControl())
    map.on('click', (e) => {
      // A click on a weather badge belongs to the badge, not to the map point beneath it.
      if ((e.originalEvent?.target as Element | null)?.closest?.('.map-badge')) return
      // Look for a city label within a few pixels of the click.
      const { x, y } = e.point
      const features = map.queryRenderedFeatures([
        [x - 10, y - 10],
        [x + 10, y + 10],
      ]) as MapFeatureLike[]
      onSelectRef.current(findPlace(features) ?? normalizeLngLat(e.lngLat))
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Redraw badge markers whenever their content changes. The JSON key (not the array
  // identity) is the dependency, so an equal-but-new array does not rebuild the DOM.
  const badgesKey = JSON.stringify(badges)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const markers = badgesRef.current.map((badge) =>
      new maplibregl.Marker({
        element: createBadgeElement(badge, () => onBadgeClickRef.current?.(badge.id)),
        anchor: 'bottom',
      })
        .setLngLat([badge.longitude, badge.latitude])
        .addTo(map),
    )
    return () => markers.forEach((marker) => marker.remove())
  }, [badgesKey])

  // Fly to the focus point (e.g. the user's position).
  useEffect(() => {
    if (focus && mapRef.current) {
      mapRef.current.flyTo({ center: [focus.longitude, focus.latitude], zoom: 10 })
    }
  }, [focus])

  return <div ref={containerRef} className="map" data-testid="map" />
}
