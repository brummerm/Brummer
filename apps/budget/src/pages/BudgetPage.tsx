import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  getIncome, createIncome, updateIncome, deleteIncome,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getAllocations, createAllocation, updateAllocation, deleteAllocation,
  getActuals, saveActuals,
  type IncomeItem, type ExpenseItem, type SurplusAllocation,
} from '../api/budget'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const EXPENSE_CATEGORIES = [
  'Housing', 'Food', 'Transport', 'Debt', 'Health',
  'Entertainment', 'Subscriptions', 'Savings', 'Personal', 'Other',
]

type Tab = 'income' | 'expenses' | 'allocations' | 'actuals'

// ── Inline-editable cell ──────────────────────────────────────────────────────

function EditableText({ value, onSave, className = '' }: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const ref = useRef<HTMLInputElement>(null)

  const commit = () => { setEditing(false); if (val.trim() !== value) onSave(val.trim()) }

  return editing ? (
    <input ref={ref} className={`border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400 ${className}`}
      value={val} onChange={e => setVal(e.target.value)}
      onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()} autoFocus />
  ) : (
    <span className={`cursor-text hover:text-brand-700 ${className}`}
      onClick={() => { setEditing(true); setTimeout(() => ref.current?.select(), 10) }}>{value}</span>
  )
}

function EditableAmount({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(value))
  const ref = useRef<HTMLInputElement>(null)

  const commit = () => {
    setEditing(false)
    const n = parseFloat(val)
    if (!isNaN(n) && n !== value) onSave(n)
    else setVal(String(value))
  }

  return editing ? (
    <input ref={ref} type="number" step="0.01"
      className="w-28 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
      value={val} onChange={e => setVal(e.target.value)}
      onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()} autoFocus />
  ) : (
    <span className="cursor-text hover:text-brand-700 font-medium"
      onClick={() => { setEditing(true); setTimeout(() => ref.current?.select(), 10) }}>{fmt(value)}</span>
  )
}

// ── Income tab ────────────────────────────────────────────────────────────────

function IncomeTab() {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const { data: items = [] } = useQuery<IncomeItem[]>({ queryKey: ['income'], queryFn: getIncome })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<IncomeItem> }) => updateIncome(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['income'] }) })
  const deleteMut = useMutation({ mutationFn: deleteIncome, onSuccess: () => qc.invalidateQueries({ queryKey: ['income'] }) })
  const createMut = useMutation({
    mutationFn: createIncome,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['income'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }); setAdding(false); setNewLabel(''); setNewAmount('') },
  })

  const total = items.reduce((a, b) => a + b.amount, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left text-gray-500 font-medium">Source</th>
            <th className="px-5 py-3 text-right text-gray-500 font-medium">Monthly Amount</th>
            <th className="px-5 py-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50 group">
              <td className="px-5 py-3">
                <EditableText value={item.label} onSave={v => updateMut.mutate({ id: item.id, data: { label: v } })} className="w-full" />
              </td>
              <td className="px-5 py-3 text-right">
                <EditableAmount value={item.amount} onSave={v => { updateMut.mutate({ id: item.id, data: { amount: v } }); qc.invalidateQueries({ queryKey: ['budget-summary'] }) }} />
              </td>
              <td className="px-5 py-3 text-right">
                <button onClick={() => deleteMut.mutate(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors">🗑</button>
              </td>
            </tr>
          ))}
          {adding && (
            <tr className="border-t border-gray-100">
              <td className="px-5 py-3">
                <input className="w-full border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} autoFocus />
              </td>
              <td className="px-5 py-3 text-right">
                <input type="number" step="0.01"
                  className="w-28 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
              </td>
              <td className="px-5 py-3 flex gap-2 justify-end">
                <button onClick={() => createMut.mutate({ label: newLabel, amount: parseFloat(newAmount) || 0, sort_order: items.length })}
                  className="text-xs bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600">Save</button>
                <button onClick={() => setAdding(false)} className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="px-5 py-3 font-semibold text-gray-700">Total Income</td>
            <td className="px-5 py-3 text-right font-bold text-blue-600">{fmt(total)}</td>
            <td className="px-5 py-3 text-right">
              {!adding && <button onClick={() => setAdding(true)} className="text-xs text-brand-600 hover:underline">+ Add</button>}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Expenses tab ──────────────────────────────────────────────────────────────

function ExpensesTab() {
  const qc = useQueryClient()
  const [addingCat, setAddingCat] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newCat, setNewCat] = useState(EXPENSE_CATEGORIES[0])

  const { data: items = [] } = useQuery<ExpenseItem[]>({ queryKey: ['expenses'], queryFn: getExpenses })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<ExpenseItem> }) => updateExpense(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }) } })
  const deleteMut = useMutation({ mutationFn: deleteExpense, onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }) } })
  const createMut = useMutation({
    mutationFn: createExpense,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }); setAddingCat(null); setNewLabel(''); setNewAmount('') },
  })

  const byCategory: Record<string, ExpenseItem[]> = {}
  for (const item of items) {
    if (!byCategory[item.category]) byCategory[item.category] = []
    byCategory[item.category].push(item)
  }

  const total = items.reduce((a, b) => a + b.amount, 0)

  return (
    <div className="space-y-4">
      {EXPENSE_CATEGORIES.filter(cat => byCategory[cat]?.length || addingCat === cat).map(cat => {
        const catItems = byCategory[cat] ?? []
        const catTotal = catItems.reduce((a, b) => a + b.amount, 0)
        return (
          <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">{cat}</span>
              <span className="text-sm font-bold text-red-500">{fmt(catTotal)}</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {catItems.map(item => (
                  <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50 group">
                    <td className="px-5 py-2.5 w-full">
                      <EditableText value={item.label} onSave={v => updateMut.mutate({ id: item.id, data: { label: v } })} className="w-full" />
                    </td>
                    <td className="px-5 py-2.5 text-right whitespace-nowrap">
                      <EditableAmount value={item.amount} onSave={v => updateMut.mutate({ id: item.id, data: { amount: v } })} />
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <button onClick={() => deleteMut.mutate(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors">🗑</button>
                    </td>
                  </tr>
                ))}
                {addingCat === cat && (
                  <tr className="border-t border-gray-100">
                    <td className="px-5 py-2.5">
                      <input className="w-full border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                        placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} autoFocus />
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <input type="number" step="0.01" className="w-28 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
                        placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                    </td>
                    <td className="px-5 py-2.5 flex gap-1 justify-end">
                      <button onClick={() => createMut.mutate({ category: cat, label: newLabel, amount: parseFloat(newAmount) || 0, sort_order: catItems.length })}
                        className="text-xs bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600">Save</button>
                      <button onClick={() => setAddingCat(null)} className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100">
                  <td colSpan={2} className="px-5 py-2" />
                  <td className="px-5 py-2 text-right">
                    {addingCat !== cat && <button onClick={() => { setAddingCat(cat); setNewLabel(''); setNewAmount('') }} className="text-xs text-brand-600 hover:underline">+ Add</button>}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      })}

      {/* Add item in a new category */}
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Add expense in any category</p>
        <div className="flex flex-wrap gap-2 items-end">
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
          <input type="number" step="0.01" className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
          <button onClick={() => { if (newLabel) createMut.mutate({ category: newCat, label: newLabel, amount: parseFloat(newAmount) || 0, sort_order: 99 }) }}
            disabled={!newLabel}
            className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 px-5 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-700">Total Expenses</span>
        <span className="font-bold text-red-600 text-lg">{fmt(total)}</span>
      </div>
    </div>
  )
}

// ── Allocations tab ───────────────────────────────────────────────────────────

function AllocationsTab() {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newPct, setNewPct] = useState('')

  const { data: allocations = [] } = useQuery<SurplusAllocation[]>({ queryKey: ['allocations'], queryFn: getAllocations })
  const { data: summary } = useQuery({ queryKey: ['budget-summary'], queryFn: async () => { const m = await import('../api/budget'); return m.getSummary() } })

  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<SurplusAllocation> }) => updateAllocation(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }) })
  const deleteMut = useMutation({ mutationFn: deleteAllocation, onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }) })
  const createMut = useMutation({ mutationFn: createAllocation, onSuccess: () => { qc.invalidateQueries({ queryKey: ['allocations'] }); setAdding(false); setNewLabel(''); setNewPct('') } })

  const totalPct = allocations.reduce((a, b) => a + b.percentage, 0)
  const valid = Math.abs(totalPct - 1.0) < 0.001
  const surplus = summary?.surplus ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left text-gray-500 font-medium">Label</th>
            <th className="px-5 py-3 text-right text-gray-500 font-medium">%</th>
            <th className="px-5 py-3 text-right text-gray-500 font-medium">Amount</th>
            <th className="px-5 py-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {allocations.map(a => (
            <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50 group">
              <td className="px-5 py-3">
                <EditableText value={a.label} onSave={v => updateMut.mutate({ id: a.id, data: { label: v } })} className="w-full" />
              </td>
              <td className="px-5 py-3 text-right">
                <EditableAmount value={parseFloat((a.percentage * 100).toFixed(0))} onSave={v => updateMut.mutate({ id: a.id, data: { percentage: v / 100 } })} />
                <span className="text-gray-500 ml-1">%</span>
              </td>
              <td className="px-5 py-3 text-right font-medium text-brand-700">{fmt(surplus * a.percentage)}</td>
              <td className="px-5 py-3 text-right">
                <button onClick={() => deleteMut.mutate(a.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors">🗑</button>
              </td>
            </tr>
          ))}
          {adding && (
            <tr className="border-t border-gray-100">
              <td className="px-5 py-3">
                <input className="w-full border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} autoFocus />
              </td>
              <td className="px-5 py-3 text-right">
                <input type="number" className="w-20 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="0" value={newPct} onChange={e => setNewPct(e.target.value)} />
              </td>
              <td />
              <td className="px-5 py-3 flex gap-1 justify-end">
                <button onClick={() => createMut.mutate({ label: newLabel, percentage: parseFloat(newPct) / 100 || 0, sort_order: allocations.length })}
                  className="text-xs bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600">Save</button>
                <button onClick={() => setAdding(false)} className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className={`border-t-2 ${valid ? 'border-brand-200 bg-brand-50' : 'border-red-200 bg-red-50'}`}>
            <td className="px-5 py-3 font-semibold text-gray-700">Total</td>
            <td className={`px-5 py-3 text-right font-bold ${valid ? 'text-brand-700' : 'text-red-600'}`}>
              {(totalPct * 100).toFixed(0)}%
              {!valid && <span className="ml-2 text-xs font-normal">(must equal 100%)</span>}
            </td>
            <td className="px-5 py-3 text-right font-bold text-brand-700">{fmt(surplus)}</td>
            <td className="px-5 py-3 text-right">
              {!adding && <button onClick={() => setAdding(true)} className="text-xs text-brand-600 hover:underline">+ Add</button>}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Actuals tab ───────────────────────────────────────────────────────────────

function ActualsTab() {
  const thisMonth = format(new Date(), 'yyyy-MM')
  const [month, setMonth] = useState(thisMonth)
  const qc = useQueryClient()

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['actuals', month],
    queryFn: () => getActuals(month),
  })

  const [edits, setEdits] = useState<Record<string, number>>({})

  const saveMut = useMutation({
    mutationFn: () => saveActuals(month, rows.map(r => ({
      category: r.category,
      budgeted: r.budgeted,
      actual: edits[r.category] ?? r.actual,
    }))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['actuals', month] }); setEdits({}) },
  })

  const fmt2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const totalBudgeted = rows.reduce((a, r) => a + r.budgeted, 0)
  const totalActual = rows.reduce((a, r) => a + (edits[r.category] ?? r.actual), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Month:</label>
        <input type="month" value={month} onChange={e => { setMonth(e.target.value); setEdits({}) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Category</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Budgeted</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Actual</th>
                <th className="px-5 py-3 text-right text-gray-500 font-medium">Diff</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const actual = edits[r.category] ?? r.actual
                const diff = actual - r.budgeted
                return (
                  <tr key={r.category} className="border-t border-gray-100">
                    <td className="px-5 py-3 text-gray-700 font-medium">{r.category}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{fmt2(r.budgeted)}</td>
                    <td className="px-5 py-3 text-right">
                      <input type="number" step="0.01"
                        className="w-28 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
                        value={actual || ''}
                        onChange={e => setEdits(prev => ({ ...prev, [r.category]: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00" />
                    </td>
                    <td className={`px-5 py-3 text-right font-medium text-xs ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {diff !== 0 ? `${diff > 0 ? '+' : ''}${fmt2(diff)}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-700">Total</td>
                <td className="px-5 py-3 text-right font-bold text-gray-700">{fmt2(totalBudgeted)}</td>
                <td className="px-5 py-3 text-right font-bold text-gray-700">{fmt2(totalActual)}</td>
                <td className={`px-5 py-3 text-right font-bold text-sm ${totalActual - totalBudgeted > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {totalActual - totalBudgeted !== 0 ? `${totalActual - totalBudgeted > 0 ? '+' : ''}${fmt2(totalActual - totalBudgeted)}` : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
        className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors">
        {saveMut.isPending ? 'Saving…' : saveMut.isSuccess ? '✓ Saved' : 'Save Actuals'}
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [tab, setTab] = useState<Tab>('income')

  const tabClass = (t: Tab) =>
    `px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Budget</h1>
        <p className="text-gray-500 mt-1">Click any value to edit inline.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['income', 'expenses', 'allocations', 'actuals'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tabClass(t)}>{t === 'actuals' ? 'Actuals' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === 'income' && <IncomeTab />}
      {tab === 'expenses' && <ExpensesTab />}
      {tab === 'allocations' && <AllocationsTab />}
      {tab === 'actuals' && <ActualsTab />}
    </div>
  )
}
