import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ForecastPanel } from './components/ForecastPanel'
import { WeatherPanel } from './components/WeatherPanel'
import { WorldMap } from './components/WorldMap'
import { useCurrentWeather } from './hooks/useCurrentWeather'
import { useForecast } from './hooks/useForecast'
import type { SelectedLocation } from './types/weather'

const queryClient = new QueryClient()

function WeatherExplorer() {
  const [selected, setSelected] = useState<SelectedLocation | null>(null)
  const { data, isLoading, error } = useCurrentWeather(selected)
  const forecast = useForecast(selected)

  return (
    <div className="page">
      <header className="header">
        <h1>Weather explorer</h1>
        <p>Click on any location to view the weather. Click a city name to snap to it.</p>
      </header>
      <main className="layout">
        <WorldMap selected={selected} onSelect={setSelected} />
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
