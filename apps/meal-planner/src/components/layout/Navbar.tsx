import { Link, NavLink } from 'react-router-dom'

const DASHBOARD_URL = 'https://brummer.onrender.com'

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-500 text-white'
        : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
    }`

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a
              href={DASHBOARD_URL}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>←</span>
              <span>Dashboard</span>
            </a>
            <Link to="/recipes" className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="font-display text-xl font-bold text-brand-600">
                Meal Planner
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <NavLink to="/recipes" className={linkClass}>
              Recipes
            </NavLink>
            <NavLink to="/planner" className={linkClass}>
              Planner
            </NavLink>
            <NavLink to="/grocery" className={linkClass}>
              Grocery List
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
