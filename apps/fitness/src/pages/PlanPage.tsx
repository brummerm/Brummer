import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { differenceInDays, parseISO } from 'date-fns'
import { getConfig, getPlan, getLogs } from '../api/fitness'
import type { PlanDay } from '../types/fitness'

const DAY_TYPE_ICON: Record<string, string> = {
  lift: '🏋️',
  run: '🏃',
  rest: '😴',
  test: '⚡',
}

const PHASE_LABELS: Record<number, string> = {
  0: 'Phase 1 — Strength Base',
  28: 'Phase 2 — Power + Speed',
  56: 'Phase 3 — Endurance + Capacity',
  77: 'Week 12 — Deload + Retest',
}

export default function PlanPage() {
  const today = new Date()

  const { data: config } = useQuery({
    queryKey: ['fitness-config'],
    queryFn: getConfig,
    retry: false,
  })

  const { data: plan = [] } = useQuery({
    queryKey: ['fitness-plan'],
    queryFn: getPlan,
  })

  const { data: logs = [] } = useQuery({
    queryKey: ['fitness-logs'],
    queryFn: getLogs,
  })

  const todayIndex = config
    ? differenceInDays(today, parseISO(config.start_date))
    : null

  const loggedDays = new Set(logs.map((l) => l.plan_day_index))

  const weeks = Array.from({ length: 12 }, (_, wi) =>
    plan.slice(wi * 7, wi * 7 + 7)
  )

  if (!config) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">
          Set a start date on the{' '}
          <Link to="/" className="text-brand-600 hover:underline">
            Today page
          </Link>{' '}
          to begin tracking.
        </p>
      </div>
    )
  }

  const totalLogged = loggedDays.size

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
          12-Week Plan
        </h1>

        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {totalLogged} of 84 days logged
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${(totalLogged / 84) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {weeks.map((weekDays, wi) => {
          const phaseLabel = PHASE_LABELS[wi * 7]
          return (
            <div key={wi}>
              {phaseLabel && (
                <div className="mb-3">
                  <span className="inline-block bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                    {phaseLabel}
                  </span>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-700 text-sm">
                    Week {wi + 1}
                  </h2>
                </div>
                <div className="grid grid-cols-7 divide-x divide-gray-50">
                  {weekDays.map((day: PlanDay) => {
                    const isToday = todayIndex === day.day_index
                    const isLogged = loggedDays.has(day.day_index)
                    const isPast =
                      todayIndex != null && day.day_index < todayIndex
                    const isFuture =
                      todayIndex != null && day.day_index > todayIndex

                    return (
                      <Link
                        key={day.day_index}
                        to={`/log/${day.day_index}`}
                        className={`block p-3 text-center transition-colors hover:bg-brand-50 ${
                          isToday
                            ? 'bg-brand-50 ring-inset ring-2 ring-brand-400'
                            : ''
                        } ${isPast && !isLogged && !isFuture ? 'opacity-40' : ''}`}
                      >
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {day.day_of_week.slice(0, 3)}
                        </div>
                        <div className="text-lg mb-1">
                          {DAY_TYPE_ICON[day.day_type] ?? '•'}
                        </div>
                        <div className="text-xs text-gray-600 leading-tight truncate">
                          {day.focus}
                        </div>
                        {isLogged && (
                          <div className="mt-1 text-green-500 text-xs">✓</div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
