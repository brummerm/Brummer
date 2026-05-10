import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTicket, getSpaces, Status, Priority, Assignee } from '../../api/tickets'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
  defaultSpaceId?: number
  defaultStatus?: Status
}

export function QuickAddModal({ open, onClose, defaultSpaceId, defaultStatus }: QuickAddModalProps) {
  const queryClient = useQueryClient()
  const { member1Name, member2Name } = useSettings()
  const { addToast } = useToast()

  const [title, setTitle] = useState('')
  const [spaceId, setSpaceId] = useState<number | ''>(defaultSpaceId ?? '')
  const [status, setStatus] = useState<Status>(defaultStatus ?? 'todo')
  const [priority, setPriority] = useState<Priority>('medium')
  const [assignee, setAssignee] = useState<Assignee>(null)
  const [dueDate, setDueDate] = useState('')

  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => getSpaces(false),
    enabled: open,
  })

  const createMut = useMutation({
    mutationFn: () =>
      createTicket({
        space_id: spaceId as number,
        title: title.trim(),
        status,
        priority,
        assignee,
        due_date: dueDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      addToast('Ticket created!', 'success')
      setTitle('')
      setDueDate('')
      onClose()
    },
    onError: () => addToast('Failed to create ticket', 'error'),
  })

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">New Ticket</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim() || !spaceId) return
            createMut.mutate()
          }}
          className="space-y-4"
        >
          {/* Title */}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ticket title…"
            className="w-full text-base border-0 border-b-2 border-gray-200 focus:border-brand-500 px-0 py-2 focus:outline-none transition-colors"
          />

          {/* Space */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Space *</label>
              <select
                value={spaceId}
                onChange={(e) => setSpaceId(Number(e.target.value))}
                required
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="">Select space…</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <select
                value={assignee ?? ''}
                onChange={(e) => setAssignee((e.target.value || null) as Assignee)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="">Unassigned</option>
                <option value="me">{member1Name}</option>
                <option value="partner">{member2Name}</option>
                <option value="shared">👥 Both (Shared)</option>
              </select>
            </div>

            {/* Due date */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !spaceId || createMut.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
            >
              {createMut.isPending && <Spinner size="sm" />}
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
