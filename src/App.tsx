import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ForecastPanel } from './components/ForecastPanel'
import { LocateButton } from './components/LocateButton'
import { SaveLocationButton } from './components/SaveLocationButton'
import { SavedLocationsList } from './components/SavedLocationsList'
import { WeatherPanel } from './components/WeatherPanel'
import { WorldMap } from './components/WorldMap'
import { useCurrentWeather } from './hooks/useCurrentWeather'
import { useForecast } from './hooks/useForecast'
import { useGeolocation } from './hooks/useGeolocation'
import { useSavedLocations } from './hooks/useSavedLocations'
import { locationId } from './lib/locations'
import type { Coordinates, SavedLocation, SelectedLocation } from './types/weather'

export default function App() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<SelectedLocation | null>(null)
  // Where the map should fly to. Always set with a fresh object so repeats re-trigger.
  const [focus, setFocus] = useState<Coordinates | null>(null)

  const weather = useCurrentWeather(selected)
  const forecast = useForecast(selected)
  const geolocation = useGeolocation(setFocus)
  const saved = useSavedLocations()

  function revisit(location: SavedLocation) {
    // Cached data may still count as fresh; a revisit must always re-request it.
    for (const key of ['currentWeather', 'forecast']) {
      queryClient.invalidateQueries({ queryKey: [key, location.latitude, location.longitude] })
    }
    setSelected(location)
    setFocus({ latitude: location.latitude, longitude: location.longitude })
  }

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
          <SavedLocationsList
            locations={saved.locations}
            selectedId={selected ? locationId(selected) : null}
            onSelect={revisit}
            onRemove={saved.remove}
          />
          <WeatherPanel
            coordinates={selected}
            weather={weather.data}
            isLoading={weather.isLoading}
            error={weather.error}
          >
            {selected && (
              <SaveLocationButton
                isSaved={saved.isSaved(selected)}
                onSave={() => saved.add(selected)}
              />
            )}
          </WeatherPanel>
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
