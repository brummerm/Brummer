import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  getSummary,
  getIncome,
  getExpenses,
  getAllocations,
  getRetirement,
  type IncomeItem,
  type ExpenseItem,
  type SurplusAllocation,
  type RetirementEntry,
} from '../api/budget'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtPct(n: number) {
  return (n * 100).toFixed(1) + '%'
}

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string
  value: string
  colorClass: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-1">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className={`text-3xl font-bold font-display ${colorClass}`}>{value}</span>
    </div>
  )
}

export default function DashboardPage() {
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['budget-summary'],
    queryFn: getSummary,
  })
  const { data: income = [] } = useQuery<IncomeItem[]>({
    queryKey: ['income'],
    queryFn: getIncome,
  })
  const { data: expenses = [] } = useQuery<ExpenseItem[]>({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  })
  const { data: allocations = [] } = useQuery<SurplusAllocation[]>({
    queryKey: ['allocations'],
    queryFn: getAllocations,
  })
  const { data: retirement = [] } = useQuery<RetirementEntry[]>({
    queryKey: ['retirement'],
    queryFn: getRetirement,
  })

  const now = new Date()
  const monthLabel = format(now, 'MMMM yyyy')

  // Derive latest balance per account
  const latestPerAccount: Record<string, number> = {}
  for (const entry of retirement) {
    if (!(entry.account_name in latestPerAccount)) {
      latestPerAccount[entry.account_name] = entry.balance
    }
  }
  const retirementTotal = Object.values(latestPerAccount).reduce((a, b) => a + b, 0)

  const matthewIncome = income.filter((i) => i.person === 'matthew')
  const alyssaIncome = income.filter((i) => i.person === 'alyssa')

  const sharedExpenses = expenses.filter((e) => e.category === 'shared')
  const matthewExpenses = expenses.filter((e) => e.category === 'matthew')
  const alyssaExpenses = expenses.filter((e) => e.category === 'alyssa')

  const allocationTotal = allocations.reduce((a, b) => a + b.percentage, 0)
  const allocationValid = Math.abs(allocationTotal - 1.0) < 0.001

  const savingsRate = summary?.savings_rate ?? 0
  const savingsColor =
    savingsRate > 0.2
      ? 'bg-emerald-500'
      : savingsRate >= 0.1
        ? 'bg-yellow-400'
        : 'bg-red-500'
  const savingsTextColor =
    savingsRate > 0.2
      ? 'text-emerald-700'
      : savingsRate >= 0.1
        ? 'text-yellow-700'
        : 'text-red-700'

  if (sumLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Monthly Overview</h1>
        <p className="text-gray-500 mt-1">{monthLabel}</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Combined Income"
          value={fmt(summary?.combined_income ?? 0)}
          colorClass="text-blue-600"
        />
        <StatCard
          label="Total Expenses"
          value={fmt(summary?.total_expenses ?? 0)}
          colorClass="text-red-600"
        />
        <StatCard
          label="Monthly Surplus"
          value={fmt(summary?.surplus ?? 0)}
          colorClass={(summary?.surplus ?? 0) >= 0 ? 'text-brand-600' : 'text-red-600'}
        />
      </div>

      {/* Savings rate bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Savings Rate</span>
          <span className={`font-bold ${savingsTextColor}`}>
            {fmtPct(savingsRate)}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`${savingsColor} h-3 rounded-full transition-all`}
            style={{ width: `${Math.min(savingsRate * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Benchmark: &gt;20% excellent · 10–20% good · &lt;10% needs attention
        </p>
      </div>

      {/* Income breakdown */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-3">Income</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Matthew", items: matthewIncome },
            { label: "Alyssa", items: alyssaIncome },
          ].map(({ label, items }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <h3 className="font-semibold text-gray-700 mb-3">{label}</h3>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-600">{item.label}</td>
                      <td className="py-1.5 text-right font-medium text-gray-800">
                        {fmt(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 font-semibold text-gray-700">Total</td>
                    <td className="pt-3 text-right font-bold text-blue-600">
                      {fmt(items.reduce((a, b) => a + b.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Expense breakdown */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-3">Expenses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Shared", items: sharedExpenses },
            { label: "Matthew", items: matthewExpenses },
            { label: "Alyssa", items: alyssaExpenses },
          ].map(({ label, items }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <h3 className="font-semibold text-gray-700 mb-3">{label}</h3>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-600 pr-2">{item.label}</td>
                      <td className="py-1.5 text-right font-medium text-gray-800 whitespace-nowrap">
                        {fmt(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 font-semibold text-gray-700">Total</td>
                    <td className="pt-3 text-right font-bold text-red-600">
                      {fmt(items.reduce((a, b) => a + b.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Surplus allocation */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-3">
          Surplus Allocation
          {allocationValid ? (
            <span className="ml-2 text-sm text-brand-600 font-normal">✓ 100%</span>
          ) : (
            <span className="ml-2 text-sm text-red-500 font-normal">
              ⚠ {fmtPct(allocationTotal)} (must equal 100%)
            </span>
          )}
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Label</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">%</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 text-gray-700">{a.label}</td>
                  <td className="px-5 py-3 text-right text-gray-800">
                    {(a.percentage * 100).toFixed(0)}%
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-brand-700">
                    {fmt((summary?.surplus ?? 0) * a.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retirement snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-gray-800">Retirement Snapshot</h2>
          <Link to="/retirement" className="text-sm text-brand-600 hover:underline">
            + Add entry
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-gray-600 font-medium">Account</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">Latest Balance</th>
                <th className="px-5 py-3 text-right text-gray-600 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(latestPerAccount).map(([name, balance]) => (
                <tr key={name} className="border-t border-gray-100">
                  <td className="px-5 py-3 text-gray-700">{name}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-800">
                    {fmt(balance)}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500">
                    {retirementTotal > 0
                      ? ((balance / retirementTotal) * 100).toFixed(1) + '%'
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-700">Total</td>
                <td className="px-5 py-3 text-right font-bold text-brand-700">
                  {fmt(retirementTotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
