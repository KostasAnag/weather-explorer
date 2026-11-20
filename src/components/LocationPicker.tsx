import { locationLabel } from '../lib/locations'
import { MAX_COMPARE } from '../lib/compareData'
import type { SavedLocation } from '../types/weather'

interface LocationPickerProps {
  locations: SavedLocation[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export function LocationPicker({ locations, selectedIds, onToggle }: LocationPickerProps) {
  const full = selectedIds.length >= MAX_COMPARE
  return (
    <fieldset className="picker">
      <legend>Locations to compare</legend>
      <ul>
        {locations.map((loc) => {
          const checked = selectedIds.includes(loc.id)
          return (
            <li key={loc.id}>
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  // Once 5 are chosen, only the checked ones stay usable (so they can be unticked).
                  disabled={full && !checked}
                  onChange={() => onToggle(loc.id)}
                />
                {locationLabel(loc)}
                {loc.name && (
                  <span className="picker-coords">
                    {' '}
                    {loc.latitude}, {loc.longitude}
                  </span>
                )}
              </label>
            </li>
          )
        })}
      </ul>
      {full && <p className="picker-note">Maximum of {MAX_COMPARE} locations selected.</p>}
    </fieldset>
  )
}
