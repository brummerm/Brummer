import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getSpaces, createSpace, updateSpace, Space } from '../api/tickets'
import { PageSpinner } from '../components/ui/Spinner'
import { useToast } from '../context/ToastContext'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b', '#a3a3a3',
]

const PRESET_ICONS = ['🏠', '🛒', '🔧', '💡', '🌱', '💰', '🚗', '📋', '🎯', '🏥', '📦', '🧹', '🍳', '🐾', '📅', '⚡']

interface SpaceFormData {
  name: string
  description: string
  icon: string
  color: string
}

function SpaceFormModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: Partial<SpaceFormData>
  onSave: (data: SpaceFormData) => void
  onClose: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<SpaceFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    icon: initial?.icon ?? '📋',
    color: initial?.color ?? '#6366f1',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {initial?.name ? 'Edit Space' : 'New Space'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onSave(form) }} className="space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span
              className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: form.color + '20' }}
            >
              {form.icon}
            </span>
            <span className="font-semibold text-gray-900">{form.name || 'Space name'}</span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Kitchen, Garden, Budget…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                    form.icon === icon ? 'ring-2 ring-brand-500 bg-brand-50' : 'hover:bg-gray-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-6 h-6 rounded-full transition-all ${
                    form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || saving}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SpaceCard({
  space,
  onEdit,
  onArchive,
  onUnarchive,
}: {
  space: Space
  onEdit: (s: Space) => void
  onArchive: (s: Space) => void
  onUnarchive: (s: Space) => void
}) {
  const [confirmArchive, setConfirmArchive] = useState(false)

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all ${space.is_archived ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        <span
          className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: space.color + '20' }}
        >
          {space.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{space.name}</h3>
            {space.is_archived && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Archived</span>
            )}
          </div>
          {space.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{space.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{space.ticket_count} tickets</span>
        <div className="flex items-center gap-1">
          {!space.is_archived && (
            <Link
              to={`/apps/tickets/board/${space.id}`}
              className="text-xs text-brand-600 hover:text-brand-700 px-2 py-1 rounded hover:bg-brand-50 transition-colors"
            >
              Open
            </Link>
          )}
          <button
            onClick={() => onEdit(space)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Edit
          </button>
          {space.is_archived ? (
            <button
              onClick={() => onUnarchive(space)}
              className="text-xs text-gray-500 hover:text-green-600 px-2 py-1 rounded hover:bg-green-50 transition-colors"
            >
              Unarchive
            </button>
          ) : (
            confirmArchive ? (
              <div className="flex gap-1">
                <button
                  onClick={() => { onArchive(space); setConfirmArchive(false) }}
                  className="text-xs text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmArchive(false)}
                  className="text-xs text-gray-400 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmArchive(true)}
                className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Archive
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export function SpacesPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['spaces', showArchived],
    queryFn: () => getSpaces(showArchived),
  })

  const createMut = useMutation({
    mutationFn: createSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      setShowCreate(false)
      addToast('Space created!', 'success')
    },
    onError: () => addToast('Failed to create space', 'error'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateSpace>[1] }) =>
      updateSpace(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      setEditingSpace(null)
      addToast('Space updated!', 'success')
    },
    onError: () => addToast('Failed to update space', 'error'),
  })

  if (isLoading) return <PageSpinner />

  const active = spaces.filter((s) => !s.is_archived && !s.is_completed_archive)
  const archived = spaces.filter((s) => s.is_archived && !s.is_completed_archive)
  const completedArchive = spaces.find((s) => s.is_completed_archive)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spaces</h1>
          <p className="text-sm text-gray-500 mt-0.5">{active.length} active spaces</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Space
        </button>
      </div>

      {active.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-base font-medium text-gray-500 mb-1">No spaces yet</p>
          <p className="text-sm mb-4">Create a space to organise your household tasks</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Create first space
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {active.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onEdit={setEditingSpace}
            onArchive={(s) => updateMut.mutate({ id: s.id, payload: { is_archived: true } })}
            onUnarchive={(s) => updateMut.mutate({ id: s.id, payload: { is_archived: false } })}
          />
        ))}
      </div>

      {/* Archived section */}
      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived((o) => !o)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-3"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showArchived ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Archived ({archived.length})
          </button>
          {showArchived && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {archived.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onEdit={setEditingSpace}
                  onArchive={(s) => updateMut.mutate({ id: s.id, payload: { is_archived: true } })}
                  onUnarchive={(s) => updateMut.mutate({ id: s.id, payload: { is_archived: false } })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed-ticket archive */}
      {completedArchive && (
        <div className="border-t border-gray-100 pt-6 mt-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Auto-Archive</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <span
              className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: completedArchive.color + '20' }}
            >
              {completedArchive.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{completedArchive.name}</h3>
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Auto-managed</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Completed tickets are automatically moved here 30 days after being marked done.
                Tickets here are read-only and kept for reference.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-gray-500">{completedArchive.ticket_count} tickets</span>
                <Link
                  to={`/apps/tickets/list/${completedArchive.id}`}
                  className="text-xs text-brand-600 hover:text-brand-700 px-2 py-1 rounded hover:bg-brand-50 transition-colors"
                >
                  View all →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <SpaceFormModal
          onSave={(data) => createMut.mutate(data)}
          onClose={() => setShowCreate(false)}
          saving={createMut.isPending}
        />
      )}

      {/* Edit modal */}
      {editingSpace && (
        <SpaceFormModal
          initial={editingSpace}
          onSave={(data) => updateMut.mutate({ id: editingSpace.id, payload: data })}
          onClose={() => setEditingSpace(null)}
          saving={updateMut.isPending}
        />
      )}
    </div>
  )
}
