import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDebts, createDebt, updateDebt, deleteDebt, type DebtAccount } from '../api/budget'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtFull = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const ACCOUNT_TYPES = [
  { value: 'credit_card',  label: 'Credit Card' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'personal',     label: 'Personal Loan' },
  { value: 'other',        label: 'Other' },
]

const TYPE_COLORS: Record<string, string> = {
  credit_card:  'bg-red-100 text-red-700',
  student_loan: 'bg-blue-100 text-blue-700',
  personal:     'bg-orange-100 text-orange-700',
  other:        'bg-gray-100 text-gray-600',
}

/** Months to payoff given balance, monthly rate, and total monthly payment. */
function monthsToPayoff(balance: number, annualRate: number, monthlyPayment: number): number | null {
  if (balance <= 0) return 0
  if (monthlyPayment <= 0) return null
  const r = annualRate / 12
  if (r === 0) return Math.ceil(balance / monthlyPayment)
  if (monthlyPayment <= balance * r) return null   // payment doesn't cover interest
  return Math.ceil(-Math.log(1 - (balance * r) / monthlyPayment) / Math.log(1 + r))
}

function payoffDate(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function totalInterest(balance: number, _annualRate: number, monthlyPayment: number, months: number): number {
  return monthlyPayment * months - balance
}

// ── Debt card ─────────────────────────────────────────────────────────────────

function DebtCard({ debt, onEdit }: { debt: DebtAccount; onEdit: (d: DebtAccount) => void }) {
  const qc = useQueryClient()
  const deleteMut = useMutation({ mutationFn: deleteDebt, onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }) })

  const total = debt.minimum_payment + debt.extra_payment
  const months = monthsToPayoff(debt.balance, debt.interest_rate, total)
  const typeLabel = ACCOUNT_TYPES.find(t => t.value === debt.account_type)?.label ?? debt.account_type
  const interest = months !== null && months > 0 ? totalInterest(debt.balance, debt.interest_rate, total, months) : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{debt.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${TYPE_COLORS[debt.account_type] ?? 'bg-gray-100 text-gray-600'}`}>
            {typeLabel}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(debt)} className="text-xs text-brand-600 hover:underline">Edit</button>
          <button onClick={() => deleteMut.mutate(debt.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-gray-500 text-xs">Balance</p>
          <p className="font-bold text-red-600 text-lg">{fmtFull(debt.balance)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Interest Rate (APR)</p>
          <p className="font-bold text-gray-800">{(debt.interest_rate * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Min. Payment</p>
          <p className="font-medium text-gray-700">{fmtFull(debt.minimum_payment)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Extra Payment</p>
          <p className="font-medium text-gray-700">{fmtFull(debt.extra_payment)}</p>
        </div>
      </div>

      {debt.balance > 0 && (
        <div className="border-t border-gray-100 pt-3 mt-2 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payoff Projection</p>
          {months === null ? (
            <p className="text-xs text-red-500">Payment too low to cover interest — increase monthly payment.</p>
          ) : months === 0 ? (
            <p className="text-xs text-emerald-600">Already paid off!</p>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Months to payoff</span>
                <span className="font-medium text-gray-800">{months} mo ({payoffDate(months)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total monthly payment</span>
                <span className="font-medium text-gray-800">{fmtFull(total)}</span>
              </div>
              {interest !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total interest paid</span>
                  <span className="font-medium text-orange-600">{fmt(interest)}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Add / Edit form ───────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', account_type: 'credit_card', balance: '', interest_rate: '', minimum_payment: '', extra_payment: '0' }

function DebtForm({ initial, onSave, onCancel }: {
  initial?: DebtAccount
  onSave: (data: Omit<DebtAccount, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}) {
  const [f, setF] = useState(initial ? {
    name: initial.name,
    account_type: initial.account_type,
    balance: String(initial.balance),
    interest_rate: String((initial.interest_rate * 100).toFixed(2)),
    minimum_payment: String(initial.minimum_payment),
    extra_payment: String(initial.extra_payment),
  } : EMPTY_FORM)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: f.name,
      account_type: f.account_type,
      balance: parseFloat(f.balance) || 0,
      interest_rate: (parseFloat(f.interest_rate) || 0) / 100,
      minimum_payment: parseFloat(f.minimum_payment) || 0,
      extra_payment: parseFloat(f.extra_payment) || 0,
    })
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 w-full"

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-dashed border-brand-300 p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">{initial ? 'Edit Debt' : 'Add Debt Account'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Account Name</label>
          <input className={inputCls} required placeholder="e.g. Chase Sapphire" value={f.name} onChange={set('name')} />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Type</label>
          <select className={inputCls} value={f.account_type} onChange={set('account_type')}>
            {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Current Balance ($)</label>
          <input className={inputCls} type="number" step="0.01" min="0" required placeholder="0.00" value={f.balance} onChange={set('balance')} />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">APR (%)</label>
          <input className={inputCls} type="number" step="0.01" min="0" max="100" required placeholder="e.g. 19.99" value={f.interest_rate} onChange={set('interest_rate')} />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Min. Monthly Payment ($)</label>
          <input className={inputCls} type="number" step="0.01" min="0" required placeholder="0.00" value={f.minimum_payment} onChange={set('minimum_payment')} />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Extra Payment ($)</label>
          <input className={inputCls} type="number" step="0.01" min="0" placeholder="0.00" value={f.extra_payment} onChange={set('extra_payment')} />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
          {initial ? 'Save Changes' : 'Add Account'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DebtPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<DebtAccount | null>(null)

  const { data: debts = [], isLoading } = useQuery<DebtAccount[]>({ queryKey: ['debts'], queryFn: getDebts })

  const createMut = useMutation({
    mutationFn: createDebt,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['debts'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }); setShowAdd(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateDebt>[1] }) => updateDebt(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['debts'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }); setEditing(null) },
  })

  const totalDebt = debts.reduce((a, d) => a + d.balance, 0)
  const totalMinPayment = debts.reduce((a, d) => a + d.minimum_payment + d.extra_payment, 0)

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Debt Tracker</h1>
          <p className="text-gray-500 mt-1">Track balances, rates, and projected payoff dates.</p>
        </div>
        {!showAdd && !editing && (
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
            + Add Account
          </button>
        )}
      </div>

      {/* Summary cards */}
      {debts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Debt</p>
            <p className="text-3xl font-bold font-display text-red-600 mt-1">{fmt(totalDebt)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Accounts</p>
            <p className="text-3xl font-bold font-display text-gray-800 mt-1">{debts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Monthly Payment</p>
            <p className="text-3xl font-bold font-display text-brand-600 mt-1">{fmt(totalMinPayment)}</p>
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <DebtForm
          onSave={data => createMut.mutate(data)}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Edit form */}
      {editing && (
        <DebtForm
          initial={editing}
          onSave={data => updateMut.mutate({ id: editing.id, data })}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Debt cards */}
      {debts.length === 0 && !showAdd ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">💳</div>
          <p className="font-medium text-gray-700">No debt accounts yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your credit cards, loans, and other debts to track payoff progress.</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600">
            + Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map(d => (
            <DebtCard key={d.id} debt={d} onEdit={setEditing} />
          ))}
        </div>
      )}

      {/* Strategy note */}
      {debts.length > 1 && (
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-700">
          <strong>Avalanche strategy:</strong> Put extra payments toward the highest-rate debt first to minimize total interest paid.
          Highest rate account: <strong>{debts.slice().sort((a, b) => b.interest_rate - a.interest_rate)[0]?.name}</strong>.
        </div>
      )}
    </div>
  )
}
