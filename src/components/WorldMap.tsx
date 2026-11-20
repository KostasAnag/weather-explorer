import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { normalizeLngLat } from '../lib/coordinates'
import type { Coordinates } from '../types/weather'

interface WorldMapProps {
  selected: Coordinates | null
  onSelect: (coordinates: Coordinates) => void
}

export function WorldMap({ selected, onSelect }: WorldMapProps) {
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
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [0, 20],
      zoom: 2,
    })
    map.addControl(new maplibregl.NavigationControl())
    map.on('click', (e) => onSelectRef.current(normalizeLngLat(e.lngLat)))
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

  return <div ref={containerRef} className="map" data-testid="map" />
}
