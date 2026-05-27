import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: '🗺️' },
  { to: '/skills', label: 'Skills', icon: '⚔️' },
  { to: '/daily', label: 'Daily Tasks', icon: '📋' },
  { to: '/phases', label: 'Phase Plan', icon: '🗓️' },
  { to: '/gp', label: 'GP Tracker', icon: '💰' },
]

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#111009]">
      {/* ── Sidebar (desktop) / drawer (mobile) ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-56 flex-shrink-0 flex flex-col
          bg-[#1a1209] border-r border-[#5a4a28]
          transform transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex
        `}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#5a4a28]">
          <button onClick={() => navigate('/overview')} className="flex items-center gap-2 w-full text-left">
            <span className="text-2xl">⚔️</span>
            <div>
              <p className="text-[#c8a951] font-bold text-sm leading-tight">OSRS Max</p>
              <p className="text-[#9b8c60] text-xs">The BrummJob</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#5a4a28] text-[#f0d060]'
                    : 'text-[#9b8c60] hover:bg-[#2c2416] hover:text-[#e8d9a0]'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#5a4a28]">
          <a
            href="/dashboard/"
            className="flex items-center gap-2 text-xs text-[#9b8c60] hover:text-[#c8a951] transition-colors"
          >
            ← Dashboard
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1a1209] border-b border-[#5a4a28] sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-[#9b8c60] hover:text-[#c8a951] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-[#c8a951] font-bold">⚔️ OSRS Max Tracker</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
