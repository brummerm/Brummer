import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTickets, getSpaces, Status } from '../api/tickets'
import { KanbanBoard } from '../components/board/KanbanBoard'
import { PageSpinner } from '../components/ui/Spinner'
import { PRIORITY_OPTIONS } from '../components/ui/Badge'
import { useSettings } from '../context/SettingsContext'

interface BoardPageProps {
  onOpenTicket: (id: number) => void
  onAddTicket: (spaceId: number, status?: Status) => void
}

function darkenHex(hex: string, amount = 50): string {
  const c = hex.replace('#', '')
  const full = c.length === 3 ? c.split('').map(x => x + x).join('') : c
  const num = parseInt(full, 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
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

  const space = spaces.find(s => s.id === id)
  const boardColor = space?.color ?? '#0079bf'
  const boardColorDark = darkenHex(boardColor, 50)

  if (isLoading) return <PageSpinner />

  const activeFilterCount = [filterAssignee, filterPriority, filterSearch].filter(Boolean).length
  const clearFilters = () => { setFilterAssignee(''); setFilterPriority(''); setFilterSearch('') }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${boardColor} 0%, ${boardColorDark} 100%)` }}
    >
      {/* Board header */}
      <div className="flex-shrink-0 px-4 py-2.5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-wrap gap-y-2">
          <div className="flex items-center gap-2 mr-1">
            <Link to="/apps/tickets/" className="text-white/70 hover:text-white text-lg leading-none transition-colors">←</Link>
            {space ? (
              <span className="flex items-center gap-1.5 text-white font-bold text-base">
                <span>{space.icon}</span>{space.name}
              </span>
            ) : (
              <span className="text-white font-bold text-base">Space {id}</span>
            )}
          </div>

          <div className="flex bg-black/20 rounded-lg p-0.5 gap-0.5">
            <button className="px-2.5 py-1 text-xs font-semibold bg-white/20 text-white rounded-md">Board</button>
            <button
              onClick={() => navigate(`/apps/tickets/list/${id}`)}
              className="px-2.5 py-1 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              List
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <input
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Search cards…"
                className="pl-7 pr-3 py-1.5 text-xs bg-black/20 border border-white/20 rounded-lg focus:outline-none focus:border-white/50 text-white placeholder-white/50 w-36"
              />
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
              className="text-xs border border-white/20 rounded-lg px-2 py-1.5 bg-black/20 text-white focus:outline-none focus:border-white/50">
              <option value="" className="text-gray-900 bg-white">All members</option>
              <option value="me" className="text-gray-900 bg-white">{member1Name}</option>
              <option value="partner" className="text-gray-900 bg-white">{member2Name}</option>
              <option value="shared" className="text-gray-900 bg-white">👥 Shared</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="text-xs border border-white/20 rounded-lg px-2 py-1.5 bg-black/20 text-white focus:outline-none focus:border-white/50">
              <option value="" className="text-gray-900 bg-white">All priorities</option>
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="text-gray-900 bg-white">{o.label}</option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="text-xs text-white/70 hover:text-white transition-colors px-2 py-1.5 bg-white/10 rounded-lg">
                Clear ×
              </button>
            )}
          </div>

          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-white/20 rounded-lg bg-black/20 text-white hover:bg-black/30 transition-colors"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-[#0079bf] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{activeFilterCount}</span>
            )}
          </button>

          <div className="flex-1" />
          <span className="text-xs text-white/50">{tickets.length} cards</span>
        </div>

        {filtersOpen && (
          <div className="sm:hidden mt-2 pt-2 border-t border-white/20 flex flex-col gap-2">
            <div className="relative">
              <input value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
                placeholder="Search cards…"
                className="w-full pl-7 pr-3 py-2 text-sm bg-black/20 border border-white/20 rounded-lg focus:outline-none text-white placeholder-white/50" />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
                className="text-sm border border-white/20 rounded-lg px-3 py-2 bg-black/20 text-white focus:outline-none">
                <option value="" className="text-gray-900 bg-white">All members</option>
                <option value="me" className="text-gray-900 bg-white">{member1Name}</option>
                <option value="partner" className="text-gray-900 bg-white">{member2Name}</option>
                <option value="shared" className="text-gray-900 bg-white">👥 Shared</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="text-sm border border-white/20 rounded-lg px-3 py-2 bg-black/20 text-white focus:outline-none">
                <option value="" className="text-gray-900 bg-white">All priorities</option>
                {PRIORITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="text-gray-900 bg-white">{o.label}</option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-white/70 hover:text-white transition-colors text-left">Clear all filters</button>
            )}
          </div>
        )}
      </div>

      {/* Board canvas */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        <KanbanBoard
          tickets={tickets}
          spaceId={id}
          filters={{
            assignee: filterAssignee || undefined,
            priority: filterPriority || undefined,
            search: filterSearch || undefined,
          }}
          onOpenTicket={onOpenTicket}
          onAddTicket={status => onAddTicket(id, status)}
        />
      </div>
    </div>
  )
}
