/** '2026-11-20T14:00' -> '14:00'. The API already returns the location's local time. */
export function formatHour(isoTime: string): string {
  return isoTime.slice(11, 16)
}

/**
 * '2026-11-21' -> 'Sat'. Noon UTC + a UTC formatter keeps the weekday stable
 * in every viewer timezone (midnight local could slip to the previous day).
 */
export function formatDay(isoDate: string, index: number): string {
  if (index === 0) return 'Today'
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  })
}
