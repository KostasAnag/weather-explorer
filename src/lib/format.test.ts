import { formatDay, formatHour } from './format'

describe('formatHour', () => {
  it('shows only the local hour of an Open-Meteo timestamp', () => {
    expect(formatHour('2026-11-20T14:00')).toBe('14:00')
    expect(formatHour('2026-11-21T00:00')).toBe('00:00')
  })
})

describe('formatDay', () => {
  it('labels the first day "Today"', () => {
    expect(formatDay('2026-11-20', 0)).toBe('Today')
  })

  it('uses the short weekday name for later days, independent of timezone', () => {
    expect(formatDay('2026-11-21', 1)).toBe('Sat')
    expect(formatDay('2026-11-22', 2)).toBe('Sun')
    expect(formatDay('2026-11-26', 6)).toBe('Thu')
  })
})
