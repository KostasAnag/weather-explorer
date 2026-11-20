import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { WeatherPanel } from './components/WeatherPanel'
import { WorldMap } from './components/WorldMap'
import { useCurrentWeather } from './hooks/useCurrentWeather'
import type { SelectedLocation } from './types/weather'

const queryClient = new QueryClient()

function WeatherExplorer() {
  const [selected, setSelected] = useState<SelectedLocation | null>(null)
  const { data, isLoading, error } = useCurrentWeather(selected)

  return (
    <div className="page">
      <header className="header">
        <h1>Weather explorer</h1>
        <p>Click on any location to view the weather. Click a city name to snap to it.</p>
      </header>
      <main className="layout">
        <WorldMap selected={selected} onSelect={setSelected} />
        <WeatherPanel coordinates={selected} weather={data} isLoading={isLoading} error={error} />
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
