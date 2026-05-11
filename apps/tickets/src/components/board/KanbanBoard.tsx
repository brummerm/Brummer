import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TicketListItem, Status, updateTicket } from '../../api/tickets'
import { TicketCard } from '../tickets/TicketCard'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'

const COLUMNS: { status: Status; label: string }[] = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'waiting', label: 'Waiting' },
  { status: 'done', label: 'Done' },
]

interface SortableTicketCardProps {
  ticket: TicketListItem
  onOpenTicket: (id: number) => void
  member1Name: string
  member2Name: string
}

function SortableTicketCard({ ticket, onOpenTicket, member1Name, member2Name }: SortableTicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { ticket },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard
        ticket={ticket}
        onClick={() => onOpenTicket(ticket.id)}
        member1Name={member1Name}
        member2Name={member2Name}
        dragging={isDragging}
      />
    </div>
  )
}

interface KanbanColumnProps {
  status: Status
  label: string
  tickets: TicketListItem[]
  onOpenTicket: (id: number) => void
  onAddTicket: (status: Status) => void
  member1Name: string
  member2Name: string
}

function KanbanColumn({ status, label, tickets, onOpenTicket, onAddTicket, member1Name, member2Name }: KanbanColumnProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex flex-col w-[272px] flex-shrink-0 rounded-xl" style={{ backgroundColor: '#ebecf0' }}>
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex-1 text-left flex items-center gap-1.5 min-w-0"
        >
          <span className="text-sm font-semibold text-[#172b4d] truncate">{label}</span>
          <span className="text-xs font-medium text-[#5e6c84] bg-[#dfe1e6] rounded-full px-2 py-0.5 leading-none flex-shrink-0">
            {tickets.length}
          </span>
        </button>
        <button
          onClick={() => onAddTicket(status)}
          className="p-1 rounded-md text-[#5e6c84] hover:bg-[#dfe1e6] hover:text-[#172b4d] transition-colors flex-shrink-0"
          title={`Add card to ${label}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {!collapsed ? (
        <>
          {/* Cards — scrollable */}
          <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div
              className="overflow-y-auto px-2 space-y-2"
              style={{ maxHeight: 'calc(100vh - 220px)', minHeight: '8px' }}
            >
              {tickets.map(ticket => (
                <SortableTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onOpenTicket={onOpenTicket}
                  member1Name={member1Name}
                  member2Name={member2Name}
                />
              ))}
            </div>
          </SortableContext>

          {/* Add a card — always visible at bottom */}
          <div className="px-2 pb-2 pt-1 flex-shrink-0">
            <button
              onClick={() => onAddTicket(status)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#5e6c84] hover:bg-[#dfe1e6] hover:text-[#172b4d] transition-colors text-left"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add a card
            </button>
          </div>
        </>
      ) : (
        <div className="px-3 pb-3">
          <button
            onClick={() => setCollapsed(false)}
            className="text-xs text-[#5e6c84] hover:text-[#172b4d] transition-colors"
          >
            Show {tickets.length} card{tickets.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}

interface KanbanBoardProps {
  tickets: TicketListItem[]
  spaceId: number
  filters?: {
    assignee?: string
    priority?: string
    search?: string
  }
  onOpenTicket: (id: number) => void
  onAddTicket: (status: Status) => void
}

export function KanbanBoard({ tickets, spaceId, filters, onOpenTicket, onAddTicket }: KanbanBoardProps) {
  const queryClient = useQueryClient()
  const { member1Name, member2Name } = useSettings()
  const { addToast } = useToast()
  const [activeTicket, setActiveTicket] = useState<TicketListItem | null>(null)
  const [mobileColumn, setMobileColumn] = useState<Status>('todo')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) => updateTicket(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', spaceId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => addToast('Failed to move card', 'error'),
  })

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (filters?.assignee) {
        if (t.assignee !== filters.assignee && t.assignee !== 'shared') return false
      }
      if (filters?.priority && t.priority !== filters.priority) return false
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        if (!t.title.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [tickets, filters])

  const byStatus = useMemo(() => {
    const map: Record<Status, TicketListItem[]> = { backlog: [], todo: [], in_progress: [], waiting: [], done: [] }
    for (const t of filteredTickets) map[t.status].push(t)
    return map
  }, [filteredTickets])

  function handleDragStart(event: DragStartEvent) {
    setActiveTicket(tickets.find(t => t.id === event.active.id) ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTicket(null)
    if (!over) return
    const draggedTicket = tickets.find(t => t.id === active.id)
    if (!draggedTicket) return
    let targetStatus: Status | null = null
    const columnStatuses = COLUMNS.map(c => c.status) as string[]
    if (columnStatuses.includes(String(over.id))) {
      targetStatus = over.id as Status
    } else {
      const overTicket = tickets.find(t => t.id === over.id)
      if (overTicket) targetStatus = overTicket.status
    }
    if (targetStatus && targetStatus !== draggedTicket.status) {
      queryClient.setQueryData<TicketListItem[]>(
        ['tickets', spaceId],
        old => old?.map(t => t.id === draggedTicket.id ? { ...t, status: targetStatus! } : t) ?? [],
      )
      updateMut.mutate({ id: draggedTicket.id, status: targetStatus })
    }
  }

  return (
    <>
      {/* ── Mobile: column tab strip (pill style on colored background) ── */}
      <div className="md:hidden flex overflow-x-auto no-scrollbar -mx-4 px-2 flex-shrink-0 mb-3">
        {COLUMNS.map(({ status, label }) => {
          const count = byStatus[status].length
          const active = mobileColumn === status
          return (
            <button
              key={status}
              onClick={() => setMobileColumn(status)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full mr-1.5 transition-colors whitespace-nowrap ${
                active
                  ? 'bg-white text-[#172b4d] shadow-sm'
                  : 'bg-white/25 text-white/90 hover:bg-white/40'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  active ? 'bg-[#ebecf0] text-[#5e6c84]' : 'bg-white/30 text-white'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Mobile: single column view ── */}
      <div className="md:hidden space-y-2">
        {byStatus[mobileColumn].map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => onOpenTicket(ticket.id)}
            member1Name={member1Name}
            member2Name={member2Name}
          />
        ))}
        {byStatus[mobileColumn].length === 0 && (
          <button
            onClick={() => onAddTicket(mobileColumn)}
            className="w-full py-6 border-2 border-dashed border-white/40 rounded-xl text-sm text-white/70 hover:border-white/60 hover:text-white transition-colors"
          >
            + Add a card to {COLUMNS.find(c => c.status === mobileColumn)?.label}
          </button>
        )}
      </div>

      {/* ── Desktop: DnD Kanban ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="hidden md:flex gap-3 overflow-x-auto pb-4 no-scrollbar items-start">
          {COLUMNS.map(({ status, label }) => (
            <KanbanColumn
              key={status}
              status={status}
              label={label}
              tickets={byStatus[status]}
              onOpenTicket={onOpenTicket}
              onAddTicket={onAddTicket}
              member1Name={member1Name}
              member2Name={member2Name}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTicket && (
            <div className="rotate-2 shadow-2xl w-[272px]">
              <TicketCard
                ticket={activeTicket}
                onClick={() => {}}
                member1Name={member1Name}
                member2Name={member2Name}
                dragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  )
}
