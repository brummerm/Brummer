import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, differenceInDays, parseISO } from 'date-fns'
import { getConfig, setConfig, getPlanDay, getLogByDay } from '../api/fitness'

const DAY_TYPE_COLORS: Record<string, string> = {
  lift: 'bg-blue-100 text-blue-800',
  run: 'bg-green-100 text-green-800',
  rest: 'bg-gray-100 text-gray-700',
  test: 'bg-orange-100 text-orange-800',
}

export default function TodayPage() {
  const qc = useQueryClient()
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const [startDate, setStartDate] = useState(todayStr)

  const { data: config, isLoading: configLoading, error: configError } = useQuery({
    queryKey: ['fitness-config'],
    queryFn: getConfig,
    retry: false,
  })

  const configMissing =
    !configLoading && (!config || (configError as { response?: { status?: number } } | null)?.response?.status === 404)

  const dayIndex = config
    ? differenceInDays(today, parseISO(config.start_date))
    : null

  const { data: planDay } = useQuery({
    queryKey: ['fitness-plan-day', dayIndex],
    queryFn: () => getPlanDay(dayIndex!),
    enabled: dayIndex != null && dayIndex >= 0 && dayIndex < 84,
  })

  const { data: log } = useQuery({
    queryKey: ['fitness-log-day', dayIndex],
    queryFn: () => getLogByDay(dayIndex!),
    enabled: dayIndex != null && dayIndex >= 0 && dayIndex < 84,
  })

  const setConfigMutation = useMutation({
    mutationFn: (date: string) => setConfig(date),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['fitness-config'] })
    },
  })

  if (configLoading) {
    return <div className="text-center py-16 text-gray-500">Loading…</div>
  }

  // No config set
  if (configMissing) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Start Your Plan
          </h1>
          <p className="text-gray-500 mb-6">
            Choose a start date to begin your 12-week fitness program.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500"
            />
            <button
              onClick={() => setConfigMutation.mutate(startDate)}
              disabled={setConfigMutation.isPending}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60"
            >
              {setConfigMutation.isPending ? 'Saving…' : 'Start Plan'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Plan hasn't started yet
  if (dayIndex != null && dayIndex < 0) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Plan Starts Soon
          </h2>
          <p className="text-gray-500">
            Your plan starts in <strong>{Math.abs(dayIndex)}</strong> day{Math.abs(dayIndex) !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    )
  }

  // Plan complete
  if (dayIndex != null && dayIndex >= 84) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Plan Complete!
          </h2>
          <p className="text-gray-500 mb-6">
            You've finished your 12-week program. Amazing work!
          </p>
          <Link
            to="/history"
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            View History
          </Link>
        </div>
      </div>
    )
  }

  if (!planDay || dayIndex == null) {
    return <div className="text-center py-16 text-gray-500">Loading plan…</div>
  }

  const week = planDay.week
  const dayOfWeek = planDay.day_of_week

  return (
    <div className="max-w-2xl mx-auto">
      {/* Date header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">{format(today, 'EEEE, MMMM d')}</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Week {week}, {dayOfWeek}
        </h1>
      </div>

      {/* Day card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <span className="font-semibold text-gray-900">{planDay.label}</span>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${DAY_TYPE_COLORS[planDay.day_type] ?? 'bg-gray-100 text-gray-700'}`}
          >
            {planDay.focus}
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {/* Strength */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💪</span>
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Strength / Conditioning
              </h3>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
              {planDay.strength || '—'}
            </p>
          </div>

          {/* Run */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏃</span>
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Run
              </h3>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
              {planDay.run || '—'}
            </p>
          </div>

          {/* Mental */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧠</span>
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Mental + Recovery
              </h3>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
              {planDay.mental_recovery || '—'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {log ? (
              <span className="inline-flex items-center gap-1 text-green-700 font-medium text-sm">
                <span className="text-green-500">✓</span> Logged
              </span>
            ) : null}
            <Link
              to={`/log/${dayIndex}`}
              className="inline-block bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {log ? 'View / Edit Log' : 'Log This Workout'}
            </Link>
          </div>

          {/* Adjacent day nav */}
          <div className="flex items-center gap-3 text-sm">
            {dayIndex > 0 && (
              <Link
                to={`/log/${dayIndex - 1}`}
                className="text-gray-500 hover:text-brand-600 transition-colors"
              >
                ← Yesterday
              </Link>
            )}
            {dayIndex < 83 && (
              <Link
                to={`/log/${dayIndex + 1}`}
                className="text-gray-500 hover:text-brand-600 transition-colors"
              >
                Tomorrow →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
