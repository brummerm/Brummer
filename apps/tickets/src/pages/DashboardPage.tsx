import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getDashboard, getSpaces, TicketListItem } from '../api/tickets'
import { TicketCard } from '../components/tickets/TicketCard'
import { PageSpinner } from '../components/ui/Spinner'
import { useSettings } from '../context/SettingsContext'

interface WidgetProps {
  title: string
  accent?: string
  tickets: TicketListItem[]
  onOpenTicket: (id: number) => void
  member1Name: string
  member2Name: string
  emptyMessage?: string
  viewAllHref?: string
}

function Widget({
  title, accent = '', tickets, onOpenTicket, member1Name, member2Name, emptyMessage, viewAllHref,
}: WidgetProps) {
  const shown = tickets.slice(0, 5)
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${accent || 'text-gray-700'}`}>{title}</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tickets.length}</span>
      </div>
      {shown.length === 0 ? (
        <p className="text-xs text-gray-400 py-3 text-center">{emptyMessage ?? 'All clear!'}</p>
      ) : (
        <div className="space-y-2">
          {shown.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              onClick={() => onOpenTicket(t.id)}
              member1Name={member1Name}
              member2Name={member2Name}
            />
          ))}
          {tickets.length > 5 && viewAllHref && (
            <Link
              to={viewAllHref}
              className="block text-center text-xs text-brand-600 hover:text-brand-700 py-1 hover:underline transition-colors"
            >
              View all {tickets.length} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

interface DashboardPageProps {
  onOpenTicket: (id: number) => void
}

export function DashboardPage({ onOpenTicket }: DashboardPageProps) {
  const { member1Name, member2Name } = useSettings()
  const [member, setMember] = useState<'me' | 'partner'>('me')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', member],
    queryFn: () => getDashboard(member),
  })

  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => getSpaces(false),
  })

  if (isLoading || !stats) return <PageSpinner />

  const currentName = member === 'me' ? member1Name : member2Name

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Viewing as {currentName}</p>
        </div>
        {/* Member toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => setMember('me')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              member === 'me' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {member1Name}
          </button>
          <button
            onClick={() => setMember('partner')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              member === 'partner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {member2Name}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Due Today</p>
          <p className="text-2xl font-bold text-amber-600">{stats.due_today.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">My Tasks</p>
          <p className="text-2xl font-bold text-brand-600">{stats.my_tasks.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Done This Week</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed_this_week}</p>
        </div>
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Widget
          title="Due Today"
          accent="text-amber-700"
          tickets={stats.due_today}
          onOpenTicket={onOpenTicket}
          member1Name={member1Name}
          member2Name={member2Name}
          emptyMessage="Nothing due today 🎉"
        />
        <Widget
          title="Overdue"
          accent="text-red-700"
          tickets={stats.overdue}
          onOpenTicket={onOpenTicket}
          member1Name={member1Name}
          member2Name={member2Name}
          emptyMessage="No overdue tickets!"
        />
        <Widget
          title={`${currentName}'s Tasks`}
          accent="text-brand-700"
          tickets={stats.my_tasks}
          onOpenTicket={onOpenTicket}
          member1Name={member1Name}
          member2Name={member2Name}
          emptyMessage="No tasks assigned"
        />
        <Widget
          title="Unassigned"
          tickets={stats.unassigned}
          onOpenTicket={onOpenTicket}
          member1Name={member1Name}
          member2Name={member2Name}
          emptyMessage="No unassigned tickets"
        />
      </div>

      {/* Spaces overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Spaces</h2>
          <Link to="/apps/tickets/spaces" className="text-xs text-brand-600 hover:text-brand-700 hover:underline">
            Manage spaces →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {spaces.map((space) => (
            <Link
              key={space.id}
              to={`/apps/tickets/board/${space.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-lg w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: space.color + '20' }}
                >
                  {space.icon}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-brand-700 transition-colors">
                {space.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{space.ticket_count} tickets</p>
            </Link>
          ))}
          {spaces.length === 0 && (
            <Link
              to="/apps/tickets/spaces"
              className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-brand-300 transition-colors flex flex-col items-center justify-center gap-1 col-span-2"
            >
              <span className="text-2xl">+</span>
              <span className="text-sm text-gray-500">Create first space</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
