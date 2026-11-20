import { useId, useState, type KeyboardEvent } from 'react'
import { MIN_SEARCH_LENGTH, usePlaceSearch } from '../hooks/usePlaceSearch'
import { suggestionLabel } from '../lib/locations'
import type { PlaceSuggestion } from '../types/weather'

interface SearchBoxProps {
  onSelect: (place: PlaceSuggestion) => void
}

/** Accessible autocomplete (ARIA combobox + listbox pattern). */
export function SearchBox({ onSelect }: SearchBoxProps) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = useId()
  const { results, isLoading, isError } = usePlaceSearch(text)

  const showDropdown = open && text.trim().length >= MIN_SEARCH_LENGTH
  const showList = showDropdown && results.length > 0
  const optionId = (i: number) => `${listId}-option-${i}`

  function choose(place: PlaceSuggestion) {
    setText('')
    setOpen(false)
    setActiveIndex(-1)
    onSelect(place)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (results.length === 0) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((i) => (i + step + results.length) % results.length)
    } else if (e.key === 'Enter' && showList && activeIndex >= 0) {
      e.preventDefault()
      choose(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="search">
      <input
        type="text"
        role="combobox"
        aria-label="Search for a city"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        placeholder="Search for a city…"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
      />
      {showDropdown && (
        <div className="search-dropdown">
          {showList ? (
            <ul id={listId} role="listbox" aria-label="Search results">
              {results.map((place, i) => (
                <li
                  key={place.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === activeIndex}
                  // Prevent the input losing focus (blur would close the list before the click lands).
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(place)}
                >
                  {suggestionLabel(place)}
                </li>
              ))}
            </ul>
          ) : isLoading ? (
            <p role="status">Searching…</p>
          ) : isError ? (
            <p role="alert">Search failed. Please try again.</p>
          ) : (
            <p>No places found.</p>
          )}
        </div>
      )}
    </div>
  )
}
