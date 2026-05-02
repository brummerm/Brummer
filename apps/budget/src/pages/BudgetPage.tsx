import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getIncome, createIncome, updateIncome, deleteIncome,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getAllocations, updateAllocation,
  type IncomeItem,
  type ExpenseItem,
  type SurplusAllocation,
} from '../api/budget'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// ── Inline-editable row for income / expense ──────────────────────────────────

function ItemRow({
  label,
  amount,
  onSaveLabel,
  onSaveAmount,
  onDelete,
}: {
  label: string
  amount: number
  onSaveLabel: (v: string) => void
  onSaveAmount: (v: number) => void
  onDelete: () => void
}) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [editingAmount, setEditingAmount] = useState(false)
  const [labelVal, setLabelVal] = useState(label)
  const [amountVal, setAmountVal] = useState(String(amount))
  const labelRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  const commitLabel = () => {
    setEditingLabel(false)
    if (labelVal.trim() !== label) onSaveLabel(labelVal.trim())
  }
  const commitAmount = () => {
    setEditingAmount(false)
    const n = parseFloat(amountVal)
    if (!isNaN(n) && n !== amount) onSaveAmount(n)
    else setAmountVal(String(amount))
  }

  return (
    <tr className="border-t border-gray-100 group hover:bg-gray-50">
      {/* Label cell */}
      <td className="px-4 py-2 text-gray-700 w-full">
        {editingLabel ? (
          <input
            ref={labelRef}
            className="w-full border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
            value={labelVal}
            onChange={(e) => setLabelVal(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => e.key === 'Enter' && commitLabel()}
            autoFocus
          />
        ) : (
          <span
            className="cursor-text hover:text-brand-700"
            onClick={() => { setEditingLabel(true); setTimeout(() => labelRef.current?.select(), 10) }}
          >
            {label}
          </span>
        )}
      </td>
      {/* Amount cell */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        {editingAmount ? (
          <input
            ref={amountRef}
            type="number"
            step="0.01"
            className="w-32 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
            value={amountVal}
            onChange={(e) => setAmountVal(e.target.value)}
            onBlur={commitAmount}
            onKeyDown={(e) => e.key === 'Enter' && commitAmount()}
            autoFocus
          />
        ) : (
          <span
            className="cursor-text hover:text-brand-700 font-medium text-gray-800"
            onClick={() => { setEditingAmount(true); setTimeout(() => amountRef.current?.select(), 10) }}
          >
            {fmt(amount)}
          </span>
        )}
      </td>
      {/* Delete */}
      <td className="px-4 py-2 text-right">
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          🗑
        </button>
      </td>
    </tr>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ── Income subsection ─────────────────────────────────────────────────────────

function IncomeSubsection({ person, items }: { person: string; items: IncomeItem[] }) {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<IncomeItem, 'id'>> }) =>
      updateIncome(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income'] }),
  })
  const deleteMut = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income'] }),
  })
  const createMut = useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'] })
      qc.invalidateQueries({ queryKey: ['budget-summary'] })
      setAdding(false)
      setNewLabel('')
      setNewAmount('')
    },
  })

  const personLabel = person === 'matthew' ? 'Matthew' : 'Alyssa'
  const total = items.reduce((a, b) => a + b.amount, 0)

  return (
    <div className="mb-4 last:mb-0">
      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
        {personLabel}
      </div>
      <table className="w-full text-sm">
        <tbody>
          {items.map((item) => (
            <ItemRow
              key={item.id}
              label={item.label}
              amount={item.amount}
              onSaveLabel={(v) => updateMut.mutate({ id: item.id, data: { label: v } })}
              onSaveAmount={(v) => {
                updateMut.mutate({ id: item.id, data: { amount: v } })
                qc.invalidateQueries({ queryKey: ['budget-summary'] })
              }}
              onDelete={() => deleteMut.mutate(item.id)}
            />
          ))}
          {adding && (
            <tr className="border-t border-gray-100">
              <td className="px-4 py-2">
                <input
                  className="w-full border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="Label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  autoFocus
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  className="w-32 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </td>
              <td className="px-4 py-2 flex gap-2 justify-end">
                <button
                  onClick={() =>
                    createMut.mutate({
                      person,
                      label: newLabel,
                      amount: parseFloat(newAmount) || 0,
                      sort_order: items.length,
                    })
                  }
                  className="text-xs bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-100 bg-gray-50">
            <td className="px-4 py-2 text-sm font-semibold text-gray-600">Total</td>
            <td className="px-4 py-2 text-right text-sm font-bold text-blue-600">{fmt(total)}</td>
            <td className="px-4 py-2 text-right">
              {!adding && (
                <button
                  onClick={() => setAdding(true)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  + Add
                </button>
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Expense subsection ────────────────────────────────────────────────────────

function ExpenseSubsection({ category, label, items }: { category: string; label: string; items: ExpenseItem[] }) {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<ExpenseItem, 'id'>> }) =>
      updateExpense(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['budget-summary'] })
    },
  })
  const deleteMut = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['budget-summary'] })
    },
  })
  const createMut = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['budget-summary'] })
      setAdding(false)
      setNewLabel('')
      setNewAmount('')
    },
  })

  const total = items.reduce((a, b) => a + b.amount, 0)

  return (
    <div className="mb-4 last:mb-0">
      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
        {label}
      </div>
      <table className="w-full text-sm">
        <tbody>
          {items.map((item) => (
            <ItemRow
              key={item.id}
              label={item.label}
              amount={item.amount}
              onSaveLabel={(v) => updateMut.mutate({ id: item.id, data: { label: v } })}
              onSaveAmount={(v) => updateMut.mutate({ id: item.id, data: { amount: v } })}
              onDelete={() => deleteMut.mutate(item.id)}
            />
          ))}
          {adding && (
            <tr className="border-t border-gray-100">
              <td className="px-4 py-2">
                <input
                  className="w-full border border-brand-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="Label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  autoFocus
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  className="w-32 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </td>
              <td className="px-4 py-2 flex gap-2 justify-end">
                <button
                  onClick={() =>
                    createMut.mutate({
                      category,
                      label: newLabel,
                      amount: parseFloat(newAmount) || 0,
                      sort_order: items.length,
                    })
                  }
                  className="text-xs bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-100 bg-gray-50">
            <td className="px-4 py-2 text-sm font-semibold text-gray-600">Total</td>
            <td className="px-4 py-2 text-right text-sm font-bold text-red-600">{fmt(total)}</td>
            <td className="px-4 py-2 text-right">
              {!adding && (
                <button
                  onClick={() => setAdding(true)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  + Add
                </button>
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Allocation row ────────────────────────────────────────────────────────────

function AllocationRow({
  item,
  onSave,
}: {
  item: SurplusAllocation
  onSave: (pct: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String((item.percentage * 100).toFixed(0)))
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    setEditing(false)
    const n = parseFloat(val)
    if (!isNaN(n)) onSave(n / 100)
    else setVal(String((item.percentage * 100).toFixed(0)))
  }

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-5 py-3 text-gray-700">{item.label}</td>
      <td className="px-5 py-3 text-right">
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            step="1"
            min="0"
            max="100"
            className="w-20 border border-brand-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-400"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            autoFocus
          />
        ) : (
          <span
            className="cursor-text hover:text-brand-700 font-medium"
            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 10) }}
          >
            {(item.percentage * 100).toFixed(0)}%
          </span>
        )}
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const qc = useQueryClient()

  const { data: income = [], isLoading: incLoading } = useQuery<IncomeItem[]>({
    queryKey: ['income'],
    queryFn: getIncome,
  })
  const { data: expenses = [], isLoading: expLoading } = useQuery<ExpenseItem[]>({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  })
  const { data: allocations = [], isLoading: allocLoading } = useQuery<SurplusAllocation[]>({
    queryKey: ['allocations'],
    queryFn: getAllocations,
  })

  const updateAllocMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<SurplusAllocation, 'id'>> }) =>
      updateAllocation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  })

  const matthewIncome = income.filter((i) => i.person === 'matthew')
  const alyssaIncome = income.filter((i) => i.person === 'alyssa')
  const sharedExpenses = expenses.filter((e) => e.category === 'shared')
  const matthewExpenses = expenses.filter((e) => e.category === 'matthew')
  const alyssaExpenses = expenses.filter((e) => e.category === 'alyssa')

  const allocationTotal = allocations.reduce((a, b) => a + b.percentage, 0)
  const allocationValid = Math.abs(allocationTotal - 1.0) < 0.001

  if (incLoading || expLoading || allocLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Budget</h1>
        <p className="text-gray-500 mt-1">Click any label or amount to edit inline.</p>
      </div>

      {/* Income */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-3">Income</h2>
        <SectionCard title="Income Items">
          <IncomeSubsection person="matthew" items={matthewIncome} />
          <IncomeSubsection person="alyssa" items={alyssaIncome} />
        </SectionCard>
      </div>

      {/* Shared Expenses */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-3">Shared Expenses</h2>
        <SectionCard title="Shared">
          <ExpenseSubsection category="shared" label="Shared" items={sharedExpenses} />
        </SectionCard>
      </div>

      {/* Individual Expenses */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-3">Individual Expenses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionCard title="Matthew">
            <ExpenseSubsection category="matthew" label="Matthew" items={matthewExpenses} />
          </SectionCard>
          <SectionCard title="Alyssa">
            <ExpenseSubsection category="alyssa" label="Alyssa" items={alyssaExpenses} />
          </SectionCard>
        </div>
      </div>

      {/* Surplus Allocations */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-3">
          Surplus Allocation
          {allocationValid ? (
            <span className="ml-2 text-sm text-brand-600 font-normal">✓ 100%</span>
          ) : (
            <span className="ml-2 text-sm text-red-500 font-normal">
              ⚠ Total: {(allocationTotal * 100).toFixed(0)}% (must be 100%)
            </span>
          )}
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Label</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <AllocationRow
                  key={a.id}
                  item={a}
                  onSave={(pct) => updateAllocMut.mutate({ id: a.id, data: { percentage: pct } })}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className={`border-t-2 ${allocationValid ? 'border-brand-200 bg-brand-50' : 'border-red-200 bg-red-50'}`}>
                <td className="px-5 py-3 font-semibold text-gray-700">Total</td>
                <td className={`px-5 py-3 text-right font-bold ${allocationValid ? 'text-brand-700' : 'text-red-600'}`}>
                  {(allocationTotal * 100).toFixed(0)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
