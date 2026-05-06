import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
    }`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
    }`

  const navLinks = [
    { to: '/', label: 'Overview', end: true },
    { to: '/budget', label: 'Budget' },
    { to: '/debt', label: 'Debt' },
    { to: '/savings', label: 'Savings' },
    { to: '/retirement', label: 'Retirement' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="/dashboard/" className="text-xs text-gray-500 hover:text-brand-600 transition-colors hidden sm:block">
              ← Dashboard
            </a>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-display text-xl font-bold text-brand-600">Budget</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
            ))}
          </div>
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current my-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-2 flex flex-col gap-1">
          <a href="/dashboard/" className="block px-4 py-2 text-xs text-gray-500 hover:text-brand-600">← Dashboard</a>
          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={mobileLinkClass} onClick={() => setMenuOpen(false)}>{label}</NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
