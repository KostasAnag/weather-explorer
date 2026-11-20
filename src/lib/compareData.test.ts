import {
  buildDailyChartData,
  buildHourlyChartData,
  buildSeries,
  COMPARE_COLORS,
  formatHoursAhead,
  MAX_COMPARE,
  MIN_COMPARE,
} from './compareData'
import type { ComparisonEntry } from '../types/weather'

function entry(
  i: number,
  label: string | undefined,
  opts: { temps?: number[]; highs?: number[] } = {},
): ComparisonEntry {
  const { temps, highs } = opts
  return {
    location: { id: `id${i}`, name: label, latitude: i, longitude: i },
    weather: undefined,
    forecast:
      temps || highs
        ? {
            hourly: (temps ?? []).map((t, h) => ({
              time: `2026-11-20T${String(h).padStart(2, '0')}:00`,
              temperature: t, precipitationProbability: 0, weatherCode: 0,
            })),
            daily: (highs ?? []).map((m, d) => ({
              date: `2026-11-${20 + d}`, weatherCode: 0, tempMax: m, tempMin: 0,
              precipitationSum: 0, precipitationProbability: 0,
            })),
          }
        : undefined,
    weatherError: false,
    forecastError: false,
  }
}

describe('limits', () => {
  it('compares between 2 and 5 locations', () => {
    expect(MIN_COMPARE).toBe(2)
    expect(MAX_COMPARE).toBe(5)
    expect(COMPARE_COLORS).toHaveLength(5)
  })
})

describe('buildSeries', () => {
  it('uses index-based keys (ids contain dots, which Recharts would read as paths)', () => {
    const series = buildSeries([entry(0, 'Rome', { temps: [1] }), entry(1, 'Paris', { temps: [2] })])
    expect(series.map((s) => s.key)).toEqual(['loc0', 'loc1'])
    expect(series.map((s) => s.label)).toEqual(['Rome', 'Paris'])
    expect(series.map((s) => s.color)).toEqual([COMPARE_COLORS[0], COMPARE_COLORS[1]])
  })

  it('keeps colors tied to the entry position even while another entry has no data yet', () => {
    const series = buildSeries([
      entry(0, 'Rome', { temps: [1] }),
      entry(1, 'Paris'), // forecast still loading
      entry(2, undefined, { temps: [3] }),
    ])
    expect(series.map((s) => s.key)).toEqual(['loc0', 'loc2'])
    expect(series[1].color).toBe(COMPARE_COLORS[2])
    expect(series[1].label).toBe('2, 2') // unnamed -> coordinates
  })
})

describe('buildHourlyChartData', () => {
  it('aligns locations by hours from now (their local clocks differ)', () => {
    const data = buildHourlyChartData([
      entry(0, 'A', { temps: [10, 11, 12] }),
      entry(1, 'B', { temps: [20, 21, 22] }),
    ])
    expect(data).toEqual([
      { hour: 0, loc0: 10, loc1: 20 },
      { hour: 1, loc0: 11, loc1: 21 },
      { hour: 2, loc0: 12, loc1: 22 },
    ])
  })

  it('skips entries without forecast and handles different lengths', () => {
    const data = buildHourlyChartData([
      entry(0, 'A', { temps: [10, 11] }),
      entry(1, 'B'),
      entry(2, 'C', { temps: [30] }),
    ])
    expect(data).toEqual([
      { hour: 0, loc0: 10, loc2: 30 },
      { hour: 1, loc0: 11 },
    ])
  })

  it('returns [] when nothing has loaded', () => {
    expect(buildHourlyChartData([entry(0, 'A')])).toEqual([])
  })
})

describe('buildDailyChartData', () => {
  it('uses day labels (Today, Sat, ...) with each location\'s daily high', () => {
    const data = buildDailyChartData([
      entry(0, 'A', { highs: [20, 21, 22] }),
      entry(1, 'B', { highs: [30, 31, 32] }),
    ])
    expect(data).toEqual([
      { day: 'Today', loc0: 20, loc1: 30 },
      { day: 'Sat', loc0: 21, loc1: 31 },
      { day: 'Sun', loc0: 22, loc1: 32 },
    ])
  })

  it('returns [] when nothing has loaded', () => {
    expect(buildDailyChartData([entry(0, 'A')])).toEqual([])
  })
})

describe('formatHoursAhead', () => {
  it('says "Now" for 0 and "+Nh" afterwards', () => {
    expect(formatHoursAhead(0)).toBe('Now')
    expect(formatHoursAhead(6)).toBe('+6h')
  })
})
