import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTemplates,
  createWorkout,
  updateWorkout,
  type WorkoutEntry,
  type WorkoutExercise,
  type WorkoutRun,
  type WorkoutType,
  type WorkoutStatus,
} from '../api/fitness'
import { format } from 'date-fns'

interface Props {
  initialDate?: string
  initialData?: WorkoutEntry
  onSave: (entry: WorkoutEntry) => void
  onCancel: () => void
}

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

function decimalToMinSec(decimal: number | null): { mins: string; secs: string } {
  if (decimal === null || decimal === undefined) return { mins: '', secs: '' }
  const totalSecs = Math.round(decimal * 60)
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return { mins: String(m), secs: String(s).padStart(2, '0') }
}

function minSecToDecimal(mins: string, secs: string): number | null {
  const m = parseInt(mins) || 0
  const s = parseInt(secs) || 0
  if (m === 0 && s === 0) return null
  return m + s / 60
}

const WORKOUT_TYPES: WorkoutType[] = ['lift', 'run', 'rest', 'hike', 'custom']

const typeColors: Record<WorkoutType, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  hike: 'bg-amber-100 text-amber-800',
  custom: 'bg-purple-100 text-purple-800',
}

function emptyExercise(): WorkoutExercise {
  return { exercise_name: '', sets: null, reps: null, weight: null, notes: null, sort_order: 0 }
}

export default function WorkoutEditor({ initialDate, initialData, onSave, onCancel }: Props) {
  const qc = useQueryClient()

  const [date, setDate] = useState(initialData?.date ?? initialDate ?? todayStr())
  const [workoutType, setWorkoutType] = useState<WorkoutType>(initialData?.workout_type ?? 'lift')
  const [customLabel, setCustomLabel] = useState(initialData?.custom_type_label ?? '')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [status, setStatus] = useState<WorkoutStatus>(initialData?.status ?? 'planned')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [exercises, setExercises] = useState<WorkoutExercise[]>(
    initialData?.exercises?.length ? initialData.exercises : []
  )

  // Run state
  const initRun = initialData?.run ?? null
  const initMinSec = decimalToMinSec(initRun?.duration_minutes ?? null)
  const [runDistance, setRunDistance] = useState(initRun?.distance_miles?.toString() ?? '')
  const [runMins, setRunMins] = useState(initMinSec.mins)
  const [runSecs, setRunSecs] = useState(initMinSec.secs)
  const [runNotes, setRunNotes] = useState(initRun?.notes ?? '')

  const [templateId, setTemplateId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: templates = [] } = useQuery({ queryKey: ['templates'], queryFn: getTemplates })

  const createMut = useMutation({
    mutationFn: createWorkout,
    onSuccess: (entry) => { qc.invalidateQueries({ queryKey: ['workouts'] }); onSave(entry) },
    onError: () => setError('Failed to save workout.'),
    onSettled: () => setSaving(false),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateWorkout>[1] }) =>
      updateWorkout(id, data),
    onSuccess: (entry) => { qc.invalidateQueries({ queryKey: ['workouts'] }); onSave(entry) },
    onError: () => setError('Failed to save workout.'),
    onSettled: () => setSaving(false),
  })

  function handleTemplateSelect(tid: string) {
    setTemplateId(tid)
    if (!tid) return
    const t = templates.find(t => String(t.id) === tid)
    if (!t) return
    setWorkoutType(t.workout_type as WorkoutType)
    if (t.custom_type_label) setCustomLabel(t.custom_type_label)
    setExercises(t.exercises.map(ex => ({
      exercise_name: ex.exercise_name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      notes: ex.notes,
      sort_order: ex.sort_order,
    })))
  }

  function addExercise() {
    setExercises(prev => [...prev, emptyExercise()])
  }

  function removeExercise(idx: number) {
    setExercises(prev => prev.filter((_, i) => i !== idx))
  }

  function updateExercise(idx: number, field: keyof WorkoutExercise, value: string | number | null) {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex))
  }

  function buildRun(): WorkoutRun | null {
    if (workoutType !== 'run') return null
    const dist = parseFloat(runDistance) || null
    const dur = minSecToDecimal(runMins, runSecs)
    if (!dist && !dur && !runNotes) return null
    return { distance_miles: dist, duration_minutes: dur, notes: runNotes || null }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) { setError('Date is required.'); return }
    if (!workoutType) { setError('Workout type is required.'); return }
    setSaving(true)
    setError(null)

    const payload = {
      date,
      workout_type: workoutType,
      custom_type_label: workoutType === 'custom' ? (customLabel || null) : null,
      title: title || null,
      status,
      notes: notes || null,
      exercises: (workoutType === 'run' || workoutType === 'rest')
        ? []
        : exercises.filter(ex => ex.exercise_name.trim()).map((ex, i) => ({ ...ex, sort_order: i })),
      run: buildRun(),
    }

    if (initialData) {
      updateMut.mutate({ id: initialData.id, data: payload })
    } else {
      createMut.mutate(payload as Parameters<typeof createWorkout>[0])
    }
  }

  const showExercises = workoutType === 'lift' || workoutType === 'hike' || workoutType === 'custom'
  const showRun = workoutType === 'run'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {/* Date & Type row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
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
                  workoutType === t
                    ? typeColors[t] + ' border-current'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom label */}
      {workoutType === 'custom' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Custom Type Label</label>
          <input
            type="text"
            value={customLabel}
            onChange={e => setCustomLabel(e.target.value)}
            placeholder="e.g. CrossFit, Yoga"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      )}

      {/* Title & Status row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Push Day A, Morning 5K"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <div className="flex gap-2">
            {(['planned', 'completed'] as WorkoutStatus[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  status === s
                    ? s === 'completed'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template picker (only for exercise types) */}
      {showExercises && templates.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Load from Template</label>
          <select
            value={templateId}
            onChange={e => handleTemplateSelect(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Load template…</option>
            {templates.map(t => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Exercises */}
      {showExercises && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-500">Exercises</label>
          </div>
          {exercises.length > 0 && (
            <div className="overflow-x-auto mb-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-200">
                    <th className="text-left py-2 pr-2 font-medium">Exercise</th>
                    <th className="text-left py-2 pr-2 font-medium w-14">Sets</th>
                    <th className="text-left py-2 pr-2 font-medium w-16">Reps</th>
                    <th className="text-left py-2 pr-2 font-medium w-20">Weight</th>
                    <th className="text-left py-2 pr-2 font-medium">Notes</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((ex, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={ex.exercise_name}
                          onChange={e => updateExercise(i, 'exercise_name', e.target.value)}
                          placeholder="Exercise name"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="number"
                          value={ex.sets ?? ''}
                          onChange={e => updateExercise(i, 'sets', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={ex.reps ?? ''}
                          onChange={e => updateExercise(i, 'reps', e.target.value || null)}
                          placeholder="8-12"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={ex.weight ?? ''}
                          onChange={e => updateExercise(i, 'weight', e.target.value || null)}
                          placeholder="135 lbs"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={ex.notes ?? ''}
                          onChange={e => updateExercise(i, 'notes', e.target.value || null)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        />
                      </td>
                      <td className="py-1.5">
                        <button
                          type="button"
                          onClick={() => removeExercise(i)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                          aria-label="Remove exercise"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            onClick={addExercise}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            + Add Exercise
          </button>
        </div>
      )}

      {/* Run section */}
      {showRun && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-500">Run Details</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Distance (miles)</label>
              <input
                type="number"
                step="0.01"
                value={runDistance}
                onChange={e => setRunDistance(e.target.value)}
                placeholder="3.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Duration (min)</label>
              <input
                type="number"
                value={runMins}
                onChange={e => setRunMins(e.target.value)}
                placeholder="28"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Duration (sec)</label>
              <input
                type="number"
                min="0"
                max="59"
                value={runSecs}
                onChange={e => setRunSecs(e.target.value)}
                placeholder="30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Run Notes</label>
            <input
              type="text"
              value={runNotes}
              onChange={e => setRunNotes(e.target.value)}
              placeholder="Easy pace, trail run…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="How did it go?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Create Workout'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
