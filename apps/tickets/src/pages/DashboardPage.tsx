import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getDashboard, getSpaces, TicketListItem } from '../api/tickets'
import { PageSpinner } from '../components/ui/Spinner'
import { useSettings } from '../context/SettingsContext'

function darkenHex(hex: string, amount = 40): string {
  const c = hex.replace('#', '')
  const full = c.length === 3 ? c.split('').map((x: string) => x + x).join('') : c
  const num = parseInt(full, 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return '#' + [r, g, b].map((x: number) => x.toString(16).padStart(2, '0')).join('')
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
    <div className="min-h-full bg-[#f4f5f7]">
      {/* ── Top member toggle strip ── */}
      <div className="bg-[#0079bf] px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Home Tickets</h1>
        <div className="flex bg-black/20 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMember('me')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              member === 'me' ? 'bg-white text-[#0079bf]' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {member1Name}
          </button>
          <button
            onClick={() => setMember('partner')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              member === 'partner' ? 'bg-white text-[#0079bf]' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {member2Name}
          </button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-8">

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Due Today', value: stats.due_today.length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { label: 'Overdue', value: stats.overdue.length, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
            { label: `${currentName}'s Tasks`, value: stats.my_tasks.length, color: 'text-[#0079bf]', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Done This Week', value: stats.completed_this_week, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <p className="text-xs text-gray-500 mb-1 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Boards grid (main focus, Trello-style) ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#172b4d] uppercase tracking-wider">Your Boards</h2>
            <Link to="/apps/tickets/spaces" className="text-xs text-[#0079bf] hover:underline font-medium">
              Manage spaces →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {spaces.map(space => {
              const bg = space.color ?? '#0079bf'
              const bgDark = darkenHex(bg, 40)
              return (
                <Link
                  key={space.id}
                  to={`/apps/tickets/board/${space.id}`}
                  className="relative h-28 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
                  style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bgDark} 100%)` }}
                >
                  {/* Board name */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl leading-none">{space.icon}</span>
                      <span className="text-xs text-white/70 bg-black/20 rounded-full px-2 py-0.5">
                        {space.ticket_count}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight line-clamp-2">{space.name}</p>
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                </Link>
              )
            })}
            {/* Create new board tile */}
            <Link
              to="/apps/tickets/spaces"
              className="h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0079bf] hover:bg-[#0079bf]/5 transition-all flex flex-col items-center justify-center gap-1 group"
            >
              <span className="text-2xl text-gray-400 group-hover:text-[#0079bf] transition-colors">+</span>
              <span className="text-xs text-gray-500 group-hover:text-[#0079bf] font-medium transition-colors">New board</span>
            </Link>
          </div>
        </div>

        {/* ── Priority task lists (two columns) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TaskList
            title="Due Today"
            accent="amber"
            tickets={stats.due_today}
            onOpenTicket={onOpenTicket}
            emptyText="Nothing due today 🎉"
          />
          <TaskList
            title="Overdue"
            accent="red"
            tickets={stats.overdue}
            onOpenTicket={onOpenTicket}
            emptyText="No overdue cards!"
          />
          <TaskList
            title={`${currentName}'s Tasks`}
            accent="blue"
            tickets={stats.my_tasks}
            onOpenTicket={onOpenTicket}
            emptyText="No tasks assigned"
          />
          <TaskList
            title="Unassigned"
            accent="gray"
            tickets={stats.unassigned}
            onOpenTicket={onOpenTicket}
            emptyText="No unassigned cards"
          />
        </div>
      </div>
    </div>
  )
}

// ── Compact Trello-style task row list ─────────────────────────────────────────

const accentColors: Record<string, { bar: string; badge: string; text: string }> = {
  amber: { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-700' },
  red:   { bar: 'bg-red-500',   badge: 'bg-red-100 text-red-800',     text: 'text-red-700' },
  blue:  { bar: 'bg-[#0079bf]', badge: 'bg-blue-100 text-blue-800',   text: 'text-[#0079bf]' },
  gray:  { bar: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-700',   text: 'text-gray-600' },
}

function TaskList({
  title, accent, tickets, onOpenTicket, emptyText,
}: {
  title: string
  accent: string
  tickets: TicketListItem[]
  onOpenTicket: (id: number) => void
  emptyText: string
}) {
  const ac = accentColors[accent] ?? accentColors.gray
  const shown = tickets.slice(0, 6)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Colored accent bar */}
      <div className={`h-1 ${ac.bar}`} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className={`text-sm font-semibold ${ac.text}`}>{title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ac.badge}`}>
            {tickets.length}
          </span>
        </div>
        {shown.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">{emptyText}</p>
        ) : (
          <ul className="space-y-1">
            {shown.map(t => (
              <li key={t.id}>
                <button
                  onClick={() => onOpenTicket(t.id)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#f4f5f7] transition-colors group"
                >
                  {/* Priority dot */}
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    t.priority === 'urgent' ? 'bg-red-500'
                    : t.priority === 'high' ? 'bg-orange-400'
                    : t.priority === 'medium' ? 'bg-blue-400'
                    : 'bg-gray-300'
                  }`} />
                  <span className={`text-sm text-[#172b4d] flex-1 truncate group-hover:text-[#0079bf] transition-colors ${
                    t.status === 'done' ? 'line-through opacity-50' : ''
                  }`}>
                    {t.title}
                  </span>
                  {t.due_date && (
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {t.due_date.slice(5).replace('-', '/')}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {tickets.length > 6 && (
              <li className="text-xs text-[#0079bf] text-center py-1 font-medium">
                +{tickets.length - 6} more
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
