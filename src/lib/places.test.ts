import { findPlace, type MapFeatureLike } from './places'

const city = (over: Partial<MapFeatureLike> = {}): MapFeatureLike => ({
  sourceLayer: 'place',
  properties: { name: 'Paris', class: 'city' },
  geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
  ...over,
})

describe('findPlace', () => {
  it('returns the name and exact coordinates of a clicked place label', () => {
    expect(findPlace([city()])).toEqual({
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
    })
  })

  it('rounds city coordinates like map clicks (4 decimals)', () => {
    const place = findPlace([
      city({ geometry: { type: 'Point', coordinates: [13.3538818359375, 38.1129479891896] } }),
    ])
    expect(place).toMatchObject({ latitude: 38.1129, longitude: 13.3539 })
  })

  it('ignores features that are not places (roads, water, ...)', () => {
    expect(findPlace([city({ sourceLayer: 'transportation' })])).toBeNull()
  })

  it('ignores places without a name or a point geometry', () => {
    expect(findPlace([city({ properties: {} })])).toBeNull()
    expect(
      findPlace([city({ geometry: { type: 'LineString', coordinates: [] } })]),
    ).toBeNull()
  })

  it('ignores countries, states and oceans: only settlements are cities', () => {
    expect(findPlace([city({ properties: { name: 'France', class: 'country' } })])).toBeNull()
  })

  it('prefers the largest settlement when several overlap', () => {
    const village = city({ properties: { name: 'Tiny', class: 'village' } })
    expect(findPlace([village, city()])?.name).toBe('Paris')
  })

  it('returns null for no features', () => {
    expect(findPlace([])).toBeNull()
  })
})
