import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TicketListItem, Status, updateTicket } from '../../api/tickets'
import { TicketCard } from '../tickets/TicketCard'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'

const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: 'backlog',     label: 'Backlog',     color: '#64748b' },
  { status: 'todo',        label: 'To Do',       color: '#3b82f6' },
  { status: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { status: 'waiting',     label: 'Waiting',     color: '#8b5cf6' },
  { status: 'done',        label: 'Done',        color: '#22c55e' },
]

// ── Sortable card wrapper ─────────────────────────────────────────────────────

interface SortableTicketCardProps {
  ticket: TicketListItem
  onOpenTicket: (id: number) => void
  member1Name: string
  member2Name: string
}

function SortableTicketCard({ ticket, onOpenTicket, member1Name, member2Name }: SortableTicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { type: 'ticket', ticket, status: ticket.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
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

// ── Kanban column ─────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  status: Status
  label: string
  accentColor: string
  tickets: TicketListItem[]
  isOver: boolean
  onOpenTicket: (id: number) => void
  onAddTicket: (status: Status) => void
  member1Name: string
  member2Name: string
}

function KanbanColumn({
  status, label, accentColor, tickets, isOver,
  onOpenTicket, onAddTicket, member1Name, member2Name,
}: KanbanColumnProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Register the entire column as a drop target so empty columns work
  const { setNodeRef: setDropRef } = useDroppable({ id: status, data: { type: 'column', status } })

  return (
    <div
      className="flex flex-col w-[272px] flex-shrink-0 rounded-xl transition-all duration-150"
      style={{
        backgroundColor: isOver ? '#dce8f5' : '#ebecf0',
        outline: isOver ? `2px solid ${accentColor}` : '2px solid transparent',
        outlineOffset: '2px',
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        {/* Accent dot */}
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
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
          {/* Cards area — also the droppable ref so the whole empty space is a target */}
          <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div
              ref={setDropRef}
              className="overflow-y-auto px-2 space-y-2 flex-1"
              style={{ maxHeight: 'calc(100vh - 220px)', minHeight: '40px' }}
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
              {/* Ghost drop target shown when column is empty and being hovered */}
              {tickets.length === 0 && isOver && (
                <div className="h-16 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center">
                  <span className="text-xs text-blue-400 font-medium">Drop here</span>
                </div>
              )}
            </div>
          </SortableContext>

          {/* Add a card */}
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

// ── Mobile move-to menu ───────────────────────────────────────────────────────

interface MobileTicketRowProps {
  ticket: TicketListItem
  onOpenTicket: (id: number) => void
  onMoveTicket: (id: number, status: Status) => void
  member1Name: string
  member2Name: string
}

function MobileTicketRow({ ticket, onOpenTicket, onMoveTicket, member1Name, member2Name }: MobileTicketRowProps) {
  const [showMove, setShowMove] = useState(false)
  const otherColumns = COLUMNS.filter(c => c.status !== ticket.status)

  return (
    <div className="relative">
      <TicketCard
        ticket={ticket}
        onClick={() => onOpenTicket(ticket.id)}
        member1Name={member1Name}
        member2Name={member2Name}
      />
      {/* Move button — small pill in the top-right corner of the card */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowMove(s => !s) }}
        className="absolute top-2 right-2 text-[10px] font-semibold text-[#5e6c84] bg-[#dfe1e6] hover:bg-[#c1c7d0] px-2 py-0.5 rounded-full transition-colors z-10"
        title="Move to…"
      >
        Move ▾
      </button>
      {showMove && (
        <div className="absolute top-8 right-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
          <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Move to</p>
          {otherColumns.map(col => (
            <button
              key={col.status}
              onClick={(e) => { e.stopPropagation(); onMoveTicket(ticket.id, col.status); setShowMove(false) }}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

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
  const [overColumnId, setOverColumnId] = useState<Status | null>(null)
  const [mobileColumn, setMobileColumn] = useState<Status>('todo')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) =>
      updateTicket(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', spaceId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => {
      // Roll back optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['tickets', spaceId] })
      addToast('Failed to move card', 'error')
    },
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
    const map: Record<Status, TicketListItem[]> = {
      backlog: [], todo: [], in_progress: [], waiting: [], done: [],
    }
    for (const t of filteredTickets) map[t.status].push(t)
    return map
  }, [filteredTickets])

  // Resolve which column a dragged card is currently hovering over
  function resolveColumnId(overId: string | number | null): Status | null {
    if (!overId) return null
    const columnStatuses = COLUMNS.map(c => c.status)
    if (columnStatuses.includes(String(overId) as Status)) return String(overId) as Status
    const overTicket = tickets.find(t => t.id === overId)
    return overTicket ? overTicket.status : null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTicket(tickets.find(t => t.id === event.active.id) ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    setOverColumnId(resolveColumnId(event.over?.id ?? null))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTicket(null)
    setOverColumnId(null)
    if (!over) return

    const draggedTicket = tickets.find(t => t.id === active.id)
    if (!draggedTicket) return

    const targetStatus = resolveColumnId(over.id)
    if (targetStatus && targetStatus !== draggedTicket.status) {
      // Optimistic update for instant feedback
      queryClient.setQueryData<TicketListItem[]>(
        ['tickets', spaceId],
        old => old?.map(t => t.id === draggedTicket.id ? { ...t, status: targetStatus } : t) ?? [],
      )
      updateMut.mutate({ id: draggedTicket.id, status: targetStatus })
    }
  }

  function handleMoveTicket(id: number, status: Status) {
    const ticket = tickets.find(t => t.id === id)
    if (!ticket || ticket.status === status) return
    queryClient.setQueryData<TicketListItem[]>(
      ['tickets', spaceId],
      old => old?.map(t => t.id === id ? { ...t, status } : t) ?? [],
    )
    updateMut.mutate({ id, status })
  }

  return (
    <>
      {/* ── Mobile: column tab strip ── */}
      <div className="md:hidden flex overflow-x-auto no-scrollbar -mx-4 px-2 flex-shrink-0 mb-3">
        {COLUMNS.map(({ status, label, color }) => {
          const count = byStatus[status].length
          const isActive = mobileColumn === status
          return (
            <button
              key={status}
              onClick={() => setMobileColumn(status)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full mr-1.5 transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#172b4d] shadow-sm'
                  : 'bg-white/25 text-white/90 hover:bg-white/40'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: isActive ? color : 'rgba(255,255,255,0.6)' }}
              />
              {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  isActive ? 'bg-[#ebecf0] text-[#5e6c84]' : 'bg-white/30 text-white'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Mobile: single column with Move button ── */}
      <div className="md:hidden space-y-2">
        {byStatus[mobileColumn].map(ticket => (
          <MobileTicketRow
            key={ticket.id}
            ticket={ticket}
            onOpenTicket={onOpenTicket}
            onMoveTicket={handleMoveTicket}
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
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="hidden md:flex gap-3 overflow-x-auto pb-4 no-scrollbar items-start">
          {COLUMNS.map(({ status, label, color }) => (
            <KanbanColumn
              key={status}
              status={status}
              label={label}
              accentColor={color}
              tickets={byStatus[status]}
              isOver={overColumnId === status}
              onOpenTicket={onOpenTicket}
              onAddTicket={onAddTicket}
              member1Name={member1Name}
              member2Name={member2Name}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
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
