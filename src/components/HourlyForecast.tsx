import { formatHour } from '../lib/format'
import type { HourlyForecastPoint } from '../types/weather'

export function HourlyForecast({ hours }: { hours: HourlyForecastPoint[] }) {
  return (
    <section>
      <h3>Next 24 hours</h3>
      <ul className="hourly" aria-label="Hourly forecast">
        {hours.map((h) => (
          <li key={h.time}>
            <span className="hour">{formatHour(h.time)}</span>
            <span className="hour-temp">{h.temperature} °C</span>
            <span className="rain">{h.precipitationProbability} %</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
