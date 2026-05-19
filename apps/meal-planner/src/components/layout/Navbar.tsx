import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navLinks = [
    { to: '/planner', label: 'Planner' },
    { to: '/recipes', label: 'Recipes' },
    { to: '/grocery', label: 'Grocery' },
    { to: '/settings', label: 'Settings' },
  ]
  return (
    <nav className="bg-[#0079bf] sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-4">
          <a href="/dashboard/" className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors flex-shrink-0">
            <span>←</span><span className="hidden sm:inline">Dashboard</span>
          </a>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white font-bold text-base flex items-center gap-2 flex-shrink-0">
            <span>🍽️</span><span>Meal Planner</span>
          </span>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`
                }
              >{label}</NavLink>
            ))}
          </div>
          <button className="md:hidden p-2 text-white/80 hover:text-white" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <div className={`w-5 h-0.5 bg-current transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current my-1 transition-all ${open ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-[#026aaa] border-t border-white/10 px-4 py-2 space-y-1">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`
              }
            >{label}</NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
