import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { normalizeLngLat } from '../lib/coordinates'
import { findPlace, type MapFeatureLike } from '../lib/places'
import type { Coordinates, SelectedLocation } from '../types/weather'

interface WorldMapProps {
  selected: SelectedLocation | null
  /** When set, the map flies here. It does not select a location. */
  focus?: Coordinates | null
  onSelect: (location: SelectedLocation) => void
}

export function WorldMap({ selected, focus = null, onSelect }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  // Keep the latest callback without re-creating the map when it changes.
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
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

  // Keep a marker in sync with the selected location.
  useEffect(() => {
    markerRef.current?.remove()
    markerRef.current = null
    if (selected && mapRef.current) {
      markerRef.current = new maplibregl.Marker()
        .setLngLat([selected.longitude, selected.latitude])
        .addTo(mapRef.current)
    }
  }, [selected])

  // Fly to the focus point (e.g. the user's position).
  useEffect(() => {
    if (focus && mapRef.current) {
      mapRef.current.flyTo({ center: [focus.longitude, focus.latitude], zoom: 10 })
    }
  }, [focus])

  return <div ref={containerRef} className="map" data-testid="map" />
}
