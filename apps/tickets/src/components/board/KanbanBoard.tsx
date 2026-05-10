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

const COLUMN_COLORS: Record<Status, string> = {
  backlog: 'text-gray-500',
  todo: 'text-blue-600',
  in_progress: 'text-amber-600',
  waiting: 'text-purple-600',
  done: 'text-green-600',
}

const COLUMN_BG: Record<Status, string> = {
  backlog: 'bg-gray-50',
  todo: 'bg-blue-50/50',
  in_progress: 'bg-amber-50/50',
  waiting: 'bg-purple-50/50',
  done: 'bg-green-50/50',
}

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
    opacity: isDragging ? 0.3 : 1,
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

function KanbanColumn({
  status, label, tickets, onOpenTicket, onAddTicket, member1Name, member2Name,
}: KanbanColumnProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`flex flex-col w-72 flex-shrink-0 rounded-xl ${COLUMN_BG[status]}`}>
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`text-sm font-semibold ${COLUMN_COLORS[status]} flex items-center gap-1.5`}
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {label}
        </button>
        <span className="text-xs text-gray-400 font-medium bg-gray-200/60 px-1.5 py-0.5 rounded-full">
          {tickets.length}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => onAddTicket(status)}
          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          aria-label={`Add ticket to ${label}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      {!collapsed && (
        <div className="flex-1 px-2 pb-3 min-h-[60px]">
          <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <SortableTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onOpenTicket={onOpenTicket}
                  member1Name={member1Name}
                  member2Name={member2Name}
                />
              ))}
              {tickets.length === 0 && (
                <button
                  onClick={() => onAddTicket(status)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
                >
                  + Add ticket
                </button>
              )}
            </div>
          </SortableContext>
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) =>
      updateTicket(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', spaceId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => addToast('Failed to move ticket', 'error'),
  })

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filters?.assignee && t.assignee !== filters.assignee) return false
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
    for (const t of filteredTickets) {
      map[t.status].push(t)
    }
    return map
  }, [filteredTickets])

  function handleDragStart(event: DragStartEvent) {
    const ticket = tickets.find((t) => t.id === event.active.id)
    setActiveTicket(ticket ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTicket(null)
    if (!over) return

    const draggedTicket = tickets.find((t) => t.id === active.id)
    if (!draggedTicket) return

    // Determine target status — over could be a column or another ticket
    let targetStatus: Status | null = null

    // Check if over is a status (column drop area uses status as id)
    const columnStatuses = COLUMNS.map((c) => c.status) as string[]
    if (columnStatuses.includes(String(over.id))) {
      targetStatus = over.id as Status
    } else {
      // over is a ticket id — find its status
      const overTicket = tickets.find((t) => t.id === over.id)
      if (overTicket) targetStatus = overTicket.status
    }

    if (targetStatus && targetStatus !== draggedTicket.status) {
      // Optimistically update
      queryClient.setQueryData<TicketListItem[]>(
        ['tickets', spaceId],
        (old) => old?.map((t) => t.id === draggedTicket.id ? { ...t, status: targetStatus! } : t) ?? [],
      )
      updateMut.mutate({ id: draggedTicket.id, status: targetStatus })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar min-h-0">
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
          <div className="rotate-2 shadow-xl w-72">
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
  )
}
