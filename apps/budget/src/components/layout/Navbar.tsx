import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-brand-50 hover:text-brand-700'
    }`

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/dashboard/" className="text-sm text-gray-500 hover:text-brand-600 transition-colors flex items-center gap-1">
              ← Dashboard
            </a>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-display text-xl font-bold text-brand-600">Finance Tracker</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Overview</NavLink>
            <NavLink to="/budget" className={linkClass}>Budget</NavLink>
            <NavLink to="/debt" className={linkClass}>Debt</NavLink>
            <NavLink to="/retirement" className={linkClass}>Retirement</NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
