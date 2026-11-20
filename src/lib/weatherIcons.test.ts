import { weatherIcon } from './weatherIcons'

describe('weatherIcon', () => {
  it('uses sun by day and moon by night for clear sky', () => {
    expect(weatherIcon(0, true)).toBe('☀️')
    expect(weatherIcon(0, false)).toBe('🌙')
  })

  it.each([
    [2, '⛅'],
    [3, '☁️'],
    [45, '🌫️'],
    [53, '🌦️'],
    [63, '🌧️'],
    [73, '❄️'],
    [81, '🌦️'],
    [95, '⛈️'],
  ])('maps WMO code %i to %s', (code, icon) => {
    expect(weatherIcon(code, true)).toBe(icon)
  })

  it('falls back for unknown codes', () => {
    expect(weatherIcon(999, true)).toBe('🌡️')
  })
})
