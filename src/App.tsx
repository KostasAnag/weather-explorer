import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { WeatherPanel } from './components/WeatherPanel'
import { WorldMap } from './components/WorldMap'
import { useCurrentWeather } from './hooks/useCurrentWeather'
import type { Coordinates } from './types/weather'

const queryClient = new QueryClient()

function WeatherExplorer() {
  const [selected, setSelected] = useState<Coordinates | null>(null)
  const { data, isLoading, error } = useCurrentWeather(selected)

  return (
    <main className="layout">
      <WorldMap selected={selected} onSelect={setSelected} />
      <WeatherPanel coordinates={selected} weather={data} isLoading={isLoading} error={error} />
    </main>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherExplorer />
    </QueryClientProvider>
  )
}
