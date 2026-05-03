import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getRetirement, createRetirement, deleteRetirement, type RetirementEntry } from '../api/budget'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtK = (n: number) => `$${(n / 1000).toFixed(0)}k`

const ACCOUNT_COLORS: Record<string, string> = {
  TSP:     '#6366f1',
  TRS:     '#10b981',
  TDA:     '#f59e0b',
  NavyFed: '#3b82f6',
}

function todayISO() { return new Date().toISOString().slice(0, 10) }

export default function RetirementPage() {
  const qc = useQueryClient()
  const { data: entries = [], isLoading } = useQuery<RetirementEntry[]>({
    queryKey: ['retirement'], queryFn: getRetirement,
  })

  // Derive distinct accounts
  const allAccounts = Array.from(new Set(entries.map(e => e.account_name))).sort()

  const [account, setAccount] = useState<string>('')
  const [balance, setBalance] = useState('')
  const [date, setDate] = useState(todayISO())
  const [customAccount, setCustomAccount] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const createMut = useMutation({
    mutationFn: createRetirement,
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['retirement'] })
      qc.invalidateQueries({ queryKey: ['budget-summary'] })
      setSaveStatus('saved')
      setBalance('')
      setDate(todayISO())
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
    onError: () => setSaveStatus('idle'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteRetirement,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['retirement'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }) },
  })

  // Latest balance per account
  const latestPerAccount: Record<string, number> = {}
  for (const e of entries) {
    if (!(e.account_name in latestPerAccount)) latestPerAccount[e.account_name] = e.balance
  }
  const retirementTotal = Object.values(latestPerAccount).reduce((a, b) => a + b, 0)

  // Chart data: group entries by date, sum all accounts per date point
  const byDate: Record<string, Record<string, number>> = {}
  for (const e of [...entries].reverse()) {   // entries are desc, reverse for chronological
    if (!byDate[e.recorded_date]) byDate[e.recorded_date] = {}
    byDate[e.recorded_date][e.account_name] = e.balance
  }
  // Build running totals (carry forward last known balance for each account)
  const chartData: Array<Record<string, string | number>> = []
  const running: Record<string, number> = {}
  for (const [d, updates] of Object.entries(byDate).sort()) {
    Object.assign(running, updates)
    const row: Record<string, string | number> = { date: d }
    for (const acct of allAccounts) row[acct] = running[acct] ?? 0
    row.Total = Object.values(running).reduce((a, b) => a + b, 0)
    chartData.push(row)
  }

  const effectiveAccount = account === '__custom__' ? customAccount : account || (allAccounts[0] ?? 'TSP')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(balance)
    if (!n || !date || !effectiveAccount) return
    createMut.mutate({ account_name: effectiveAccount, balance: n, recorded_date: date })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Retirement</h1>
        <p className="text-gray-500 mt-1">Track account balances over time.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(latestPerAccount).map(([name, bal]) => (
          <div key={name} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">{name}</p>
            <p className="text-xl font-bold font-display text-brand-600 mt-1">{fmt(bal)}</p>
          </div>
        ))}
        <div className="bg-white rounded-xl border-2 border-brand-200 p-4 text-center">
          <p className="text-xs text-gray-500 font-medium">Total</p>
          <p className="text-xl font-bold font-display text-brand-700 mt-1">{fmt(retirementTotal)}</p>
        </div>
      </div>

      {/* Balance over time chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Balance Over Time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtK} />
              <Tooltip formatter={(v) => fmt(v as number)} />
              <Legend />
              {allAccounts.map(acct => (
                <Line key={acct} type="monotone" dataKey={acct}
                  stroke={ACCOUNT_COLORS[acct] ?? '#94a3b8'} strokeWidth={2}
                  dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
              <Line type="monotone" dataKey="Total" stroke="#1e293b" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add entry */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Add Entry</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Account</label>
                <select value={account} onChange={e => setAccount(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  {allAccounts.map(a => <option key={a} value={a}>{a}</option>)}
                  <option value="__custom__">+ New account…</option>
                </select>
              </div>
              {account === '__custom__' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">Account Name</label>
                  <input className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="e.g. Roth IRA" value={customAccount} onChange={e => setCustomAccount(e.target.value)} required />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Balance ($)</label>
                <input type="number" step="0.01" min="0" placeholder="0.00" value={balance} onChange={e => setBalance(e.target.value)} required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <button type="submit" disabled={createMut.isPending}
                className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors">
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Add Entry'}
              </button>
            </form>
          </div>

          {/* History table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-700">History</h2>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Loading…</div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No entries yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-gray-600 font-medium">Date</th>
                    <th className="px-5 py-3 text-left text-gray-600 font-medium">Account</th>
                    <th className="px-5 py-3 text-right text-gray-600 font-medium">Balance</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50 group">
                      <td className="px-5 py-3 text-gray-600">
                        {format(new Date(entry.recorded_date + 'T12:00:00'), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{entry.account_name}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-800">{fmt(entry.balance)}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => deleteMut.mutate(entry.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Current totals sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          <h2 className="font-semibold text-gray-700 mb-4">Current Totals</h2>
          {Object.entries(latestPerAccount).map(([name, bal]) => (
            <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCOUNT_COLORS[name] ?? '#94a3b8' }} />
                <span className="text-sm text-gray-600">{name}</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{fmt(bal)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-sm font-bold text-brand-700">{fmt(retirementTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
