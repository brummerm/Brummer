import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addDays, addWeeks, addMonths,
  subDays, subWeeks, subMonths, isToday, isSameMonth, isSameDay, parseISO,
} from 'date-fns'
import { getTickets, TicketListItem } from '../api/tickets'
import { PriorityDot } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'

type CalendarView = 'month' | 'week' | 'day'

const WEEK_START = 0 // Sunday

function dateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function groupByDate(tickets: TicketListItem[]): Record<string, TicketListItem[]> {
  const map: Record<string, TicketListItem[]> = {}
  for (const t of tickets) {
    if (!t.due_date) continue
    const key = t.due_date.slice(0, 10)
    ;(map[key] ??= []).push(t)
  }
  return map
}

// ── Shared mini ticket chip ───────────────────────────────────────────────────

function TicketChip({
  ticket,
  onClick,
  compact = false,
}: {
  ticket: TicketListItem
  onClick: () => void
  compact?: boolean
}) {
  const priorityColor: Record<string, string> = {
    urgent: 'bg-red-50 border-red-200 text-red-800',
    high: 'bg-orange-50 border-orange-200 text-orange-800',
    medium: 'bg-blue-50 border-blue-200 text-blue-800',
    low: 'bg-gray-50 border-gray-200 text-gray-700',
  }
  const cls = priorityColor[ticket.priority] ?? priorityColor.medium

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`w-full text-left rounded px-1.5 py-0.5 border text-xs truncate transition-opacity hover:opacity-80 ${cls} ${
        compact ? 'leading-tight' : ''
      } ${ticket.status === 'done' ? 'opacity-50 line-through' : ''}`}
    >
      {compact ? ticket.title : (
        <span className="flex items-center gap-1">
          <PriorityDot priority={ticket.priority} />
          <span className="truncate">{ticket.title}</span>
        </span>
      )}
    </button>
  )
}

// ── Month view ────────────────────────────────────────────────────────────────

function MonthView({
  cursor,
  byDate,
  onOpenTicket,
}: {
  cursor: Date
  byDate: Record<string, TicketListItem[]>
  onOpenTicket: (id: number) => void
}) {
  const monthStart = startOfMonth(cursor)
  const monthEnd = endOfMonth(cursor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_START })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_START })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {[['S','Sun'], ['M','Mon'], ['T','Tue'], ['W','Wed'], ['T','Thu'], ['F','Fri'], ['S','Sat']].map(([short, full]) => (
          <div key={full} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{full}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))` }}>
        {days.map((day) => {
          const key = dateKey(day)
          const dayTickets = byDate[key] ?? []
          const inMonth = isSameMonth(day, cursor)
          const today = isToday(day)

          return (
            <div
              key={key}
              className={`border-b border-r border-gray-100 p-1 sm:p-1.5 min-h-[52px] sm:min-h-[90px] ${
                inMonth ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {/* Date number */}
              <div className="flex items-center justify-end mb-1">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    today
                      ? 'bg-brand-600 text-white'
                      : inMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Tickets — dots on mobile, chips on desktop */}
              <div className="flex sm:hidden flex-wrap gap-0.5 mt-0.5">
                {dayTickets.slice(0, 5).map((t) => {
                  const dotColor: Record<string, string> = {
                    urgent: 'bg-red-500', high: 'bg-orange-400',
                    medium: 'bg-blue-400', low: 'bg-gray-300',
                  }
                  return (
                    <button
                      key={t.id}
                      onClick={(e) => { e.stopPropagation(); onOpenTicket(t.id) }}
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[t.priority] ?? 'bg-gray-300'} ${t.status === 'done' ? 'opacity-40' : ''}`}
                      title={t.title}
                    />
                  )
                })}
                {dayTickets.length > 5 && (
                  <span className="text-[8px] text-gray-400 leading-none self-end">+{dayTickets.length - 5}</span>
                )}
              </div>
              <div className="hidden sm:block space-y-0.5">
                {dayTickets.slice(0, 3).map((t) => (
                  <TicketChip
                    key={t.id}
                    ticket={t}
                    onClick={() => onOpenTicket(t.id)}
                    compact
                  />
                ))}
                {dayTickets.length > 3 && (
                  <p className="text-[10px] text-gray-400 pl-1">+{dayTickets.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Week view ─────────────────────────────────────────────────────────────────

function WeekView({
  cursor,
  byDate,
  onOpenTicket,
}: {
  cursor: Date
  byDate: Record<string, TicketListItem[]>
  onOpenTicket: (id: number) => void
}) {
  const weekStart = startOfWeek(cursor, { weekStartsOn: WEEK_START })
  const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })

  return (
    <div className="flex flex-col h-full overflow-x-auto">
      <div className="flex flex-col h-full" style={{ minWidth: '560px' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          {days.map((day) => {
            const today = isToday(day)
            return (
              <div key={dateKey(day)} className="py-2 sm:py-3 text-center border-r border-gray-100 last:border-r-0 min-w-[80px]">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {format(day, 'EEE')}
                </p>
                <span
                  className={`mt-0.5 sm:mt-1 text-base sm:text-lg font-bold w-7 h-7 sm:w-9 sm:h-9 mx-auto flex items-center justify-center rounded-full ${
                    today ? 'bg-brand-600 text-white' : 'text-gray-800'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
            )
          })}
        </div>

        {/* Ticket columns */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {days.map((day) => {
            const key = dateKey(day)
            const dayTickets = byDate[key] ?? []
            const today = isToday(day)

            return (
              <div
                key={key}
                className={`border-r border-gray-100 last:border-r-0 p-1.5 sm:p-2 space-y-1 min-h-full min-w-[80px] ${
                  today ? 'bg-brand-50/30' : ''
                }`}
              >
                {dayTickets.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center mt-4">—</p>
                ) : (
                  dayTickets.map((t) => (
                    <TicketChip key={t.id} ticket={t} onClick={() => onOpenTicket(t.id)} />
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Day view ──────────────────────────────────────────────────────────────────

function DayView({
  cursor,
  byDate,
  onOpenTicket,
}: {
  cursor: Date
  byDate: Record<string, TicketListItem[]>
  onOpenTicket: (id: number) => void
}) {
  const key = dateKey(cursor)
  const dayTickets = byDate[key] ?? []
  const today = isToday(cursor)

  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...dayTickets].sort(
    (a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9),
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className={`mb-6 pb-4 border-b border-gray-200 ${today ? 'text-brand-700' : 'text-gray-800'}`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {today ? 'Today' : format(cursor, 'EEEE')}
        </p>
        <p className="text-3xl font-bold">{format(cursor, 'MMMM d, yyyy')}</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-base font-medium text-gray-500">Nothing due this day</p>
          <p className="text-sm mt-1">Use the arrows to navigate or switch to weekly / monthly view</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {sorted.length} ticket{sorted.length !== 1 ? 's' : ''} due
          </p>
          {sorted.map((t) => {
            const priorityBorder: Record<string, string> = {
              urgent: 'border-l-red-500',
              high: 'border-l-orange-400',
              medium: 'border-l-blue-400',
              low: 'border-l-gray-300',
            }
            return (
              <button
                key={t.id}
                onClick={() => onOpenTicket(t.id)}
                className={`w-full text-left bg-white border border-gray-200 border-l-4 ${
                  priorityBorder[t.priority] ?? 'border-l-gray-300'
                } rounded-lg p-4 hover:shadow-sm hover:border-brand-200 transition-all group ${
                  t.status === 'done' ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <PriorityDot priority={t.priority} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors ${
                      t.status === 'done' ? 'line-through' : ''
                    }`}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-400 capitalize">{t.priority} priority</span>
                      <span className="text-xs text-gray-400 capitalize">{t.status.replace('_', ' ')}</span>
                      {t.assignee && (
                        <span className="text-xs text-gray-400">
                          {t.assignee === 'shared' ? '👥 Shared' : t.assignee === 'me' ? '→ Me' : '→ Partner'}
                        </span>
                      )}
                      {t.recurrence_json && <span className="text-xs text-gray-400">🔁 Recurring</span>}
                      {t.checklist_count > 0 && (
                        <span className="text-xs text-gray-400">☑ {t.checklist_count}</span>
                      )}
                    </div>
                    {t.labels.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {t.labels.map((l) => (
                          <span
                            key={l.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white"
                            style={{ backgroundColor: l.color }}
                          >
                            {l.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main CalendarPage ─────────────────────────────────────────────────────────

interface CalendarPageProps {
  onOpenTicket: (id: number) => void
}

export function CalendarPage({ onOpenTicket }: CalendarPageProps) {
  const [view, setView] = useState<CalendarView>('month')
  const [cursor, setCursor] = useState(new Date())

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets-all'],
    queryFn: () => getTickets({}),
    staleTime: 30_000,
  })

  const byDate = useMemo(() => groupByDate(tickets), [tickets])

  function navigate(dir: -1 | 1) {
    if (view === 'month') setCursor((c) => dir === 1 ? addMonths(c, 1) : subMonths(c, 1))
    else if (view === 'week') setCursor((c) => dir === 1 ? addWeeks(c, 1) : subWeeks(c, 1))
    else setCursor((c) => dir === 1 ? addDays(c, 1) : subDays(c, 1))
  }

  function getTitle() {
    if (view === 'month') return format(cursor, 'MMMM yyyy')
    if (view === 'week') {
      const s = startOfWeek(cursor, { weekStartsOn: WEEK_START })
      const e = endOfWeek(cursor, { weekStartsOn: WEEK_START })
      return isSameMonth(s, e)
        ? format(s, 'MMMM yyyy')
        : `${format(s, 'MMM')} – ${format(e, 'MMM yyyy')}`
    }
    return format(cursor, 'MMMM d, yyyy')
  }

  if (isLoading) return <PageSpinner />

  const totalWithDueDate = tickets.filter((t) => t.due_date).length

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 flex-shrink-0 flex-wrap gap-y-2">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <h2 className="text-sm font-semibold text-gray-900 min-w-[140px]">{getTitle()}</h2>

        <div className="flex-1" />

        {/* Ticket count hint */}
        <span className="text-xs text-gray-400 hidden sm:inline">
          {totalWithDueDate} ticket{totalWithDueDate !== 1 ? 's' : ''} with due dates
        </span>

        {/* View switcher */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                view === v
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 overflow-auto min-h-0">
        {view === 'month' && (
          <MonthView cursor={cursor} byDate={byDate} onOpenTicket={onOpenTicket} />
        )}
        {view === 'week' && (
          <WeekView cursor={cursor} byDate={byDate} onOpenTicket={onOpenTicket} />
        )}
        {view === 'day' && (
          <DayView cursor={cursor} byDate={byDate} onOpenTicket={onOpenTicket} />
        )}
      </div>
    </div>
  )
}
