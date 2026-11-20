import { formatDay } from '../lib/format'
import { describeWeatherCode } from '../lib/weatherCodes'
import type { DailyForecastDay } from '../types/weather'

export function DailyForecast({ days }: { days: DailyForecastDay[] }) {
  return (
    <section>
      <h3>7-day forecast</h3>
      <ul className="daily" aria-label="7-day forecast">
        {days.map((d, i) => (
          <li key={d.date}>
            <span className="day">{formatDay(d.date, i)}</span>
            <span className="day-conditions">{describeWeatherCode(d.weatherCode)}</span>
            <span className="rain">{d.precipitationProbability} %</span>
            <span className="range">
              {d.tempMin} °C / {d.tempMax} °C
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
