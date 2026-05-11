import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type WorkoutTemplate,
  type WorkoutType,
} from '../api/fitness'

const typeBadge: Record<WorkoutType, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  hike: 'bg-amber-100 text-amber-800',
  custom: 'bg-purple-100 text-purple-800',
}

const WORKOUT_TYPES: WorkoutType[] = ['lift', 'run', 'rest', 'hike', 'custom']

interface ExerciseRow {
  exercise_name: string
  sets: number | null
  reps: string | null
  weight: string | null
  notes: string | null
  sort_order: number
}

function emptyEx(): ExerciseRow {
  return { exercise_name: '', sets: null, reps: null, weight: null, notes: null, sort_order: 0 }
}

interface TemplateEditorProps {
  initial?: WorkoutTemplate
  onSave: () => void
  onCancel: () => void
}

function TemplateEditor({ initial, onSave, onCancel }: TemplateEditorProps) {
  const qc = useQueryClient()
  const [name, setName] = useState(initial?.name ?? '')
  const [workoutType, setWorkoutType] = useState<WorkoutType>(initial?.workout_type as WorkoutType ?? 'lift')
  const [customLabel, setCustomLabel] = useState(initial?.custom_type_label ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [exercises, setExercises] = useState<ExerciseRow[]>(
    initial?.exercises?.length
      ? initial.exercises.map(e => ({ ...e }))
      : []
  )
  const [error, setError] = useState<string | null>(null)

  const createMut = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); onSave() },
    onError: () => setError('Failed to save template.'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateTemplate>[1] }) =>
      updateTemplate(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); onSave() },
    onError: () => setError('Failed to save template.'),
  })

  const saving = createMut.isPending || updateMut.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }
    setError(null)
    const payload = {
      name: name.trim(),
      workout_type: workoutType,
      custom_type_label: workoutType === 'custom' ? (customLabel || null) : null,
      notes: notes || null,
      exercises: exercises
        .filter(ex => ex.exercise_name.trim())
        .map((ex, i) => ({ ...ex, sort_order: i })),
    }
    if (initial) {
      updateMut.mutate({ id: initial.id, data: payload })
    } else {
      createMut.mutate(payload as Omit<WorkoutTemplate, 'id'>)
    }
  }

  function updateEx(i: number, field: keyof ExerciseRow, val: string | number | null) {
    setExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Template Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Push Day A"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
        <div className="flex flex-wrap gap-1">
          {WORKOUT_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setWorkoutType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                workoutType === t ? typeBadge[t] + ' border-current' : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {workoutType === 'custom' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Custom Label</label>
          <input
            type="text"
            value={customLabel}
            onChange={e => setCustomLabel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      )}

      {workoutType !== 'rest' && workoutType !== 'run' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Exercises</label>
          {exercises.length > 0 && (
            <div className="overflow-x-auto mb-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-200">
                    <th className="text-left py-2 pr-2 font-medium">Exercise</th>
                    <th className="text-left py-2 pr-2 font-medium w-14">Sets</th>
                    <th className="text-left py-2 pr-2 font-medium w-16">Reps</th>
                    <th className="text-left py-2 pr-2 font-medium w-20">Weight</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((ex, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1.5 pr-2">
                        <input type="text" value={ex.exercise_name}
                          onChange={e => updateEx(i, 'exercise_name', e.target.value)}
                          placeholder="Exercise name"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="number" value={ex.sets ?? ''}
                          onChange={e => updateEx(i, 'sets', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="text" value={ex.reps ?? ''}
                          onChange={e => updateEx(i, 'reps', e.target.value || null)}
                          placeholder="8-12"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="text" value={ex.weight ?? ''}
                          onChange={e => updateEx(i, 'weight', e.target.value || null)}
                          placeholder="135 lbs"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5">
                        <button type="button" onClick={() => setExercises(p => p.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button type="button" onClick={() => setExercises(p => [...p, emptyEx()])}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            + Add Exercise
          </button>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Template'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

type SortKey = 'name-asc' | 'name-desc' | 'type' | 'category'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
  { value: 'type', label: 'Type' },
  { value: 'category', label: 'Category' },
]

function sortTemplates(templates: WorkoutTemplate[], key: SortKey): WorkoutTemplate[] {
  return [...templates].sort((a, b) => {
    if (key === 'name-asc') return a.name.localeCompare(b.name)
    if (key === 'name-desc') return b.name.localeCompare(a.name)
    if (key === 'type') return a.workout_type.localeCompare(b.workout_type) || a.name.localeCompare(b.name)
    if (key === 'category') {
      const ca = a.custom_type_label || a.workout_type
      const cb = b.custom_type_label || b.workout_type
      return ca.localeCompare(cb) || a.name.localeCompare(b.name)
    }
    return 0
  })
}

export default function TemplatesPage() {
  const qc = useQueryClient()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | undefined>(undefined)
  const [sortKey, setSortKey] = useState<SortKey>('name-asc')
  const [search, setSearch] = useState('')

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  })

  const visibleTemplates = sortTemplates(
    search.trim()
      ? templates.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          (t.custom_type_label ?? t.workout_type).toLowerCase().includes(search.toLowerCase())
        )
      : templates,
    sortKey
  )

  const deleteMut = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })

  function handleDelete(t: WorkoutTemplate) {
    if (window.confirm(`Delete template "${t.name}"?`)) {
      deleteMut.mutate(t.id)
    }
  }

  function openNew() {
    setEditingTemplate(undefined)
    setEditorOpen(true)
  }

  function openEdit(t: WorkoutTemplate) {
    setEditingTemplate(t)
    setEditorOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-3xl font-bold text-gray-900">Workout Templates</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          + New Template
        </button>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap font-medium">Sort by</label>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {templates.length > 0 && (
          <span className="text-xs text-gray-400 self-center whitespace-nowrap">
            {visibleTemplates.length} of {templates.length}
          </span>
        )}
      </div>

      {isLoading && <div className="text-center py-12 text-gray-400">Loading…</div>}

      {!isLoading && templates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No templates yet</h2>
          <p className="text-gray-400 text-sm mb-5">Create reusable workout templates to speed up your planning.</p>
          <button onClick={openNew}
            className="px-5 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
            Create First Template
          </button>
        </div>
      )}

      {!isLoading && templates.length > 0 && visibleTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No templates match "{search}"
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {visibleTemplates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadge[t.workout_type as WorkoutType]}`}>
                  {t.custom_type_label || t.workout_type}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(t)}
                  className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Delete
                </button>
              </div>
            </div>

            {t.exercises.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">{t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}</p>
                <ul className="space-y-0.5">
                  {t.exercises.slice(0, 5).map(ex => (
                    <li key={ex.id} className="text-sm text-gray-600">
                      {ex.exercise_name}
                      {ex.sets && <span className="text-gray-400"> · {ex.sets}×{ex.reps ?? '?'}</span>}
                    </li>
                  ))}
                  {t.exercises.length > 5 && (
                    <li className="text-xs text-gray-400">+{t.exercises.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            {t.notes && <p className="text-xs text-gray-500 mt-2 italic">{t.notes}</p>}
          </div>
        ))}
      </div>

      {editorOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h2>
            </div>
            <div className="p-6">
              <TemplateEditor
                initial={editingTemplate}
                onSave={() => setEditorOpen(false)}
                onCancel={() => setEditorOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
