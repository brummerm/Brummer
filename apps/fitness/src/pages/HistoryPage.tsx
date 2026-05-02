import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, differenceInDays } from 'date-fns'
import { getLogs, getPlan } from '../api/fitness'
import type { WorkoutLog, PlanDay } from '../types/fitness'

const DAY_TYPE_COLORS: Record<string, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  test: 'bg-orange-100 text-orange-800',
}

function formatDuration(minutes: number): string {
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function computeStreak(logs: WorkoutLog[]): number {
  if (logs.length === 0) return 0
  const today = new Date()
  // get unique sorted dates desc
  const dates = [...new Set(logs.map((l) => l.logged_date))].sort().reverse()
  let streak = 0
  let prev = today
  for (const d of dates) {
    const date = parseISO(d)
    const diff = differenceInDays(prev, date)
    if (diff <= 1) {
      streak++
      prev = date
    } else {
      break
    }
  }
  return streak
}

function LogSummary({ log }: { log: WorkoutLog }) {
  const hasExercises = log.exercises.length > 0
  const hasRun = log.run != null

  if (!hasExercises && !hasRun) return <span className="text-gray-400 text-sm">Notes only</span>

  const parts: string[] = []
  if (hasExercises) parts.push(`${log.exercises.length} exercise${log.exercises.length !== 1 ? 's' : ''}`)
  if (hasRun && log.run) {
    const mi = log.run.distance_miles != null ? `${log.run.distance_miles.toFixed(1)} mi` : ''
    const dur = log.run.duration_minutes != null ? formatDuration(log.run.duration_minutes) : ''
    const runStr = [mi, dur].filter(Boolean).join(' · ')
    if (runStr) parts.push(runStr)
  }

  return <span className="text-gray-600 text-sm">{parts.join(' · ')}</span>
}

export default function HistoryPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['fitness-logs'],
    queryFn: getLogs,
  })

  const { data: plan = [] } = useQuery({
    queryKey: ['fitness-plan'],
    queryFn: getPlan,
  })

  const planMap: Record<number, PlanDay> = {}
  for (const day of plan) {
    planMap[day.day_index] = day
  }

  // Stats
  const totalMiles = logs.reduce((acc, l) => acc + (l.run?.distance_miles ?? 0), 0)
  const streak = computeStreak(logs)

  if (isLoading) {
    return <div className="text-center py-16 text-gray-500">Loading…</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">History</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-brand-600">{logs.length}</div>
          <div className="text-xs text-gray-500 mt-1">Workouts Logged</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-brand-600">{totalMiles.toFixed(1)}</div>
          <div className="text-xs text-gray-500 mt-1">Total Miles</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-brand-600">{streak}</div>
          <div className="text-xs text-gray-500 mt-1">Day Streak</div>
        </div>
      </div>

      {/* Log list */}
      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No workouts logged yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const planDay = planMap[log.plan_day_index]
            return (
              <Link
                key={log.id}
                to={`/log/${log.plan_day_index}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 hover:border-brand-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {format(parseISO(log.logged_date), 'EEE, MMM d')}
                    </div>
                    {planDay && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Week {planDay.week} · Day {log.plan_day_index + 1}
                      </div>
                    )}
                  </div>

                  {/* Center */}
                  {planDay && (
                    <div className="flex items-center gap-2 mx-4">
                      <span className="text-sm text-gray-700 truncate max-w-[160px]">
                        {planDay.focus}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${DAY_TYPE_COLORS[planDay.day_type] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {planDay.day_type}
                      </span>
                    </div>
                  )}

                  {/* Right */}
                  <div className="text-right">
                    <LogSummary log={log} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
