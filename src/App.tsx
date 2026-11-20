import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import NotFoundPage from './pages/NotFoundPage'

// Each heavy page is its own chunk: MapLibre only loads for the map page,
// Recharts only for the compare page.
const ExplorerPage = lazy(() => import('./pages/ExplorerPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))

/** App shell: title + navigation stay put, the route decides what fills the page. */
export default function App() {
  return (
    <div className="page">
      <header className="topbar">
        <h1>Weather explorer</h1>
        <nav aria-label="Main">
          <NavLink to="/" end>
            Map
          </NavLink>
          <NavLink to="/compare">Compare</NavLink>
        </nav>
      </header>
      <Suspense fallback={<p role="status" className="route loading">Loading…</p>}>
        <Routes>
          <Route path="/" element={<ExplorerPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}
