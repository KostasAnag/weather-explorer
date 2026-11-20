import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { LocateButton } from './components/LocateButton'
import { ForecastPanel } from './components/ForecastPanel'
import { WeatherPanel } from './components/WeatherPanel'
import { WorldMap } from './components/WorldMap'
import { useCurrentWeather } from './hooks/useCurrentWeather'
import { useForecast } from './hooks/useForecast'
import { useGeolocation } from './hooks/useGeolocation'
import type { SelectedLocation } from './types/weather'

const queryClient = new QueryClient()

function WeatherExplorer() {
  const [selected, setSelected] = useState<SelectedLocation | null>(null)
  const { data, isLoading, error } = useCurrentWeather(selected)
  const forecast = useForecast(selected)
  const geolocation = useGeolocation()
  const focus = geolocation.state.status === 'success' ? geolocation.state.coordinates : null

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Weather explorer</h1>
          <p>Click on any location to view the weather. Click a city name to snap to it.</p>
        </div>
        <LocateButton state={geolocation.state} onLocate={geolocation.locate} />
      </header>
      <main className="layout">
        <WorldMap selected={selected} focus={focus} onSelect={setSelected} />
        <div className="side">
          <WeatherPanel coordinates={selected} weather={data} isLoading={isLoading} error={error} />
          <ForecastPanel
            forecast={forecast.data}
            isLoading={forecast.isLoading}
            error={forecast.error}
          />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherExplorer />
    </QueryClientProvider>
  )
}
