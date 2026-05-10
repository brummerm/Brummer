import { Status, Priority, Label } from '../../api/tickets'

// ─── Status ───────────────────────────────────────────────────────────────────

const statusConfig: Record<Status, { label: string; class: string }> = {
  backlog: { label: 'Backlog', class: 'bg-gray-100 text-gray-700' },
  todo: { label: 'To Do', class: 'bg-blue-50 text-blue-700' },
  in_progress: { label: 'In Progress', class: 'bg-amber-50 text-amber-700' },
  waiting: { label: 'Waiting', class: 'bg-purple-50 text-purple-700' },
  done: { label: 'Done', class: 'bg-green-50 text-green-700' },
}

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.class}`}>
      {cfg.label}
    </span>
  )
}

// ─── Priority ─────────────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; class: string; dot: string }> = {
  low: { label: 'Low', class: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  medium: { label: 'Medium', class: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  high: { label: 'High', class: 'bg-orange-50 text-orange-700', dot: 'bg-orange-400' },
  urgent: { label: 'Urgent', class: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${cfg.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function PriorityDot({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority]
  return <span title={cfg.label} className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
}

// ─── Label ────────────────────────────────────────────────────────────────────

export function LabelBadge({ label }: { label: Label }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: label.color }}
    >
      {label.name}
    </span>
  )
}

// ─── Status options for dropdowns ─────────────────────────────────────────────

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'done', label: 'Done' },
]

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]
