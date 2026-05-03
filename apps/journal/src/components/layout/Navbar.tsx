import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 flex-shrink-0">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard/"
              className="text-sm text-gray-500 hover:text-brand-600 transition-colors flex items-center gap-1"
            >
              ← Dashboard
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xl">📓</span>
              <span className="font-display text-lg font-bold text-brand-600">Journal</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-md transition-colors ${isActive ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-500 hover:text-brand-600'}`
              }
            >
              Notes
            </NavLink>
            <NavLink
              to="/tags"
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-md transition-colors ${isActive ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-500 hover:text-brand-600'}`
              }
            >
              Tags
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
