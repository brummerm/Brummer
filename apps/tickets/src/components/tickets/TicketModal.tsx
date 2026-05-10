import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import {
  getTicket, updateTicket, deleteTicket, completeTicket,
  addChecklistItem, updateChecklistItem, deleteChecklistItem,
  addComment, deleteComment,
  getLabels, getSpaces,
  Ticket, Status, Priority, Assignee,
} from '../../api/tickets'
import { StatusBadge, PriorityBadge, STATUS_OPTIONS, PRIORITY_OPTIONS, LabelBadge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'

interface TicketModalProps {
  ticketId: number | null
  defaultValues?: Partial<{ space_id: number; status: Status; priority: Priority }>
  onClose: () => void
  onCreated?: (ticket: Ticket) => void
}

const EFFORT_OPTIONS = ['', 'small', 'medium', 'large']
const RECURRENCE_OPTIONS = [
  { value: '', label: 'No recurrence' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{children}</h3>
}

export function TicketModal({ ticketId, onClose, onCreated }: TicketModalProps) {
  const queryClient = useQueryClient()
  const { member1Name, member2Name } = useSettings()
  const { addToast } = useToast()
  const [activityOpen, setActivityOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newComment, setNewComment] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket(ticketId!),
    enabled: ticketId !== null,
  })

  const { data: labels = [] } = useQuery({ queryKey: ['labels'], queryFn: getLabels })
  const { data: spaces = [] } = useQuery({ queryKey: ['spaces'], queryFn: () => getSpaces(false) })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const updateMut = useMutation({
    mutationFn: (payload: Parameters<typeof updateTicket>[1]) => updateTicket(ticketId!, payload),
    onSuccess: () => invalidate(),
    onError: () => addToast('Failed to update ticket', 'error'),
  })

  const deleteMut = useMutation({
    mutationFn: () => deleteTicket(ticketId!),
    onSuccess: () => { invalidate(); onClose() },
    onError: () => addToast('Failed to delete ticket', 'error'),
  })

  const completeMut = useMutation({
    mutationFn: () => completeTicket(ticketId!),
    onSuccess: () => { invalidate(); addToast('Ticket completed!', 'success'); onClose() },
    onError: () => addToast('Failed to complete ticket', 'error'),
  })

  const addCheckMut = useMutation({
    mutationFn: (content: string) => addChecklistItem(ticketId!, content),
    onSuccess: () => { invalidate(); setNewChecklistItem('') },
  })

  const toggleCheckMut = useMutation({
    mutationFn: ({ itemId, is_done }: { itemId: number; is_done: boolean }) =>
      updateChecklistItem(ticketId!, itemId, { is_done }),
    onSuccess: () => invalidate(),
  })

  const deleteCheckMut = useMutation({
    mutationFn: (itemId: number) => deleteChecklistItem(ticketId!, itemId),
    onSuccess: () => invalidate(),
  })

  const addCommentMut = useMutation({
    mutationFn: (content: string) => addComment(ticketId!, content, member1Name),
    onSuccess: () => { invalidate(); setNewComment('') },
  })

  const deleteCommentMut = useMutation({
    mutationFn: (commentId: number) => deleteComment(ticketId!, commentId),
    onSuccess: () => invalidate(),
  })

  // Trap focus — close on Escape is handled by parent Modal
  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [editingTitle])

  if (!ticketId) return null

  if (isLoading || !ticket) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl p-8">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  const space = spaces.find((s) => s.id === ticket.space_id)
  const doneDoneCount = ticket.checklist.filter((c) => c.is_done).length
  const recurrenceValue =
    ticket.recurrence_json ? (() => { try { return JSON.parse(ticket.recurrence_json).frequency ?? '' } catch { return '' } })() : ''

  const handleFieldUpdate = (field: Parameters<typeof updateTicket>[1]) => {
    updateMut.mutate(field)
  }

  const handleLabelToggle = (labelId: number) => {
    const current = ticket.labels.map((l) => l.id)
    const next = current.includes(labelId)
      ? current.filter((id) => id !== labelId)
      : [...current, labelId]
    updateMut.mutate({ label_ids: next })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-4xl h-full bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden">

        {/* ── Main panel ── */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6">
          {/* Close button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {space && (
                <>
                  <span style={{ color: space.color }}>{space.icon}</span>
                  <span>{space.name}</span>
                  <span>›</span>
                </>
              )}
              <span className="font-mono">#{ticket.id}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Title */}
          {editingTitle ? (
            <textarea
              ref={titleRef}
              defaultValue={ticket.title}
              onBlur={(e) => {
                const val = e.target.value.trim()
                if (val && val !== ticket.title) handleFieldUpdate({ title: val })
                setEditingTitle(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.blur()
                }
                if (e.key === 'Escape') {
                  setEditingTitle(false)
                }
              }}
              rows={2}
              className="w-full text-xl font-semibold text-gray-900 border border-brand-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-xl font-semibold text-gray-900 cursor-text hover:bg-gray-50 rounded-lg p-2 -ml-2 -mr-2 transition-colors leading-snug"
            >
              {ticket.title}
            </h2>
          )}

          {/* Status selector */}
          <div className="flex items-center gap-3 mt-3 mb-5">
            <select
              value={ticket.status}
              onChange={(e) => handleFieldUpdate({ status: e.target.value as Status })}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-5">
            <SectionHeader>Description</SectionHeader>
            {editingDesc ? (
              <textarea
                defaultValue={ticket.description ?? ''}
                onBlur={(e) => {
                  const val = e.target.value.trim() || null
                  handleFieldUpdate({ description: val })
                  setEditingDesc(false)
                }}
                onKeyDown={(e) => { if (e.key === 'Escape') setEditingDesc(false) }}
                autoFocus
                rows={5}
                placeholder="Add a description…"
                className="w-full text-sm text-gray-700 border border-brand-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                className="text-sm text-gray-600 cursor-text hover:bg-gray-50 rounded-lg p-3 -ml-3 -mr-3 min-h-[60px] transition-colors whitespace-pre-wrap"
              >
                {ticket.description || <span className="text-gray-400 italic">Add a description…</span>}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <SectionHeader>
                Checklist {ticket.checklist.length > 0 && `(${doneDoneCount}/${ticket.checklist.length})`}
              </SectionHeader>
            </div>
            {ticket.checklist.length > 0 && (
              <div className="mb-2">
                <div className="w-full bg-gray-100 rounded-full h-1 mb-3">
                  <div
                    className="bg-brand-500 h-1 rounded-full transition-all"
                    style={{ width: `${(doneDoneCount / ticket.checklist.length) * 100}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {ticket.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group/item">
                      <input
                        type="checkbox"
                        checked={item.is_done}
                        onChange={(e) => toggleCheckMut.mutate({ itemId: item.id, is_done: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className={`text-sm flex-1 ${item.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.content}
                      </span>
                      <button
                        onClick={() => deleteCheckMut.mutate(item.id)}
                        className="opacity-0 group-hover/item:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (newChecklistItem.trim()) addCheckMut.mutate(newChecklistItem.trim())
              }}
              className="flex gap-2"
            >
              <input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add checklist item…"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <button
                type="submit"
                disabled={!newChecklistItem.trim()}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {/* Comments */}
          <div className="mb-5">
            <SectionHeader>Comments ({ticket.comments.length})</SectionHeader>
            {ticket.comments.length > 0 && (
              <div className="space-y-3 mb-3">
                {ticket.comments.map((c) => (
                  <div key={c.id} className="flex gap-2 group/comment">
                    <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {c.author[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-700">{c.author}</span>
                        <span className="text-xs text-gray-400">{format(parseISO(c.created_at), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                    <button
                      onClick={() => deleteCommentMut.mutate(c.id)}
                      className="opacity-0 group-hover/comment:opacity-100 text-gray-300 hover:text-red-400 transition-all self-start mt-0.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (newComment.trim()) addCommentMut.mutate(newComment.trim())
              }}
              className="flex gap-2"
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && newComment.trim()) {
                    e.preventDefault()
                    addCommentMut.mutate(newComment.trim())
                  }
                }}
                placeholder="Write a comment… (⌘+Enter to submit)"
                rows={2}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-3 py-1.5 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-40 transition-colors self-end"
              >
                Post
              </button>
            </form>
          </div>

          {/* Activity log (collapsible) */}
          <div>
            <button
              onClick={() => setActivityOpen((o) => !o)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors mb-2"
            >
              <svg
                className={`w-3 h-3 transition-transform ${activityOpen ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Activity ({ticket.activity.length})
            </button>
            {activityOpen && (
              <div className="space-y-2">
                {ticket.activity.map((log) => (
                  <div key={log.id} className="flex gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-600">{log.actor}</span>
                    <span>{log.action}</span>
                    {log.field && <span className="text-gray-400">{log.field}</span>}
                    {log.old_value && log.new_value && (
                      <span className="text-gray-400">{log.old_value} → {log.new_value}</span>
                    )}
                    <span className="ml-auto text-gray-300">{format(parseISO(log.created_at), 'MMM d')}</span>
                  </div>
                ))}
                {ticket.activity.length === 0 && (
                  <p className="text-xs text-gray-400">No activity yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Metadata panel ── */}
        <div className="w-full md:w-64 lg:w-72 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50 p-5 overflow-y-auto flex-shrink-0">

          {/* Actions */}
          <div className="mb-5 space-y-2">
            <button
              onClick={() => completeMut.mutate()}
              disabled={ticket.status === 'done' || completeMut.isPending}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
            >
              {completeMut.isPending ? <Spinner size="sm" /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {ticket.status === 'done' ? 'Already done' : 'Mark Complete'}
            </button>

            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => deleteMut.mutate()}
                  className="flex-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 px-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full px-3 py-2 border border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-500 text-sm rounded-lg transition-colors"
              >
                Delete ticket
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Priority */}
            <div>
              <SectionHeader>Priority</SectionHeader>
              <select
                value={ticket.priority}
                onChange={(e) => handleFieldUpdate({ priority: e.target.value as Priority })}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <SectionHeader>Assignee</SectionHeader>
              <select
                value={ticket.assignee ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  handleFieldUpdate({ assignee: (v === '' ? null : v) as Assignee })
                }}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="">Unassigned</option>
                <option value="me">{member1Name}</option>
                <option value="partner">{member2Name}</option>
                <option value="shared">👥 Both (Shared)</option>
              </select>
            </div>

            {/* Reporter */}
            <div>
              <SectionHeader>Reporter</SectionHeader>
              <p className="text-sm text-gray-700">{ticket.reporter}</p>
            </div>

            {/* Due date */}
            <div>
              <SectionHeader>Due Date</SectionHeader>
              <input
                type="date"
                value={ticket.due_date ? ticket.due_date.slice(0, 10) : ''}
                onChange={(e) => handleFieldUpdate({ due_date: e.target.value || null })}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            {/* Labels */}
            <div>
              <SectionHeader>Labels</SectionHeader>
              <div className="flex flex-wrap gap-1 mb-2">
                {ticket.labels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLabelToggle(l.id)}
                    className="group relative"
                  >
                    <LabelBadge label={l} />
                    <span className="absolute -top-0.5 -right-0.5 hidden group-hover:flex w-3 h-3 bg-red-500 rounded-full items-center justify-center text-white text-[8px]">×</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {labels
                  .filter((l) => !ticket.labels.find((tl) => tl.id === l.id))
                  .map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleLabelToggle(l.id)}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-dashed text-gray-400 hover:opacity-80 transition-opacity"
                      style={{ borderColor: l.color + '80' }}
                    >
                      + {l.name}
                    </button>
                  ))}
              </div>
            </div>

            {/* Effort */}
            <div>
              <SectionHeader>Effort</SectionHeader>
              <select
                value={ticket.effort ?? ''}
                onChange={(e) => handleFieldUpdate({ effort: e.target.value || null })}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {EFFORT_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o || 'Not set'}</option>
                ))}
              </select>
            </div>

            {/* Recurrence */}
            <div>
              <SectionHeader>Recurrence</SectionHeader>
              <select
                value={recurrenceValue}
                onChange={(e) => {
                  const v = e.target.value
                  handleFieldUpdate({ recurrence_json: v ? JSON.stringify({ frequency: v }) : null })
                }}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                {RECURRENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div>
              <SectionHeader>Dates</SectionHeader>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{format(parseISO(ticket.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span>{format(parseISO(ticket.updated_at), 'MMM d, yyyy')}</span>
                </div>
                {ticket.completed_at && (
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span>{format(parseISO(ticket.completed_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
