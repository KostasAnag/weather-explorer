import type { ComparisonEntry } from '../types/weather'
import { formatDay } from './format'
import { locationLabel } from './locations'

export const MIN_COMPARE = 2
export const MAX_COMPARE = 5

/**
 * Categorical series colors, in fixed order (blue, orange, aqua, yellow, magenta).
 * The first five slots of the validated dataviz palette: CVD-safe for adjacent
 * pairs; a color follows its position in the selection, never its loading state.
 */
export const COMPARE_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'] as const

export interface ChartSeries {
  /** Recharts data key. Index-based on purpose: location ids contain dots/commas. */
  key: string
  label: string
  color: string
}

type ChartRow = Record<string, number | string>

const hasForecast = (entry: ComparisonEntry) => entry.forecast !== undefined

/** One series per entry that already has a forecast; key and color come from its position. */
export function buildSeries(entries: ComparisonEntry[]): ChartSeries[] {
  return entries.flatMap((entry, i) =>
    hasForecast(entry)
      ? [{ key: `loc${i}`, label: locationLabel(entry.location), color: COMPARE_COLORS[i] }]
      : [],
  )
}

/** Temperature for each of the next hours. Aligned by hours-from-now: local clocks differ. */
export function buildHourlyChartData(entries: ComparisonEntry[]): ChartRow[] {
  const rows: ChartRow[] = []
  entries.forEach((entry, i) => {
    entry.forecast?.hourly.forEach((point, hour) => {
      rows[hour] ??= { hour }
      rows[hour][`loc${i}`] = point.temperature
    })
  })
  return rows
}

/** Daily high per location, labelled Today / Sat / Sun... */
export function buildDailyChartData(entries: ComparisonEntry[]): ChartRow[] {
  const rows: ChartRow[] = []
  entries.forEach((entry, i) => {
    entry.forecast?.daily.forEach((day, index) => {
      rows[index] ??= { day: formatDay(day.date, index) }
      rows[index][`loc${i}`] = day.tempMax
    })
  })
  return rows
}

export function formatHoursAhead(hour: number): string {
  return hour === 0 ? 'Now' : `+${hour}h`
}
