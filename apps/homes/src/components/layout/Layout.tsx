import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchStats, triggerScrape } from '../../api/listings'
import { formatDistanceToNow } from 'date-fns'

const NAV = [
  { to: '/listings', label: 'All Listings', icon: '🏠' },
  { to: '/favorites', label: 'Favorites', icon: '⭐' },
  { to: '/dismissed', label: 'Dismissed', icon: '🚫' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

const HOOD_COLORS: Record<string, string> = {
  Brooklyn: 'bg-blue-100 text-blue-700',
  Queens: 'bg-green-100 text-green-700',
  Manhattan: 'bg-purple-100 text-purple-700',
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['homes-stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  })

  const scrapeMut = useMutation({
    mutationFn: triggerScrape,
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['listings'] })
        queryClient.invalidateQueries({ queryKey: ['homes-stats'] })
      }, 15_000)
    },
  })

  const lastScraped = stats?.last_scraped
    ? formatDistanceToNow(new Date(stats.last_scraped), { addSuffix: true })
    : 'never'

  const statusColor =
    stats?.last_scrape_status === 'ok' ? 'text-green-600' :
    stats?.last_scrape_status === 'blocked' ? 'text-yellow-600' :
    stats?.last_scrape_status === 'error' ? 'text-red-500' : 'text-gray-400'

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-white border-r border-gray-200
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex
      `}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">NYC Home Search</p>
              <p className="text-gray-400 text-xs">Brooklyn · Queens · Manhattan</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="px-4 py-3 border-b border-gray-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Active listings</span>
              <span className="font-bold text-gray-800">{stats.total_active}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">New today</span>
              <span className="font-bold text-green-600">{stats.new_today}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Favorites</span>
              <span className="font-bold text-yellow-500">⭐ {stats.favorites}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(stats.by_neighborhood).map(([hood, count]) => (
                <span key={hood} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${HOOD_COLORS[hood] ?? 'bg-gray-100 text-gray-600'}`}>
                  {hood} {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>

        {/* Scrape control */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-2">
          <p className={`text-[10px] ${statusColor}`}>
            Last scraped: {lastScraped}
          </p>

          {stats?.last_scrape_status === 'blocked' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-800 leading-relaxed space-y-1">
              <p className="font-bold">⚠️ Blocked by Zillow</p>
              <p>Render's server IP is flagged as a datacenter by Cloudflare. Headers and stealth can't fix an IP block.</p>
              <p><strong>Fix:</strong> get a free API key at <a href="https://scraperapi.com" target="_blank" rel="noopener noreferrer" className="underline">scraperapi.com</a>, then add <code className="bg-amber-100 px-0.5 rounded font-mono">SCRAPERAPI_KEY=your_key</code> to your Render environment variables.</p>
            </div>
          )}

          <button
            onClick={() => scrapeMut.mutate()}
            disabled={scrapeMut.isPending}
            className="w-full text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {scrapeMut.isPending ? '⏳ Scraping…' : '↻ Scrape Now'}
          </button>
          <a href="/dashboard/" className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </a>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-1 text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-gray-900">🏠 NYC Home Search</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
