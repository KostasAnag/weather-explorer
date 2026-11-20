import { MIN_COMPARE } from '../lib/compareData'
import { locationLabel } from '../lib/locations'
import type { SavedLocation } from '../types/weather'

interface SavedLocationsListProps {
  locations: SavedLocation[]
  selectedId?: string | null
  onSelect: (location: SavedLocation) => void
  onRemove: (id: string) => void
}

export function SavedLocationsList({
  locations,
  selectedId,
  onSelect,
  onRemove,
}: SavedLocationsListProps) {
  const missing = MIN_COMPARE - locations.length
  return (
    <section className="saved">
      <h2>Saved locations</h2>
      {locations.length === 0 ? (
        <p className="empty">No saved locations yet. Pick a place on the map and press Save.</p>
      ) : (
        <ul aria-label="Saved locations">
          {locations.map((loc) => (
            <li key={loc.id}>
              <button
                type="button"
                className="saved-name"
                aria-current={loc.id === selectedId ? 'true' : undefined}
                onClick={() => onSelect(loc)}
              >
                {locationLabel(loc)}
              </button>
              <button
                type="button"
                className="saved-remove"
                aria-label={`Remove ${locationLabel(loc)}`}
                onClick={() => onRemove(loc.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {missing > 0 && (
        <p className="hint">
          {missing === MIN_COMPARE
            ? `Save at least ${MIN_COMPARE} locations to compare them.`
            : `Save ${missing} more location${missing === 1 ? '' : 's'} to compare them.`}
        </p>
      )}
    </section>
  )
}
