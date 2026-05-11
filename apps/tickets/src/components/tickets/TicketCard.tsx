import { format, parseISO, isPast, isToday } from 'date-fns'
import { TicketListItem } from '../../api/tickets'

interface TicketCardProps {
  ticket: TicketListItem
  onClick: () => void
  member1Name: string
  member2Name: string
  dragging?: boolean
}

// Trello-style priority color bar (only for urgent/high — Trello doesn't spam the UI)
const PRIORITY_BAR: Partial<Record<string, string>> = {
  urgent: '#ef4444',
  high: '#f97316',
}

function AssigneeAvatar({
  assignee,
  member1Name,
  member2Name,
}: {
  assignee: TicketListItem['assignee']
  member1Name: string
  member2Name: string
}) {
  if (!assignee) return null
  if (assignee === 'shared') {
    return (
      <span
        title="Shared — both"
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 bg-violet-100 text-violet-700 font-medium border-2 border-white"
      >
        👥
      </span>
    )
  }
  const name = assignee === 'me' ? member1Name : member2Name
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const bg = assignee === 'me' ? '#0079bf' : '#61bd4f'
  return (
    <span
      title={name}
      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white border-2 border-white"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </span>
  )
}

export function TicketCard({ ticket, onClick, member1Name, member2Name, dragging }: TicketCardProps) {
  const dueDate = ticket.due_date ? parseISO(ticket.due_date) : null
  const done = ticket.status === 'done'

  const dueBg = dueDate && !done
    ? isToday(dueDate)
      ? 'bg-amber-400 text-white'
      : isPast(dueDate)
      ? 'bg-red-500 text-white'
      : 'bg-gray-100 text-gray-600'
    : done && dueDate
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-600'

  const priorityBar = PRIORITY_BAR[ticket.priority]

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-md cursor-pointer hover:brightness-95 transition-all group relative overflow-hidden ${
        dragging ? 'shadow-xl rotate-2 opacity-90' : 'shadow-sm hover:shadow'
      } ${done ? 'opacity-60' : ''}`}
    >
      {/* Priority accent bar — left edge, Trello-card-cover style */}
      {priorityBar && !done && (
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-md" style={{ backgroundColor: priorityBar }} />
      )}

      {/* Label strips — colored bars like Trello */}
      {ticket.labels.length > 0 && (
        <div className={`flex flex-wrap gap-1 px-2 ${priorityBar && !done ? 'pt-3' : 'pt-2'}`}>
          {ticket.labels.map((label) => (
            <div
              key={label.id}
              className="h-2 min-w-[40px] rounded-full"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <div className={`px-3 ${ticket.labels.length > 0 || (priorityBar && !done) ? 'pt-1.5' : 'pt-2.5'} pb-1`}>
        <p className={`text-sm text-[#172b4d] leading-snug line-clamp-3 ${done ? 'line-through' : ''}`}>
          {ticket.title}
        </p>
      </div>

      {/* Footer — metadata row */}
      <div className="px-3 pb-2 flex items-center flex-wrap gap-1.5 mt-1">
        {/* Recurrence */}
        {ticket.recurrence_json && (
          <span title="Recurring" className="text-[#5e6c84] text-xs leading-none">🔁</span>
        )}

        {/* Due date chip */}
        {dueDate && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded ${dueBg}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isToday(dueDate) ? 'Today' : format(dueDate, 'MMM d')}
          </span>
        )}

        {/* Checklist */}
        {ticket.checklist_count > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[11px] text-[#5e6c84] bg-gray-100 px-1.5 py-0.5 rounded">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {ticket.checklist_count}
          </span>
        )}

        {/* Comments */}
        {ticket.comment_count > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[11px] text-[#5e6c84] bg-gray-100 px-1.5 py-0.5 rounded">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {ticket.comment_count}
          </span>
        )}

        <div className="flex-1" />

        {/* Assignee avatar */}
        <AssigneeAvatar assignee={ticket.assignee} member1Name={member1Name} member2Name={member2Name} />
      </div>
    </div>
  )
}
