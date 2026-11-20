import { describeWeatherCode } from '../lib/weatherCodes'
import type { CurrentWeather, SelectedLocation } from '../types/weather'

interface WeatherPanelProps {
  coordinates: SelectedLocation | null
  weather?: CurrentWeather
  isLoading?: boolean
  error?: Error | null
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function WeatherPanel({ coordinates, weather, isLoading, error }: WeatherPanelProps) {
  if (!coordinates) {
    return (
      <aside className="panel">
        <p>Select a location on the map to see its weather here.</p>
      </aside>
    )
  }
  return (
    <aside className="panel">
      {coordinates.name && <h2 className="place">{coordinates.name}</h2>}
      <p className="coords">
        {coordinates.latitude}, {coordinates.longitude}
      </p>
      {isLoading && <p role="status">Loading weather…</p>}
      {error && <p role="alert">Could not load weather. Please try another spot.</p>}
      {weather && (
        <>
          <p className="conditions">{describeWeatherCode(weather.weatherCode)}</p>
          <p className="temp">{weather.temperature} °C</p>
          <p>Feels like {weather.feelsLike} °C</p>
          <dl className="metrics">
            <Metric label="Humidity" value={`${weather.humidity} %`} />
            <Metric label="Wind" value={`${weather.windSpeed} km/h`} />
            <Metric label="Precipitation" value={`${weather.precipitation} mm`} />
            <Metric label="Cloud cover" value={`${weather.cloudCover} %`} />
            <Metric label="Pressure" value={`${weather.pressure} hPa`} />
          </dl>
        </>
      )}
    </aside>
  )
}
