import { describeWeatherCode } from './weatherCodes'

describe('describeWeatherCode', () => {
  it.each([
    [0, 'Clear sky'],
    [3, 'Overcast'],
    [45, 'Fog'],
    [63, 'Moderate rain'],
    [73, 'Moderate snow'],
    [95, 'Thunderstorm'],
  ])('maps WMO code %i to "%s"', (code, label) => {
    expect(describeWeatherCode(code)).toBe(label)
  })

  it('falls back for unknown codes', () => {
    expect(describeWeatherCode(999)).toBe('Unknown conditions')
  })
})
