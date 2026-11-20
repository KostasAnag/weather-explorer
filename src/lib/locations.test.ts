import { locationId, locationLabel, suggestionLabel, toSavedLocation } from './locations'

describe('locationId', () => {
  it('is built from coordinates rounded to 4 decimals', () => {
    expect(locationId({ latitude: 41.9028, longitude: 12.4964 })).toBe('41.9028,12.4964')
    expect(locationId({ latitude: 41.90281234, longitude: 12.49641999 })).toBe('41.9028,12.4964')
  })
})

describe('toSavedLocation', () => {
  it('keeps only the id, optional name and coordinates', () => {
    expect(
      toSavedLocation({ name: 'Rome', latitude: 41.9028, longitude: 12.4964 }),
    ).toEqual({ id: '41.9028,12.4964', name: 'Rome', latitude: 41.9028, longitude: 12.4964 })
  })

  it('works for unnamed map clicks', () => {
    const saved = toSavedLocation({ latitude: 1, longitude: 2 })
    expect(saved).toEqual({ id: '1,2', latitude: 1, longitude: 2 })
    expect('name' in saved).toBe(false)
  })
})

describe('locationLabel', () => {
  it('prefers the name, falls back to coordinates', () => {
    expect(locationLabel({ name: 'Rome', latitude: 1, longitude: 2 })).toBe('Rome')
    expect(locationLabel({ latitude: 37.9838, longitude: 23.7275 })).toBe('37.9838, 23.7275')
  })
})

describe('suggestionLabel', () => {
  const base = { id: 1, latitude: 0, longitude: 0 }

  it('joins name, region and country to tell same-named places apart', () => {
    expect(suggestionLabel({ ...base, name: 'Athens', admin1: 'Attica', country: 'Greece' })).toBe(
      'Athens, Attica, Greece',
    )
  })

  it('skips missing parts and repeated parts', () => {
    expect(suggestionLabel({ ...base, name: 'Singapore', country: 'Singapore' })).toBe('Singapore')
    expect(suggestionLabel({ ...base, name: 'Monaco' })).toBe('Monaco')
    expect(suggestionLabel({ ...base, name: 'Paris', admin1: 'Paris', country: 'France' })).toBe('Paris, France')
  })
})
