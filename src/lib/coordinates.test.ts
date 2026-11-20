import { normalizeLngLat } from './coordinates'

describe('normalizeLngLat', () => {
  it('keeps in-range values', () => {
    expect(normalizeLngLat({ lng: 23.7, lat: 37.9 })).toEqual({
      latitude: 37.9,
      longitude: 23.7,
    })
  })

  it('wraps longitudes past the antimeridian (map repeats the world)', () => {
    expect(normalizeLngLat({ lng: 190, lat: 10 }).longitude).toBeCloseTo(-170)
    expect(normalizeLngLat({ lng: -190, lat: 10 }).longitude).toBeCloseTo(170)
    expect(normalizeLngLat({ lng: 540, lat: 0 }).longitude).toBeCloseTo(180)
  })

  it('rounds to 4 decimals (~11 m), enough for weather grids', () => {
    expect(normalizeLngLat({ lng: 1.123456789, lat: 2.987654321 })).toEqual({
      latitude: 2.9877,
      longitude: 1.1235,
    })
  })
})
