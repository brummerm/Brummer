import { NavLink, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSpaces, Space } from '../../api/tickets'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

function SpaceIcon({ space }: { space: Space }) {
  return (
    <span
      className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0"
      style={{ backgroundColor: space.color + '30', color: space.color }}
    >
      {space.icon || '📋'}
    </span>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => getSpaces(false),
  })

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <Link
          to="/apps/tickets/"
          onClick={onClose}
          className="flex items-center gap-2 text-gray-900 font-semibold text-base"
        >
          <span className="text-xl">🏠</span>
          <span>Home Tickets</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <NavLink to="/apps/tickets/" end className={navLinkClass} onClick={onClose}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink to="/apps/tickets/calendar" className={navLinkClass} onClick={onClose}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
        </NavLink>

        <NavLink to="/apps/tickets/spaces" className={navLinkClass} onClick={onClose}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          All Spaces
        </NavLink>

        {/* Spaces list */}
        {spaces.length > 0 && (
          <div className="pt-3">
            <p className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Spaces</p>
            <div className="space-y-0.5">
              {spaces.map((space) => {
                const isBoardActive = location.pathname === `/apps/tickets/board/${space.id}`
                const isListActive = location.pathname === `/apps/tickets/list/${space.id}`
                const isActive = isBoardActive || isListActive
                return (
                  <div key={space.id}>
                    <NavLink
                      to={`/apps/tickets/board/${space.id}`}
                      onClick={onClose}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <SpaceIcon space={space} />
                      <span className="flex-1 truncate">{space.name}</span>
                      <span className="text-xs text-gray-400">{space.ticket_count}</span>
                    </NavLink>
                    {isActive && (
                      <div className="ml-8 mt-0.5 flex gap-1">
                        <NavLink
                          to={`/apps/tickets/board/${space.id}`}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `text-xs px-2 py-0.5 rounded transition-colors ${
                              isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-700'
                            }`
                          }
                        >
                          Board
                        </NavLink>
                        <NavLink
                          to={`/apps/tickets/list/${space.id}`}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `text-xs px-2 py-0.5 rounded transition-colors ${
                              isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-700'
                            }`
                          }
                        >
                          List
                        </NavLink>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100 space-y-1">
        <NavLink to="/apps/tickets/settings" className={navLinkClass} onClick={onClose}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </NavLink>
        <a
          href="/dashboard/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Main Dashboard
        </a>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative z-50 flex flex-col w-64 bg-white h-full shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
