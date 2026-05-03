import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO, subDays } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getBodyWeights, logBodyWeight, deleteBodyWeight } from '../api/fitness'
import type { BodyWeightEntry } from '../api/fitness'

function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export default function BodyWeightPage() {
  const queryClient = useQueryClient()
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['body-weights'],
    queryFn: getBodyWeights,
  })

  const [date, setDate] = useState(todayString())
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) {
      setError('Please enter a valid weight.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await logBodyWeight({ date, weight_lbs: w, notes: notes || undefined })
      queryClient.invalidateQueries({ queryKey: ['body-weights'] })
      setWeight('')
      setNotes('')
      setDate(todayString())
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    await deleteBodyWeight(id)
    queryClient.invalidateQueries({ queryKey: ['body-weights'] })
  }

  // Chart data: last 90 days
  const cutoff = subDays(new Date(), 90)
  const chartData = entries
    .filter((e) => parseISO(e.date) >= cutoff)
    .map((e) => ({
      date: e.date,
      weight_lbs: e.weight_lbs,
      label: format(parseISO(e.date), 'MMM d'),
    }))

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">Body Weight</h1>

      {/* Log form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Log Weight</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 175.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <label className="text-xs text-gray-500 font-medium">Notes (optional)</label>
            <input
              type="text"
              placeholder="Morning, post-workout…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : 'Log Weight'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
          <h2 className="font-semibold text-gray-700 mb-4">Trend (last 90 days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => `${v}`}
              />
              <Tooltip
                formatter={(value) => [`${value} lbs`, 'Weight']}
                labelFormatter={(label) => label as string}
              />
              <Line
                type="monotone"
                dataKey="weight_lbs"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No entries yet. Log your first weight above.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Weight (lbs)</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Notes</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {[...entries].reverse().map((entry: BodyWeightEntry) => (
                <tr key={entry.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-700">{format(parseISO(entry.date), 'EEE, MMM d, yyyy')}</td>
                  <td className="px-5 py-3 font-semibold text-brand-600">{entry.weight_lbs}</td>
                  <td className="px-5 py-3 text-gray-500">{entry.notes ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
