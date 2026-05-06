import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTags, createTag, updateTag, deleteTag } from '../api/journal'
import type { Tag } from '../types/journal'

export default function TagsPage() {
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6aa2ff')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  const { data: tags = [], isLoading } = useQuery({ queryKey: ['tags'], queryFn: getTags })

  const createMut = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] })
      setNewName('')
      setNewColor('#6aa2ff')
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; color?: string } }) =>
      updateTag(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })

  const startEditing = (tag: Tag) => {
    setEditingId(tag.id)
    setEditingName(tag.name)
  }

  const commitName = (tag: Tag) => {
    if (editingName.trim() && editingName !== tag.name) {
      updateMut.mutate({ id: tag.id, data: { name: editingName.trim() } })
    }
    setEditingId(null)
  }

  const handleColorChange = (tag: Tag, color: string) => {
    updateMut.mutate({ id: tag.id, data: { color } })
  }

  const handleDelete = (tag: Tag) => {
    if (window.confirm(`Delete tag "${tag.name}"? It will be removed from all notes.`)) {
      deleteMut.mutate(tag.id)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Tags</h1>

      {/* Create tag form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Create Tag</h2>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="w-9 h-9 rounded cursor-pointer border border-gray-200"
            title="Tag color"
          />
          <input
            type="text"
            placeholder="Tag name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newName.trim()) {
                createMut.mutate({ name: newName.trim(), color: newColor })
              }
            }}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            onClick={() => newName.trim() && createMut.mutate({ name: newName.trim(), color: newColor })}
            disabled={!newName.trim() || createMut.isPending}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tag list */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading tags…</p>
      ) : tags.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No tags yet. Create one above.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-4 px-4 py-3">
              {/* Color swatch / picker */}
              <label className="cursor-pointer" title="Change color">
                <span
                  className="block w-7 h-7 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: tag.color }}
                />
                <input
                  type="color"
                  value={tag.color}
                  onChange={e => handleColorChange(tag, e.target.value)}
                  className="sr-only"
                />
              </label>

              {/* Name (inline edit) */}
              <div className="flex-1 min-w-0">
                {editingId === tag.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={() => commitName(tag)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitName(tag)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full border border-brand-400 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                  />
                ) : (
                  <button
                    onClick={() => startEditing(tag)}
                    className="text-sm font-medium text-gray-800 hover:text-brand-600 transition-colors text-left"
                    title="Click to rename"
                  >
                    {tag.name}
                  </button>
                )}
              </div>

              {/* Note count badge */}
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                {tag.note_count ?? 0} {tag.note_count === 1 ? 'note' : 'notes'}
              </span>

              {/* Delete */}
              <button
                onClick={() => handleDelete(tag)}
                disabled={deleteMut.isPending}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete tag"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
