import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  getRetirement,
  createRetirement,
  deleteRetirement,
  type RetirementEntry,
} from '../api/budget'

const ACCOUNTS = ['TSP', 'TRS', 'TDA', 'NavyFed'] as const

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function RetirementPage() {
  const qc = useQueryClient()

  const { data: entries = [], isLoading } = useQuery<RetirementEntry[]>({
    queryKey: ['retirement'],
    queryFn: getRetirement,
  })

  const [account, setAccount] = useState<string>(ACCOUNTS[0])
  const [balance, setBalance] = useState('')
  const [date, setDate] = useState(todayISO())
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const createMut = useMutation({
    mutationFn: createRetirement,
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['retirement'] })
      setSaveStatus('saved')
      setBalance('')
      setDate(todayISO())
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
    onError: () => setSaveStatus('idle'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteRetirement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retirement'] }),
  })

  // Latest balance per account (entries are already desc by date)
  const latestPerAccount: Record<string, number> = {}
  for (const entry of entries) {
    if (!(entry.account_name in latestPerAccount)) {
      latestPerAccount[entry.account_name] = entry.balance
    }
  }
  const retirementTotal = Object.values(latestPerAccount).reduce((a, b) => a + b, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(balance)
    if (!n || !date) return
    createMut.mutate({ account_name: account, balance: n, recorded_date: date })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Retirement</h1>
        <p className="text-gray-500 mt-1">Track account balances over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add entry form + history */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Entry */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Add Entry</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Account</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {ACCOUNTS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <button
                type="submit"
                disabled={createMut.isPending}
                className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
              >
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Add Entry'}
              </button>
            </form>
          </div>

          {/* History table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50 group">
                      <td className="px-5 py-3 text-gray-600">
                        {format(new Date(entry.recorded_date + 'T12:00:00'), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3 text-gray-700 font-medium">
                        {entry.account_name}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-800">
                        {fmt(entry.balance)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => deleteMut.mutate(entry.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Current totals */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Current Totals</h2>
            {ACCOUNTS.map((acct) => (
              <div
                key={acct}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{acct}</span>
                <span className="text-sm font-medium text-gray-800">
                  {acct in latestPerAccount ? fmt(latestPerAccount[acct]) : '—'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-sm font-bold text-brand-700">{fmt(retirementTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
