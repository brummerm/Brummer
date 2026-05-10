import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { getTickets, getSpaces, updateTicket, TicketListItem, Status, Priority } from '../api/tickets'
import { StatusBadge, PriorityBadge, STATUS_OPTIONS, PRIORITY_OPTIONS } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'

type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'due_date' | 'updated_at'
type SortDir = 'asc' | 'desc'
type GroupBy = 'status' | 'priority' | 'none'

interface ListPageProps {
  onOpenTicket: (id: number) => void
}

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
const STATUS_ORDER: Record<Status, number> = { in_progress: 0, todo: 1, waiting: 2, backlog: 3, done: 4 }

export function ListPage({ onOpenTicket }: ListPageProps) {
  const { spaceId } = useParams<{ spaceId: string }>()
  const [searchParams] = useSearchParams()
  const id = Number(spaceId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { member1Name, member2Name } = useSettings()
  const { addToast } = useToast()

  const searchQ = searchParams.get('q') ?? ''

  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [groupBy, setGroupBy] = useState<GroupBy>('status')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterSearch, setFilterSearch] = useState(searchQ)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data: spaces = [] } = useQuery({ queryKey: ['spaces'], queryFn: () => getSpaces(false) })

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', id],
    queryFn: () => getTickets({ space_id: id || undefined, limit: 200 }),
  })

  const updateMut = useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: number; payload: { status?: Status; priority?: Priority } }) =>
      updateTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => addToast('Failed to update ticket', 'error'),
  })

  const space = spaces.find((s) => s.id === id)
  const activeFilterCount = [filterAssignee, filterPriority, filterSearch].filter(Boolean).length
  const clearFilters = () => { setFilterAssignee(''); setFilterPriority(''); setFilterSearch('') }

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filterAssignee && t.assignee !== filterAssignee) return false
      if (filterPriority && t.priority !== filterPriority) return false
      const q = filterSearch.toLowerCase()
      if (q && !t.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [tickets, filterAssignee, filterPriority, filterSearch])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title': cmp = a.title.localeCompare(b.title); break
        case 'status': cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; break
        case 'priority': cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break
        case 'assignee': cmp = (a.assignee ?? '').localeCompare(b.assignee ?? ''); break
        case 'due_date':
          cmp = (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'); break
        case 'updated_at': cmp = a.updated_at.localeCompare(b.updated_at); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortField, sortDir])

  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: 'all', label: 'All', tickets: sorted }]
    if (groupBy === 'status') {
      return STATUS_OPTIONS.map(({ value, label }) => ({
        key: value,
        label,
        tickets: sorted.filter((t) => t.status === value),
      })).filter((g) => g.tickets.length > 0)
    }
    return PRIORITY_OPTIONS.map(({ value, label }) => ({
      key: value,
      label,
      tickets: sorted.filter((t) => t.priority === value),
    })).filter((g) => g.tickets.length > 0)
  }, [sorted, groupBy])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-brand-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
          <Link to="/apps/tickets/" className="hover:text-gray-700 transition-colors">Dashboard</Link>
          <span>›</span>
          {space ? (
            <span className="flex items-center gap-1.5 font-medium text-gray-900">
              <span style={{ color: space.color }}>{space.icon}</span>
              {space.name}
            </span>
          ) : (
            <span className="font-medium text-gray-900">All tickets</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          {id > 0 && (
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => navigate(`/apps/tickets/board/${id}`)}
                className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Board
              </button>
              <button className="px-2.5 py-1 text-xs font-medium bg-white text-gray-900 rounded-md shadow-sm">
                List
              </button>
            </div>
          )}

          {/* Desktop: inline filters */}
          <div className="hidden sm:flex items-center gap-2 flex-1">
            <div className="relative">
              <input
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search…"
                className="pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 w-36"
              />
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">All assignees</option>
              <option value="me">{member1Name}</option>
              <option value="partner">{member2Name}</option>
              <option value="shared">👥 Shared</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">All priorities</option>
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="status">Group: Status</option>
              <option value="priority">Group: Priority</option>
              <option value="none">No grouping</option>
            </select>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Clear
              </button>
            )}
          </div>

          {/* Mobile: filter button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-brand-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1" />
          <span className="text-xs text-gray-400">{sorted.length}</span>
        </div>

        {/* Mobile: expanded filter panel */}
        {filtersOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="relative">
              <input
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search tickets…"
                className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              >
                <option value="">All assignees</option>
                <option value="me">{member1Name}</option>
                <option value="partner">{member2Name}</option>
                <option value="shared">👥 Shared</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              >
                <option value="">All priorities</option>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              >
                <option value="status">Group by Status</option>
                <option value="priority">Group by Priority</option>
                <option value="none">No grouping</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 text-left">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-2.5 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('title')}>
                Title <SortIcon field="title" />
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                Status <SortIcon field="status" />
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('priority')}>
                Priority <SortIcon field="priority" />
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('assignee')}>
                Assignee <SortIcon field="assignee" />
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('due_date')}>
                Due <SortIcon field="due_date" />
              </th>
              <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('updated_at')}>
                Updated <SortIcon field="updated_at" />
              </th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) => (
              <>
                {groupBy !== 'none' && (
                  <tr key={`group-${group.key}`} className="border-b border-gray-100">
                    <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                      {group.label} ({group.tickets.length})
                    </td>
                  </tr>
                )}
                {group.tickets.map((ticket) => {
                  const dueDate = ticket.due_date ? parseISO(ticket.due_date) : null
                  const dueDateClass = dueDate && ticket.status !== 'done'
                    ? isToday(dueDate) ? 'text-amber-600 font-medium'
                    : isPast(dueDate) ? 'text-red-600 font-medium'
                    : 'text-gray-600'
                    : 'text-gray-400'

                  const assigneeName = ticket.assignee === 'me' ? member1Name
                    : ticket.assignee === 'partner' ? member2Name
                    : ticket.assignee === 'shared' ? '👥 Both'
                    : '—'

                  return (
                    <tr
                      key={ticket.id}
                      className="border-b border-gray-100 hover:bg-brand-50/30 transition-colors group"
                    >
                      {/* Title */}
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => onOpenTicket(ticket.id)}
                          className="text-left font-medium text-gray-900 hover:text-brand-700 transition-colors line-clamp-1"
                        >
                          {ticket.title}
                        </button>
                        {ticket.labels.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {ticket.labels.slice(0, 3).map((l) => (
                              <span
                                key={l.id}
                                className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: l.color }}
                              >
                                {l.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            updateMut.mutate({ ticketId: ticket.id, payload: { status: e.target.value as Status } })
                          }
                          className="text-xs border border-transparent group-hover:border-gray-200 rounded px-1 py-0.5 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 cursor-pointer hover:border-gray-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="px-3 py-2.5">
                        <select
                          value={ticket.priority}
                          onChange={(e) =>
                            updateMut.mutate({ ticketId: ticket.id, payload: { priority: e.target.value as Priority } })
                          }
                          className="text-xs border border-transparent group-hover:border-gray-200 rounded px-1 py-0.5 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-300 cursor-pointer hover:border-gray-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {PRIORITY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Assignee */}
                      <td className="px-3 py-2.5 text-gray-600 text-xs">{assigneeName}</td>

                      {/* Due date */}
                      <td className={`px-3 py-2.5 text-xs ${dueDateClass}`}>
                        {dueDate ? (isToday(dueDate) ? 'Today' : format(dueDate, 'MMM d')) : '—'}
                      </td>

                      {/* Updated */}
                      <td className="px-3 py-2.5 text-xs text-gray-400">
                        {format(parseISO(ticket.updated_at), 'MMM d')}
                      </td>
                    </tr>
                  )
                })}
              </>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  No tickets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
