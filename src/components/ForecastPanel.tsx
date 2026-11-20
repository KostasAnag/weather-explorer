import type { Forecast } from '../types/weather'
import { DailyForecast } from './DailyForecast'
import { HourlyForecast } from './HourlyForecast'

interface ForecastPanelProps {
  forecast?: Forecast
  isLoading?: boolean
  error?: Error | null
}

/** Rendered only once a location exists: the empty state lives in WeatherPanel. */
export function ForecastPanel({ forecast, isLoading, error }: ForecastPanelProps) {
  if (isLoading) return <p role="status">Loading forecast…</p>
  if (error) return <p role="alert">Could not load forecast.</p>
  if (!forecast) return null
  return (
    <div className="forecast">
      <HourlyForecast hours={forecast.hourly} />
      <DailyForecast days={forecast.daily} />
    </div>
  )
}
