import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPlanDay, getLogByDay, createLog, updateLog, deleteLog } from '../api/fitness'
import { format } from 'date-fns'
import type { ExerciseSetCreate, RunEntryCreate } from '../api/fitnessTypes'

const DAY_TYPE_COLORS: Record<string, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  test: 'bg-orange-100 text-orange-800',
}

interface ExerciseRow extends ExerciseSetCreate {
  _key: number
}

let keyCounter = 0

function parseExercisesFromStrength(strength: string): ExerciseRow[] {
  const lines = strength.split('\n')
  const rows: ExerciseRow[] = []
  const prefixRe = /^[A-Z]\d?\.\s*/
  for (const line of lines) {
    if (prefixRe.test(line.trim())) {
      // strip prefix, grab name before numbers/set-scheme
      const stripped = line.trim().replace(prefixRe, '')
      // take text up to first digit or colon
      const nameMatch = stripped.match(/^([^0-9:(]+)/)
      const name = nameMatch ? nameMatch[1].trim() : stripped.trim()
      if (name) {
        rows.push({ _key: ++keyCounter, exercise_name: name, sets: null, reps: null, weight: null, notes: null, sort_order: rows.length })
      }
    }
  }
  return rows
}

export default function LogPage() {
  const { dayIndex: dayIndexStr } = useParams<{ dayIndex: string }>()
  const dayIndex = parseInt(dayIndexStr ?? '0', 10)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: planDay } = useQuery({
    queryKey: ['fitness-plan-day', dayIndex],
    queryFn: () => getPlanDay(dayIndex),
  })

  const { data: existingLog, isLoading: logLoading } = useQuery({
    queryKey: ['fitness-log-day', dayIndex],
    queryFn: () => getLogByDay(dayIndex),
  })

  const [sessionNotes, setSessionNotes] = useState('')
  const [exercises, setExercises] = useState<ExerciseRow[]>([])
  const [runDistance, setRunDistance] = useState('')
  const [runMin, setRunMin] = useState('')
  const [runSec, setRunSec] = useState('')
  const [runNotes, setRunNotes] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Reset form when navigating to a different day
  useEffect(() => {
    setInitialized(false)
    setSessionNotes('')
    setExercises([])
    setRunDistance('')
    setRunMin('')
    setRunSec('')
    setRunNotes('')
  }, [dayIndex])

  useEffect(() => {
    if (logLoading || initialized) return
    setInitialized(true)
    if (existingLog) {
      setSessionNotes(existingLog.notes ?? '')
      setExercises(
        existingLog.exercises.map((ex) => ({
          _key: ++keyCounter,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          notes: ex.notes,
          sort_order: ex.sort_order,
        }))
      )
      if (existingLog.run) {
        setRunDistance(existingLog.run.distance_miles?.toString() ?? '')
        const totalMin = existingLog.run.duration_minutes ?? 0
        setRunMin(Math.floor(totalMin).toString())
        setRunSec(Math.round((totalMin % 1) * 60).toString())
        setRunNotes(existingLog.run.notes ?? '')
      }
    } else if (planDay) {
      // Pre-populate exercises from plan
      if (planDay.day_type === 'lift' || planDay.day_type === 'test') {
        setExercises(parseExercisesFromStrength(planDay.strength))
      }
    }
  }, [existingLog, planDay, logLoading, initialized])

  // Re-init if planDay loads after log
  useEffect(() => {
    if (!initialized || existingLog || !planDay) return
    if (exercises.length === 0 && (planDay.day_type === 'lift' || planDay.day_type === 'test')) {
      setExercises(parseExercisesFromStrength(planDay.strength))
    }
  }, [planDay, initialized, existingLog, exercises.length])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const loggedDate = format(new Date(), 'yyyy-MM-dd')

      const exPayload: ExerciseSetCreate[] = exercises.map((ex, i) => ({
        exercise_name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes,
        sort_order: i,
      }))

      let runPayload: RunEntryCreate | null = null
      if (planDay && (planDay.day_type === 'run' || planDay.day_type === 'test')) {
        const dist = parseFloat(runDistance) || null
        const mins = (parseInt(runMin) || 0) + (parseInt(runSec) || 0) / 60
        runPayload = {
          distance_miles: dist,
          duration_minutes: mins || null,
          notes: runNotes || null,
        }
      }

      const payload = {
        plan_day_index: dayIndex,
        logged_date: loggedDate,
        notes: sessionNotes || null,
        exercises: exPayload,
        run: runPayload,
      }

      if (existingLog) {
        return updateLog(existingLog.id, payload)
      } else {
        return createLog(payload)
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fitness-log-day', dayIndex] })
      void qc.invalidateQueries({ queryKey: ['fitness-logs'] })
      navigate('/')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (existingLog) await deleteLog(existingLog.id)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fitness-log-day', dayIndex] })
      void qc.invalidateQueries({ queryKey: ['fitness-logs'] })
      navigate('/')
    },
  })

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { _key: ++keyCounter, exercise_name: '', sets: null, reps: null, weight: null, notes: null, sort_order: prev.length },
    ])
  }

  const removeExercise = (key: number) => {
    setExercises((prev) => prev.filter((ex) => ex._key !== key))
  }

  const updateExercise = (key: number, field: keyof ExerciseSetCreate, value: string | number | null) => {
    setExercises((prev) =>
      prev.map((ex) => (ex._key === key ? { ...ex, [field]: value } : ex))
    )
  }

  if (!planDay) {
    return <div className="text-center py-16 text-gray-500">Loading…</div>
  }

  const showStrength = planDay.day_type === 'lift' || planDay.day_type === 'test'
  const showRun = planDay.day_type === 'run' || planDay.day_type === 'test'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <div className="mb-4">
        <Link to="/" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
          ← Back to Today
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {planDay.label}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${DAY_TYPE_COLORS[planDay.day_type] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {planDay.focus}
            </span>
            <span className="text-xs text-gray-400 capitalize">{planDay.day_type}</span>
          </div>
        </div>
      </div>

      {/* Plan reference accordion */}
      <details className="bg-brand-50 border border-brand-100 rounded-xl mb-6 group">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-brand-700 list-none flex items-center justify-between">
          <span>View Plan Prescription</span>
          <span className="text-brand-400 group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div className="px-4 pb-4 space-y-3">
          {planDay.strength && (
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase mb-1">Strength</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{planDay.strength}</p>
            </div>
          )}
          {planDay.run && (
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase mb-1">Run</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{planDay.run}</p>
            </div>
          )}
        </div>
      </details>

      {/* Log form */}
      <div className="space-y-6">
        {/* Session notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Notes
          </label>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={3}
            placeholder="How did it go? Any observations…"
            className="w-full rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500 text-sm"
          />
        </div>

        {/* Exercise table */}
        {showStrength && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Exercises</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                    <th className="pb-2 pr-2 w-1/3">Exercise</th>
                    <th className="pb-2 pr-2 w-16">Sets</th>
                    <th className="pb-2 pr-2 w-20">Reps</th>
                    <th className="pb-2 pr-2 w-24">Weight</th>
                    <th className="pb-2 pr-2">Notes</th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exercises.map((ex) => (
                    <tr key={ex._key}>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={ex.exercise_name}
                          onChange={(e) => updateExercise(ex._key, 'exercise_name', e.target.value)}
                          placeholder="Exercise name"
                          className="w-full rounded border-gray-200 text-sm focus:border-brand-400 focus:ring-brand-400 py-1"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={ex.sets ?? ''}
                          onChange={(e) => updateExercise(ex._key, 'sets', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="—"
                          className="w-full rounded border-gray-200 text-sm focus:border-brand-400 focus:ring-brand-400 py-1"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={ex.reps ?? ''}
                          onChange={(e) => updateExercise(ex._key, 'reps', e.target.value || null)}
                          placeholder="6-8"
                          className="w-full rounded border-gray-200 text-sm focus:border-brand-400 focus:ring-brand-400 py-1"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={ex.weight ?? ''}
                          onChange={(e) => updateExercise(ex._key, 'weight', e.target.value || null)}
                          placeholder="135 lb"
                          className="w-full rounded border-gray-200 text-sm focus:border-brand-400 focus:ring-brand-400 py-1"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={ex.notes ?? ''}
                          onChange={(e) => updateExercise(ex._key, 'notes', e.target.value || null)}
                          placeholder="Notes"
                          className="w-full rounded border-gray-200 text-sm focus:border-brand-400 focus:ring-brand-400 py-1"
                        />
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeExercise(ex._key)}
                          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addExercise}
              className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              + Add Exercise
            </button>
          </div>
        )}

        {/* Run section */}
        {showRun && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Run</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Distance (miles)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={runDistance}
                  onChange={(e) => setRunDistance(e.target.value)}
                  placeholder="3.1"
                  className="w-full rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Duration
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={runMin}
                    onChange={(e) => setRunMin(e.target.value)}
                    placeholder="28"
                    className="w-full rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500 text-sm"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">min</span>
                  <input
                    type="number"
                    value={runSec}
                    onChange={(e) => setRunSec(e.target.value)}
                    placeholder="30"
                    className="w-full rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500 text-sm"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">sec</span>
                </div>
              </div>
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Run Notes
            </label>
            <textarea
              value={runNotes}
              onChange={(e) => setRunNotes(e.target.value)}
              rows={2}
              placeholder="Pace, conditions, how it felt…"
              className="w-full rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500 text-sm"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : existingLog ? 'Update Log' : 'Save Log'}
          </button>
          {existingLog && (
            <button
              onClick={() => {
                if (confirm('Delete this log entry?')) deleteMutation.mutate()
              }}
              disabled={deleteMutation.isPending}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Log'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
