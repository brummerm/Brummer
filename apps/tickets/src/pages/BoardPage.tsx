import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTickets, getSpaces, Status, Priority } from '../api/tickets'
import { KanbanBoard } from '../components/board/KanbanBoard'
import { PageSpinner } from '../components/ui/Spinner'
import { PRIORITY_OPTIONS } from '../components/ui/Badge'
import { useSettings } from '../context/SettingsContext'

interface BoardPageProps {
  onOpenTicket: (id: number) => void
  onAddTicket: (spaceId: number, status?: Status) => void
}

export function BoardPage({ onOpenTicket, onAddTicket }: BoardPageProps) {
  const { spaceId } = useParams<{ spaceId: string }>()
  const id = Number(spaceId)
  const navigate = useNavigate()
  const { member1Name, member2Name } = useSettings()

  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterSearch, setFilterSearch] = useState('')

  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => getSpaces(false),
  })

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', id],
    queryFn: () => getTickets({ space_id: id, limit: 200 }),
    enabled: !!id,
  })

  const space = spaces.find((s) => s.id === id)

  if (isLoading) return <PageSpinner />

  const hasFilters = filterAssignee || filterPriority || filterSearch

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
          <Link to="/apps/tickets/" className="hover:text-gray-700 transition-colors">Dashboard</Link>
          <span>›</span>
          {space ? (
            <span className="flex items-center gap-1.5 font-medium text-gray-900">
              <span style={{ color: space.color }}>{space.icon}</span>
              {space.name}
            </span>
          ) : (
            <span className="font-medium text-gray-900">Space {id}</span>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 mr-1">
            <button className="px-2.5 py-1 text-xs font-medium bg-white text-gray-900 rounded-md shadow-sm">
              Board
            </button>
            <button
              onClick={() => navigate(`/apps/tickets/list/${id}`)}
              className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              List
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Filter…"
              className="pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 w-36"
            />
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Assignee filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="">All assignees</option>
            <option value="me">{member1Name}</option>
            <option value="partner">{member2Name}</option>
          </select>

          {/* Priority filter */}
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

          {hasFilters && (
            <button
              onClick={() => { setFilterAssignee(''); setFilterPriority(''); setFilterSearch('') }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5"
            >
              Clear filters
            </button>
          )}

          <div className="flex-1" />
          <span className="text-xs text-gray-400">{tickets.length} tickets</span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto p-4">
        <KanbanBoard
          tickets={tickets}
          spaceId={id}
          filters={{
            assignee: filterAssignee || undefined,
            priority: filterPriority || undefined,
            search: filterSearch || undefined,
          }}
          onOpenTicket={onOpenTicket}
          onAddTicket={(status) => onAddTicket(id, status)}
        />
      </div>
    </div>
  )
}
