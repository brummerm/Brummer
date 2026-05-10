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
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  const activeFilterCount = [filterAssignee, filterPriority, filterSearch].filter(Boolean).length
  const clearFilters = () => { setFilterAssignee(''); setFilterPriority(''); setFilterSearch('') }

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

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
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

          {/* Desktop filters inline */}
          <div className="hidden sm:flex items-center gap-2 flex-1">
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
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Mobile: filter toggle button */}
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
          <span className="text-xs text-gray-400">{tickets.length}</span>
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
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="">All assignees</option>
                <option value="me">{member1Name}</option>
                <option value="partner">{member2Name}</option>
                <option value="shared">👥 Shared</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="">All priorities</option>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700 transition-colors text-left"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
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
