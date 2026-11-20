import { COMPARE_COLORS } from '../lib/compareData'
import { locationLabel } from '../lib/locations'
import { describeWeatherCode } from '../lib/weatherCodes'
import type { ComparisonEntry } from '../types/weather'

const COLUMNS = [
  'Location', 'Conditions', 'Temperature', 'Feels like', 'Humidity',
  'Wind', 'Precipitation', 'Cloud cover', 'Pressure',
]

export function ComparisonTable({ entries }: { entries: ComparisonEntry[] }) {
  return (
    <div className="table-scroll">
      <table className="compare-table" aria-label="Current weather comparison">
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const { weather } = entry
            return (
              <tr key={entry.location.id}>
                <th scope="row">
                  <span className="swatch" style={{ background: COMPARE_COLORS[i] }} aria-hidden="true" />
                  {locationLabel(entry.location)}
                </th>
                {weather ? (
                  <>
                    <td>{describeWeatherCode(weather.weatherCode)}</td>
                    <td>{weather.temperature} °C</td>
                    <td>{weather.feelsLike} °C</td>
                    <td>{weather.humidity} %</td>
                    <td>{weather.windSpeed} km/h</td>
                    <td>{weather.precipitation} mm</td>
                    <td>{weather.cloudCover} %</td>
                    <td>{weather.pressure} hPa</td>
                  </>
                ) : entry.weatherError ? (
                  <td colSpan={COLUMNS.length - 1} role="alert">
                    Could not load weather.
                  </td>
                ) : (
                  Array.from({ length: COLUMNS.length - 1 }, (_, c) => <td key={c}>…</td>)
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
