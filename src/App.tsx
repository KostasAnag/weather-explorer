import { NavLink, Route, Routes } from 'react-router'
import ComparePage from './pages/ComparePage'
import ExplorerPage from './pages/ExplorerPage'
import NotFoundPage from './pages/NotFoundPage'

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
      <Routes>
        <Route path="/" element={<ExplorerPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
