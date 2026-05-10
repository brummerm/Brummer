import { format, parseISO, isPast, isToday } from 'date-fns'
import { TicketListItem } from '../../api/tickets'
import { PriorityDot, LabelBadge } from '../ui/Badge'

interface TicketCardProps {
  ticket: TicketListItem
  onClick: () => void
  member1Name: string
  member2Name: string
  dragging?: boolean
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
  const name = assignee === 'me' ? member1Name : member2Name
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const color = assignee === 'me' ? 'bg-brand-100 text-brand-700' : 'bg-emerald-100 text-emerald-700'
  return (
    <span
      title={name}
      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${color}`}
    >
      {initials}
    </span>
  )
}

export function TicketCard({ ticket, onClick, member1Name, member2Name, dragging }: TicketCardProps) {
  const dueDate = ticket.due_date ? parseISO(ticket.due_date) : null
  const dueDateClass =
    dueDate && ticket.status !== 'done'
      ? isToday(dueDate)
        ? 'text-amber-600'
        : isPast(dueDate)
        ? 'text-red-600'
        : 'text-gray-400'
      : 'text-gray-400'

  const visibleLabels = ticket.labels.slice(0, 2)
  const extraLabels = ticket.labels.length - 2

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all group ${
        dragging ? 'shadow-lg rotate-1 opacity-90' : ''
      }`}
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-2">
        <PriorityDot priority={ticket.priority} />
        <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 flex-1">
          {ticket.title}
        </p>
      </div>

      {/* Labels */}
      {visibleLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {visibleLabels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
          {extraLabels > 0 && (
            <span className="text-xs text-gray-400">+{extraLabels}</span>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center gap-2 mt-2">
        {/* Recurrence */}
        {ticket.recurrence_json && (
          <span title="Recurring" className="text-gray-400 text-xs">🔁</span>
        )}

        {/* Checklist */}
        {ticket.checklist_count > 0 && (
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {ticket.checklist_count}
          </span>
        )}

        {/* Comments */}
        {ticket.comment_count > 0 && (
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {ticket.comment_count}
          </span>
        )}

        <div className="flex-1" />

        {/* Due date */}
        {dueDate && (
          <span className={`text-xs ${dueDateClass}`}>
            {isToday(dueDate) ? 'Today' : format(dueDate, 'MMM d')}
          </span>
        )}

        {/* Assignee */}
        <AssigneeAvatar
          assignee={ticket.assignee}
          member1Name={member1Name}
          member2Name={member2Name}
        />
      </div>
    </div>
  )
}
