interface SaveLocationButtonProps {
  isSaved: boolean
  onSave: () => void
}

export function SaveLocationButton({ isSaved, onSave }: SaveLocationButtonProps) {
  return (
    <button type="button" className="save-btn" onClick={onSave} disabled={isSaved}>
      {isSaved ? 'Saved ✓' : 'Save location'}
    </button>
  )
}
