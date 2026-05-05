import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { getWorkoutByDate, type WorkoutEntry, type WorkoutType } from '../api/fitness'
import WorkoutEditor from '../components/WorkoutEditor'

const today = format(new Date(), 'yyyy-MM-dd')

const typeBadge: Record<WorkoutType, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  hike: 'bg-amber-100 text-amber-800',
  custom: 'bg-purple-100 text-purple-800',
}

function WorkoutCard({ entry, onEdit }: { entry: WorkoutEntry; onEdit: () => void }) {
  const typeLabel = entry.custom_type_label || entry.workout_type
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${typeBadge[entry.workout_type]}`}>
            {typeLabel}
          </span>
          {entry.title && <h2 className="font-semibold text-gray-900 text-lg">{entry.title}</h2>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            entry.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            {entry.status}
          </span>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {entry.exercises.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Exercises</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left py-1.5 font-medium">Exercise</th>
                <th className="text-left py-1.5 font-medium">Sets</th>
                <th className="text-left py-1.5 font-medium">Reps</th>
                <th className="text-left py-1.5 font-medium">Weight</th>
                <th className="text-left py-1.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {entry.exercises.map(ex => (
                <tr key={ex.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 font-medium text-gray-800">{ex.exercise_name}</td>
                  <td className="py-2 text-gray-600">{ex.sets ?? '—'}</td>
                  <td className="py-2 text-gray-600">{ex.reps ?? '—'}</td>
                  <td className="py-2 text-gray-600">{ex.weight ?? '—'}</td>
                  <td className="py-2 text-gray-500 text-xs">{ex.notes ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entry.run && (
        <div className="mb-4 flex gap-4">
          {entry.run.distance_miles != null && (
            <div className="bg-green-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-green-700">{entry.run.distance_miles.toFixed(2)}</div>
              <div className="text-xs text-green-600 mt-0.5">miles</div>
            </div>
          )}
          {entry.run.duration_minutes != null && (
            <div className="bg-green-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-green-700">
                {Math.floor(entry.run.duration_minutes)}:{String(Math.round((entry.run.duration_minutes % 1) * 60)).padStart(2, '0')}
              </div>
              <div className="text-xs text-green-600 mt-0.5">duration</div>
            </div>
          )}
          {entry.run.distance_miles != null && entry.run.duration_minutes != null && (
            <div className="bg-green-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-green-700">
                {(entry.run.duration_minutes / entry.run.distance_miles).toFixed(1)}
              </div>
              <div className="text-xs text-green-600 mt-0.5">min/mile</div>
            </div>
          )}
          {entry.run.notes && (
            <p className="text-sm text-gray-500 self-center">{entry.run.notes}</p>
          )}
        </div>
      )}

      {entry.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">{entry.notes}</p>
      )}
    </div>
  )
}

export default function TodayPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null)

  const { data: workout, isLoading, error } = useQuery({
    queryKey: ['workout-today', today],
    queryFn: () => getWorkoutByDate(today),
    retry: (failureCount, err: unknown) => {
      const e = err as { response?: { status?: number } }
      if (e?.response?.status === 404) return false
      return failureCount < 1
    },
  })

  const todayNotFound = (error as { response?: { status?: number } })?.response?.status === 404

  function openAdd() {
    setEditingEntry(null)
    setModalOpen(true)
  }

  function openEdit(entry: WorkoutEntry) {
    setEditingEntry(entry)
    setModalOpen(true)
  }

  function handleSave() {
    qc.invalidateQueries({ queryKey: ['workout-today'] })
    setModalOpen(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">
          {format(parseISO(today), 'EEEE, MMMM d, yyyy')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Today's workout</p>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      )}

      {!isLoading && (todayNotFound || !workout) && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">🏋️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No workout planned for today</h2>
          <p className="text-gray-400 text-sm mb-6">Add a workout to get started.</p>
          <button
            onClick={openAdd}
            className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
          >
            Add Workout
          </button>
        </div>
      )}

      {!isLoading && workout && (
        <>
          <WorkoutCard entry={workout} onEdit={() => openEdit(workout)} />
          <div className="mt-4 text-center">
            <button onClick={openAdd} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              + Add another workout
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">
                {editingEntry ? 'Edit Workout' : 'Add Workout'}
              </h2>
            </div>
            <div className="p-6">
              <WorkoutEditor
                initialDate={today}
                initialData={editingEntry ?? undefined}
                onSave={handleSave}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
