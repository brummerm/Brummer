import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  isSameMonth,
  parseISO,
} from 'date-fns'
import { getWorkoutsInRange, type WorkoutEntry, type WorkoutType } from '../api/fitness'
import WorkoutEditor from '../components/WorkoutEditor'

type CalView = 'month' | 'week' | 'day'

const typeDot: Record<WorkoutType, string> = {
  lift: 'bg-blue-500',
  run: 'bg-green-500',
  rest: 'bg-gray-400',
  hike: 'bg-amber-500',
  custom: 'bg-purple-500',
}

const typeBadge: Record<WorkoutType, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  hike: 'bg-amber-100 text-amber-800',
  custom: 'bg-purple-100 text-purple-800',
}

function dateKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export default function CalendarPage() {
  const qc = useQueryClient()
  const [view, setView] = useState<CalView>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null)
  const [editorDate, setEditorDate] = useState<string | undefined>(undefined)

  // Compute fetch range based on view
  const { fetchStart, fetchEnd } = useMemo(() => {
    if (view === 'month') {
      const s = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
      const e = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
      return { fetchStart: s, fetchEnd: e }
    } else if (view === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: 0 })
      const e = endOfWeek(currentDate, { weekStartsOn: 0 })
      return { fetchStart: s, fetchEnd: e }
    } else {
      return { fetchStart: currentDate, fetchEnd: currentDate }
    }
  }, [view, currentDate])

  const queryKey = ['workouts', view, dateKey(fetchStart), dateKey(fetchEnd)]
  const { data: workouts = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getWorkoutsInRange(fetchStart, fetchEnd),
  })

  const workoutMap = useMemo(() => {
    const map: Record<string, WorkoutEntry> = {}
    for (const w of workouts) {
      map[w.date] = w
    }
    return map
  }, [workouts])

  function navigate(dir: 1 | -1) {
    if (view === 'month') setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    else setCurrentDate(dir === 1 ? addDays(currentDate, 1) : addDays(currentDate, -1))
  }

  function openEditor(date: string, entry?: WorkoutEntry) {
    setEditorDate(date)
    setEditingEntry(entry ?? null)
    setEditorOpen(true)
  }

  function handleSave() {
    qc.invalidateQueries({ queryKey: ['workouts'] })
    qc.invalidateQueries({ queryKey: ['workout-today'] })
    setEditorOpen(false)
  }

  function headerLabel() {
    if (view === 'month') return format(currentDate, 'MMMM yyyy')
    if (view === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: 0 })
      const e = endOfWeek(currentDate, { weekStartsOn: 0 })
      return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`
    }
    return format(currentDate, 'EEEE, MMMM d, yyyy')
  }

  const todayStr = dateKey(new Date())

  // ── Month view ──────────────────────────────────────────────────────────────
  function MonthGrid() {
    const gridStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const gridEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    const days: Date[] = []
    let d = gridStart
    while (d <= gridEnd) { days.push(d); d = addDays(d, 1) }

    return (
      <div>
        <div className="grid grid-cols-7 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-1 sm:py-2 truncate">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
          {days.map(day => {
            const key = dateKey(day)
            const entry = workoutMap[key]
            const isToday = key === todayStr
            const inMonth = isSameMonth(day, currentDate)
            return (
              <button
                key={key}
                onClick={() => openEditor(key, entry)}
                className={`min-h-[56px] sm:min-h-[80px] p-1 sm:p-2 text-left transition-colors hover:bg-blue-50 ${
                  inMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs sm:text-sm font-medium mb-1 ${
                  isToday
                    ? 'bg-brand-500 text-white'
                    : inMonth
                    ? 'text-gray-700'
                    : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
                {entry && (
                  <div className="mt-0.5">
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeDot[entry.workout_type]}`} />
                      <span className="text-xs text-gray-600 truncate">
                        {entry.custom_type_label || entry.workout_type}
                        {entry.title ? ` · ${entry.title}` : ''}
                      </span>
                    </div>
                    {entry.status === 'completed' && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Week view ───────────────────────────────────────────────────────────────
  function WeekGrid() {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-3 min-w-[560px]">
        {days.map(day => {
          const key = dateKey(day)
          const entry = workoutMap[key]
          const isToday = key === todayStr
          return (
            <div key={key} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => openEditor(key, entry)}
                className="w-full text-left"
              >
                <div className={`px-3 py-2 border-b border-gray-100 ${isToday ? 'bg-brand-50' : ''}`}>
                  <div className="text-xs text-gray-500 font-medium">{format(day, 'EEE')}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-brand-600' : 'text-gray-800'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                {entry ? (
                  <div className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge[entry.workout_type]}`}>
                      {entry.custom_type_label || entry.workout_type}
                    </span>
                    {entry.title && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{entry.title}</p>
                    )}
                    {entry.exercises.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{entry.exercises.length} exercise{entry.exercises.length !== 1 ? 's' : ''}</p>
                    )}
                    {entry.run?.distance_miles && (
                      <p className="text-xs text-gray-400 mt-1">{entry.run.distance_miles} mi</p>
                    )}
                    {entry.status === 'completed' && (
                      <p className="text-xs text-green-600 mt-1">✓ Done</p>
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-300 italic">No workout</p>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>
      </div>
    )
  }

  // ── Day view ────────────────────────────────────────────────────────────────
  function DayView() {
    const key = dateKey(currentDate)
    const entry = workoutMap[key]

    return (
      <div className="max-w-2xl mx-auto">
        {entry ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${typeBadge[entry.workout_type]}`}>
                  {entry.custom_type_label || entry.workout_type}
                </span>
                {entry.title && <h2 className="font-semibold text-gray-900 text-lg">{entry.title}</h2>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  entry.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {entry.status}
                </span>
                <button
                  onClick={() => openEditor(key, entry)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>
            </div>
            {entry.exercises.length > 0 && (
              <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-1.5 font-medium">Exercise</th>
                    <th className="text-left py-1.5 font-medium">Sets</th>
                    <th className="text-left py-1.5 font-medium">Reps</th>
                    <th className="text-left py-1.5 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.exercises.map(ex => (
                    <tr key={ex.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 font-medium text-gray-800">{ex.exercise_name}</td>
                      <td className="py-1.5 text-gray-600">{ex.sets ?? '—'}</td>
                      <td className="py-1.5 text-gray-600">{ex.reps ?? '—'}</td>
                      <td className="py-1.5 text-gray-600">{ex.weight ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
            {entry.run && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {entry.run.distance_miles != null && (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-green-700">{entry.run.distance_miles} mi</div>
                  </div>
                )}
                {entry.run.duration_minutes != null && (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-green-700">
                      {Math.floor(entry.run.duration_minutes)}:{String(Math.round((entry.run.duration_minutes % 1) * 60)).padStart(2, '0')}
                    </div>
                  </div>
                )}
              </div>
            )}
            {entry.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">{entry.notes}</p>}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 mb-4">No workout on this day</p>
            <button
              onClick={() => openEditor(key)}
              className="px-5 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600"
            >
              Add Workout
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ‹
          </button>
          <h1 className="font-display text-2xl font-bold text-gray-900 min-w-[200px] text-center">
            {headerLabel()}
          </h1>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ›
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as CalView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="text-center py-12 text-gray-400">Loading…</div>}

      {!isLoading && view === 'month' && <MonthGrid />}
      {!isLoading && view === 'week' && <WeekGrid />}
      {!isLoading && view === 'day' && <DayView />}

      {editorOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-lg">
                {editingEntry ? 'Edit Workout' : 'Add Workout'}
              </h2>
              {editorDate && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {format(parseISO(editorDate), 'EEEE, MMMM d, yyyy')}
                </p>
              )}
            </div>
            <div className="p-6">
              <WorkoutEditor
                initialDate={editorDate}
                initialData={editingEntry ?? undefined}
                onSave={handleSave}
                onCancel={() => setEditorOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
