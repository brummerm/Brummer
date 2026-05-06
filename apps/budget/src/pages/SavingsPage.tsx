import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSavings, createSavings, updateSavings, deleteSavings, type SavingsAccount } from '../api/budget'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const ACCOUNT_TYPES = ['checking', 'savings', 'money_market', 'cd', 'other'] as const
const TYPE_LABELS: Record<string, string> = {
  checking:     'Checking',
  savings:      'High-Yield Savings',
  money_market: 'Money Market',
  cd:           'CD',
  other:        'Other',
}
const TYPE_COLORS: Record<string, string> = {
  checking:     '#3b82f6',
  savings:      '#10b981',
  money_market: '#6366f1',
  cd:           '#f59e0b',
  other:        '#94a3b8',
}

export default function SavingsPage() {
  const qc = useQueryClient()
  const { data: accounts = [], isLoading } = useQuery<SavingsAccount[]>({
    queryKey: ['savings'], queryFn: getSavings,
  })

  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState('savings')
  const [balance, setBalance] = useState('')

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editBalance, setEditBalance] = useState('')
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['savings'] })
    qc.invalidateQueries({ queryKey: ['budget-summary'] })
  }

  const createMut = useMutation({ mutationFn: createSavings, onSuccess: () => { invalidate(); setName(''); setBalance('') } })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateSavings>[1] }) => updateSavings(id, data), onSuccess: () => { invalidate(); setEditingId(null) } })
  const deleteMut = useMutation({ mutationFn: deleteSavings, onSuccess: invalidate })

  const total = accounts.reduce((s, a) => s + a.balance, 0)

  const startEdit = (acct: SavingsAccount) => {
    setEditingId(acct.id)
    setEditBalance(acct.balance.toString())
    setEditName(acct.name)
    setEditType(acct.account_type)
  }

  const commitEdit = (id: number) => {
    updateMut.mutate({ id, data: { name: editName, account_type: editType, balance: parseFloat(editBalance) || 0 } })
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(balance)
    if (!name || isNaN(n)) return
    createMut.mutate({ name, account_type: accountType, balance: n })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Savings & Cash</h1>
        <p className="text-gray-500 mt-1">Track your liquid assets — checking, savings, and cash accounts.</p>
      </div>

      {/* Total card */}
      <div className="bg-white rounded-xl border-2 border-brand-200 p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Liquid Assets</p>
          <p className="text-4xl font-bold font-display text-brand-600 mt-1">{fmt(total)}</p>
          <p className="text-xs text-gray-400 mt-1">Included in your net worth calculation</p>
        </div>
        <div className="text-5xl">🏦</div>
      </div>

      {/* Account cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acct => (
            <div key={acct.id} className="bg-white rounded-xl border border-gray-200 p-5">
              {editingId === acct.id ? (
                <div className="space-y-2">
                  <input className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    value={editName} onChange={e => setEditName(e.target.value)} placeholder="Account name" />
                  <select className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    value={editType} onChange={e => setEditType(e.target.value)}>
                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" min="0" step="0.01"
                      className="w-full border border-gray-300 rounded-md pl-6 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      value={editBalance} onChange={e => setEditBalance(e.target.value)} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => commitEdit(acct.id)} disabled={updateMut.isPending}
                      className="flex-1 bg-brand-500 text-white rounded-md py-1.5 text-sm font-medium hover:bg-brand-600 disabled:opacity-60">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 text-gray-500 hover:text-gray-700 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: TYPE_COLORS[acct.account_type] ?? '#94a3b8' }} />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{acct.name}</p>
                        <p className="text-xs text-gray-400">{TYPE_LABELS[acct.account_type] ?? acct.account_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => startEdit(acct)} className="text-gray-400 hover:text-brand-500 text-xs transition-colors">✏️</button>
                      <button onClick={() => { if (confirm(`Delete "${acct.name}"?`)) deleteMut.mutate(acct.id) }}
                        className="text-gray-400 hover:text-red-500 text-xs transition-colors">🗑</button>
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-display text-gray-900">{fmt(acct.balance)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => startEdit(acct)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                      Edit balance
                    </button>
                    <span className="text-gray-300">·</span>
                    <button onClick={() => { if (confirm(`Delete "${acct.name}"?`)) deleteMut.mutate(acct.id) }}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add account form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">{accounts.length === 0 ? 'Add your first account' : 'Add Account'}</h2>
        {isLoading ? null : (
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Account Name</label>
              <input className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="e.g. Chase Savings" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Type</label>
              <select value={accountType} onChange={e => setAccountType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Current Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min="0" step="0.01" placeholder="0.00"
                  value={balance} onChange={e => setBalance(e.target.value)} required
                  className="border border-gray-300 rounded-md pl-6 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={createMut.isPending}
                className="w-full bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors">
                {createMut.isPending ? 'Adding…' : 'Add Account'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Breakdown table */}
      {accounts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700">All Accounts</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Account</th>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Type</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Balance</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">% of Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {accounts.map(acct => (
                <tr key={acct.id} className="border-t border-gray-100 hover:bg-gray-50 group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[acct.account_type] ?? '#94a3b8' }} />
                      <span className="font-medium text-gray-800">{acct.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{TYPE_LABELS[acct.account_type] ?? acct.account_type}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-800">{fmt(acct.balance)}</td>
                  <td className="px-5 py-3 text-right text-gray-500">
                    {total > 0 ? ((acct.balance / total) * 100).toFixed(1) + '%' : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(acct)} className="text-gray-400 hover:text-brand-500 transition-colors">✏️</button>
                      <button onClick={() => { if (confirm(`Delete "${acct.name}"?`)) deleteMut.mutate(acct.id) }}
                        className="text-gray-300 hover:text-red-500 transition-colors">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={2} className="px-5 py-3 font-semibold text-gray-700">Total</td>
                <td className="px-5 py-3 text-right font-bold text-brand-600">{fmt(total)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
