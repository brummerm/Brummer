import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const DASHBOARD_URL = '/dashboard/'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-500 text-white'
        : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
    }`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-500 text-white'
        : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
    }`

  const navLinks = [
    { to: '/recipes', label: 'Recipes' },
    { to: '/planner', label: 'Planner' },
    { to: '/grocery', label: 'Grocery List' },
    { to: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a
              href={DASHBOARD_URL}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Hamburger button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current my-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-2 flex flex-col gap-1">
          <a
            href={DASHBOARD_URL}
            className="block px-4 py-2 text-xs text-gray-500 hover:text-brand-600"
          >
            ← Dashboard
          </a>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={mobileLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
