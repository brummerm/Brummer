import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, subMonths } from 'date-fns'
import { getWorkoutsInRange, type WorkoutEntry, type WorkoutType } from '../api/fitness'
import WorkoutEditor from '../components/WorkoutEditor'

const typeBadge: Record<WorkoutType, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  hike: 'bg-amber-100 text-amber-800',
  custom: 'bg-purple-100 text-purple-800',
}

export default function HistoryPage() {
  const qc = useQueryClient()
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null)

  const end = new Date()
  const start = subMonths(end, 6)

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts-history', format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')],
    queryFn: () => getWorkoutsInRange(start, end),
  })

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))

  function handleSave() {
    qc.invalidateQueries({ queryKey: ['workouts'] })
    qc.invalidateQueries({ queryKey: ['workouts-history'] })
    setEditingEntry(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">History</h1>
          <p className="text-gray-500 text-sm mt-1">Last 6 months</p>
        </div>
        {workouts.length > 0 && (
          <div className="text-right text-sm text-gray-500">
            <div className="font-semibold text-gray-900">
              {workouts.filter(w => w.status === 'completed').length}
            </div>
            <div>completed</div>
          </div>
        )}
      </div>

      {isLoading && <div className="text-center py-12 text-gray-400">Loading…</div>}

      {!isLoading && workouts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">📅</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No workouts yet</h2>
          <p className="text-gray-400 text-sm">Start adding workouts on the Today or Calendar pages.</p>
        </div>
      )}

      {!isLoading && sorted.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {sorted.map((entry, idx) => (
            <div
              key={entry.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${idx !== 0 ? 'border-t border-gray-100' : ''}`}
              onClick={() => setEditingEntry(entry)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center w-12">
                    <div className="text-xs text-gray-400">{format(parseISO(entry.date), 'MMM')}</div>
                    <div className="text-xl font-bold text-gray-800 leading-tight">{format(parseISO(entry.date), 'd')}</div>
                    <div className="text-xs text-gray-400">{format(parseISO(entry.date), 'EEE')}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge[entry.workout_type]}`}>
                        {entry.custom_type_label || entry.workout_type}
                      </span>
                      {entry.title && <span className="text-sm font-medium text-gray-800">{entry.title}</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.exercises.length > 0 && `${entry.exercises.length} exercise${entry.exercises.length !== 1 ? 's' : ''}`}
                      {entry.run?.distance_miles != null && ` · ${entry.run.distance_miles} mi`}
                      {entry.run?.duration_minutes != null && ` · ${Math.floor(entry.run.duration_minutes)}:${String(Math.round((entry.run.duration_minutes % 1) * 60)).padStart(2, '0')}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    entry.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {entry.status}
                  </span>
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingEntry && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">Edit Workout</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {format(parseISO(editingEntry.date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="p-6">
              <WorkoutEditor
                initialData={editingEntry}
                onSave={handleSave}
                onCancel={() => setEditingEntry(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
