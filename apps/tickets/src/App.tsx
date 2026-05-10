import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { DashboardPage } from './pages/DashboardPage'
import { BoardPage } from './pages/BoardPage'
import { ListPage } from './pages/ListPage'
import { SpacesPage } from './pages/SpacesPage'
import { SettingsPage } from './pages/SettingsPage'
import { CalendarPage } from './pages/CalendarPage'
import { TicketModal } from './components/tickets/TicketModal'
import { QuickAddModal } from './components/tickets/QuickAddModal'
import { SettingsProvider } from './context/SettingsContext'
import { ToastProvider } from './context/ToastContext'
import { Status } from './api/tickets'

function usePageTitle(pathname: string): string {
  if (pathname === '/apps/tickets/' || pathname === '/apps/tickets') return 'Dashboard'
  if (pathname.startsWith('/apps/tickets/board/')) return 'Board'
  if (pathname.startsWith('/apps/tickets/list/')) return 'List'
  if (pathname.startsWith('/apps/tickets/calendar')) return 'Calendar'
  if (pathname.startsWith('/apps/tickets/spaces')) return 'Spaces'
  if (pathname.startsWith('/apps/tickets/settings')) return 'Settings'
  return 'Home Tickets'
}

function AppLayout() {
  const location = useLocation()
  const title = usePageTitle(location.pathname)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openTicketId, setOpenTicketId] = useState<number | null>(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddDefaults, setQuickAddDefaults] = useState<{
    spaceId?: number
    status?: Status
  }>({})

  const handleOpenTicket = useCallback((id: number) => {
    setOpenTicketId(id)
  }, [])

  const handleAddTicket = useCallback((spaceId: number, status?: Status) => {
    setQuickAddDefaults({ spaceId, status })
    setQuickAddOpen(true)
  }, [])

  const handleQuickAdd = useCallback(() => {
    setQuickAddDefaults({})
    setQuickAddOpen(true)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen((o) => !o)}
          onQuickAdd={handleQuickAdd}
        />

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route
              path="/apps/tickets/"
              element={<DashboardPage onOpenTicket={handleOpenTicket} />}
            />
            <Route
              path="/apps/tickets/board/:spaceId"
              element={
                <BoardPage
                  onOpenTicket={handleOpenTicket}
                  onAddTicket={handleAddTicket}
                />
              }
            />
            <Route
              path="/apps/tickets/list/:spaceId"
              element={<ListPage onOpenTicket={handleOpenTicket} />}
            />
            <Route
              path="/apps/tickets/calendar"
              element={<CalendarPage onOpenTicket={handleOpenTicket} />}
            />
            <Route path="/apps/tickets/spaces" element={<SpacesPage />} />
            <Route path="/apps/tickets/settings" element={<SettingsPage />} />
            {/* Catch-all */}
            <Route
              path="*"
              element={<DashboardPage onOpenTicket={handleOpenTicket} />}
            />
          </Routes>
        </main>
      </div>

      {/* Ticket detail modal */}
      {openTicketId !== null && (
        <TicketModal
          ticketId={openTicketId}
          onClose={() => setOpenTicketId(null)}
        />
      )}

      {/* Quick add modal */}
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultSpaceId={quickAddDefaults.spaceId}
        defaultStatus={quickAddDefaults.status}
      />

      {/* Mobile FAB */}
      <button
        onClick={handleQuickAdd}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label="New ticket"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}
