import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="route">
      <h2>Page not found</h2>
      <p>
        <Link to="/">Back to the map</Link>
      </p>
    </div>
  )
}
