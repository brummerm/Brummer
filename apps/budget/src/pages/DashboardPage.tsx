import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, ReferenceLine,
  AreaChart, Area,
} from 'recharts'
import {
  getSummary, getSnapshots, saveSnapshot, deleteSnapshot,
  type BudgetSummary, type MonthSnapshot,
} from '../api/budget'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtPct = (n: number) => (n * 100).toFixed(1) + '%'

const CATEGORY_COLORS: Record<string, string> = {
  Housing:       '#6366f1',
  Food:          '#f59e0b',
  Transport:     '#10b981',
  Debt:          '#ef4444',
  Health:        '#ec4899',
  Entertainment: '#8b5cf6',
  Subscriptions: '#0ea5e9',
  Savings:       '#14b8a6',
  Personal:      '#f97316',
  Other:         '#94a3b8',
}

function currentMonth() {
  return format(new Date(), 'yyyy-MM')
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold font-display mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">{message}</div>
  )
}

export default function DashboardPage() {
  const qc = useQueryClient()
  const { data: summary } = useQuery<BudgetSummary>({ queryKey: ['budget-summary'], queryFn: getSummary })
  const { data: snapshots = [] } = useQuery<MonthSnapshot[]>({ queryKey: ['snapshots'], queryFn: getSnapshots })

  const [justSaved, setJustSaved] = useState(false)
  const saveMut = useMutation({
    mutationFn: () => saveSnapshot(currentMonth()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['snapshots'] })
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    },
  })
  const deleteMut = useMutation({
    mutationFn: deleteSnapshot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['snapshots'] }),
  })

  const monthLabel = format(new Date(), 'MMMM yyyy')
  const surplusColor = (summary?.surplus ?? 0) >= 0 ? 'text-brand-600' : 'text-red-600'
  const srValue = summary?.savings_rate ?? 0
  const srColor = srValue >= 0.2 ? 'text-emerald-600' : srValue >= 0.1 ? 'text-yellow-600' : 'text-red-600'

  // Pie chart data from expenses_by_category
  // pieData order is fixed — Cell fill assignments depend on index matching Pie data order.
  // For the legend we sort by value descending without mutating pieData.
  const pieData = Object.entries(summary?.expenses_by_category ?? {}).map(([name, value]) => ({ name, value }))
  const sortedPieData = [...pieData].sort((a, b) => b.value - a.value)

  // Snapshot chart data
  const barData = snapshots.map(s => ({
    month: s.month.slice(0, 7),
    Income: Math.round(s.income),
    Expenses: Math.round(s.total_expenses),
  }))

  const lineData = snapshots.map(s => ({
    month: s.month.slice(0, 7),
    rate: parseFloat((s.savings_rate * 100).toFixed(1)),
  }))

  const areaData = snapshots.map(s => ({
    month: s.month.slice(0, 7),
    'Net Worth': Math.round(s.net_worth),
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1">{monthLabel}</p>
        </div>
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
        >
          {saveMut.isPending ? 'Saving…' : justSaved ? '✓ Saved' : '💾 Save This Month'}
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value={fmt(summary?.total_income ?? 0)} color="text-blue-600" />
        <StatCard label="Total Expenses" value={fmt(summary?.total_expenses ?? 0)} color="text-red-600" />
        <StatCard label="Monthly Surplus" value={fmt(summary?.surplus ?? 0)} color={surplusColor} />
        <StatCard
          label="Savings Rate"
          value={fmtPct(srValue)}
          sub="> 20% excellent · 10–20% good"
          color={srColor}
        />
      </div>

      {/* Net worth quick stat */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Current Net Worth</p>
          <p className={`text-3xl font-bold font-display mt-1 ${(summary?.net_worth ?? 0) >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
            {fmt(summary?.net_worth ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Retirement + savings − total debt</p>
        </div>
        <div className="text-5xl">📈</div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Income vs. Expenses</h2>
          {barData.length === 0 ? (
            <EmptyChart message='No snapshots yet — click "Save This Month" to start tracking.' />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(v as number)} />
                <Legend />
                <Bar dataKey="Income" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense breakdown donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
          {pieData.length === 0 ? (
            <EmptyChart message="No expenses found." />
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {sortedPieData.map(entry => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.name] ?? '#94a3b8' }} />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{fmt(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings rate trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Savings Rate Trend</h2>
          {lineData.length === 0 ? (
            <EmptyChart message='No snapshots yet — click "Save This Month" to start tracking.' />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <ReferenceLine y={20} stroke="#10b981" strokeDasharray="4 4" label={{ value: '20%', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '10%', fill: '#f59e0b', fontSize: 10 }} />
                <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Net worth over time */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Net Worth Over Time</h2>
          {areaData.length === 0 ? (
            <EmptyChart message='No snapshots yet — click "Save This Month" to start tracking.' />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(v as number)} />
                <Area type="monotone" dataKey="Net Worth" stroke="#10b981" strokeWidth={2} fill="url(#nwGradient)" dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Snapshot history */}
      {snapshots.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700">Monthly Snapshots</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Month</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Income</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Expenses</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Surplus</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Savings Rate</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Net Worth</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {[...snapshots].reverse().map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 group">
                  <td className="px-5 py-3 font-medium text-gray-700">{s.month}</td>
                  <td className="px-5 py-3 text-right text-blue-600">{fmt(s.income)}</td>
                  <td className="px-5 py-3 text-right text-red-600">{fmt(s.total_expenses)}</td>
                  <td className={`px-5 py-3 text-right font-medium ${s.surplus >= 0 ? 'text-brand-600' : 'text-red-600'}`}>{fmt(s.surplus)}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{fmtPct(s.savings_rate)}</td>
                  <td className={`px-5 py-3 text-right font-medium ${s.net_worth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(s.net_worth)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteMut.mutate(s.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors">🗑</button>
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
