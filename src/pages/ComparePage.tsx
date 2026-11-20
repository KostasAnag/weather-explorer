import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ComparisonTable } from '../components/ComparisonTable'
import { DailyHighsChart, HourlyTemperatureChart } from '../components/ComparisonCharts'
import { LocationPicker } from '../components/LocationPicker'
import { useComparisonData } from '../hooks/useComparisonData'
import { useSavedLocations } from '../hooks/useSavedLocations'
import { MAX_COMPARE, MIN_COMPARE } from '../lib/compareData'

export default function ComparePage() {
  const { locations } = useSavedLocations()
  // The selection lives in the URL (?loc=...&loc=...): survives refresh and can be shared.
  const [params, setParams] = useSearchParams()

  const selected = useMemo(() => {
    const requested = params.getAll('loc')
    // Ignore ids that are no longer saved, and never exceed the maximum.
    return locations.filter((l) => requested.includes(l.id)).slice(0, MAX_COMPARE)
  }, [locations, params])
  const canCompare = selected.length >= MIN_COMPARE
  const entries = useComparisonData(canCompare ? selected : [])

  function toggle(id: string) {
    const ids = selected.map((l) => l.id)
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    setParams(new URLSearchParams(next.map((i) => ['loc', i])), { replace: true })
  }

  return (
    <div className="route compare">
      <h2>Compare locations</h2>
      {locations.length < MIN_COMPARE ? (
        <p>
          Save at least {MIN_COMPARE} locations on the <Link to="/">map</Link> to compare them here.
        </p>
      ) : (
        <>
          <LocationPicker
            locations={locations}
            selectedIds={selected.map((l) => l.id)}
            onToggle={toggle}
          />
          {canCompare ? (
            <>
              <ComparisonTable entries={entries} />
              <div className="charts">
                <HourlyTemperatureChart entries={entries} />
                <DailyHighsChart entries={entries} />
              </div>
            </>
          ) : (
            <p>
              Select {MIN_COMPARE} to {MAX_COMPARE} locations to compare.
            </p>
          )}
        </>
      )}
    </div>
  )
}
