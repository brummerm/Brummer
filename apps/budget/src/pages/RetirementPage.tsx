import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from 'recharts'
import { getRetirement, createRetirement, deleteRetirement, type RetirementEntry } from '../api/budget'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtK = (n: number) => `$${(n / 1000).toFixed(0)}k`
const fmtM = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : fmtK(n)

const ACCOUNT_COLORS: Record<string, string> = {
  TSP:     '#6366f1',
  TRS:     '#10b981',
  TDA:     '#f59e0b',
  NavyFed: '#3b82f6',
}

function todayISO() { return format(new Date(), 'yyyy-MM-dd') }

// ── Projection helpers ────────────────────────────────────────────────────────

function buildProjection(
  currentTotal: number,
  currentAge: number,
  retirementAge: number,
  annualContribution: number,
  annualReturnPct: number,
  monthlySpend: number,
  withdrawalRatePct: number,
  postReturnPct: number,
): {
  growthData: { year: number; age: number; projected: number; target: number }[]
  projectedAtRetirement: number
  neededNestEgg: number
  depletionAge: number | null
} {
  const r = annualReturnPct / 100
  const annualSpend = monthlySpend * 12
  const neededNestEgg = annualSpend / (withdrawalRatePct / 100)
  const yearsToRetirement = Math.max(0, retirementAge - currentAge)
  const currentYear = new Date().getFullYear()

  const growthData: { year: number; age: number; projected: number; target: number }[] = []
  let bal = currentTotal
  for (let y = 0; y <= yearsToRetirement; y++) {
    growthData.push({ year: currentYear + y, age: currentAge + y, projected: Math.round(bal), target: Math.round(neededNestEgg) })
    bal = bal * (1 + r) + annualContribution
  }

  const projectedAtRetirement = growthData[growthData.length - 1]?.projected ?? currentTotal

  // Post-retirement depletion simulation
  const postR = postReturnPct / 100
  let deplBal = projectedAtRetirement
  let yearsOfIncome = 0
  while (deplBal > 0 && yearsOfIncome < 60) {
    deplBal = deplBal * (1 + postR) - annualSpend
    if (deplBal > 0) yearsOfIncome++
  }
  const depletionAge = deplBal <= 0 ? retirementAge + yearsOfIncome : null

  return { growthData, projectedAtRetirement, neededNestEgg, depletionAge }
}

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

  // Projection settings
  const [currentAge, setCurrentAge] = useState(45)
  const [retirementAge] = useState(63)
  const [monthlySpend, setMonthlySpend] = useState(12500)
  const [annualContribution, setAnnualContribution] = useState(30000)
  const [annualReturn, setAnnualReturn] = useState(7)
  const [withdrawalRate, setWithdrawalRate] = useState(4)
  const [postReturn, setPostReturn] = useState(5)

  const createMut = useMutation({
    mutationFn: createRetirement,
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['retirement'] })
      qc.invalidateQueries({ queryKey: ['budget-summary'] })
      setSaveStatus('saved')
      setBalance('')
      setDate(todayISO())
      setCustomAccount('')
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
    onError: () => setSaveStatus('idle'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteRetirement,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['retirement'] }); qc.invalidateQueries({ queryKey: ['budget-summary'] }) },
  })

  // Latest balance per account — compare recorded_date explicitly rather than relying on API sort order
  const latestMeta: Record<string, { balance: number; date: string }> = {}
  for (const e of entries) {
    const cur = latestMeta[e.account_name]
    if (!cur || e.recorded_date > cur.date) {
      latestMeta[e.account_name] = { balance: e.balance, date: e.recorded_date }
    }
  }
  const latestPerAccount: Record<string, number> = Object.fromEntries(
    Object.entries(latestMeta).map(([k, v]) => [k, v.balance])
  )
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

  // Projection computation
  const { growthData, projectedAtRetirement, neededNestEgg, depletionAge } = buildProjection(
    retirementTotal, currentAge, retirementAge, annualContribution,
    annualReturn, monthlySpend, withdrawalRate, postReturn,
  )
  const yearsToRetirement = Math.max(0, retirementAge - currentAge)
  const surplus = projectedAtRetirement - neededNestEgg
  const onTrack = surplus >= 0
  const progressPct = Math.min(100, (retirementTotal / neededNestEgg) * 100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(balance)
    if (isNaN(n) || !date || !effectiveAccount) return
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

      {/* ── Retirement Projections ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Retirement Projections</h2>
          <p className="text-sm text-gray-500 mt-0.5">Target retirement age: <strong>63</strong></p>
        </div>

        {/* Settings panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Assumptions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Your Age</label>
              <input type="number" min={20} max={62} value={currentAge}
                onChange={e => setCurrentAge(parseInt(e.target.value) || 45)}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Monthly Spend Goal</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min={5000} max={30000} step={500} value={monthlySpend}
                  onChange={e => setMonthlySpend(parseFloat(e.target.value) || 12500)}
                  className="w-full border border-gray-300 rounded-md pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <input type="range" min={10000} max={15000} step={500} value={monthlySpend}
                onChange={e => setMonthlySpend(parseInt(e.target.value))}
                className="w-full mt-1 accent-brand-500" />
              <div className="flex justify-between text-xs text-gray-400 -mt-0.5">
                <span>$10k</span><span>$15k</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Annual Contribution</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min={0} max={200000} step={1000} value={annualContribution}
                  onChange={e => setAnnualContribution(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Expected Return</label>
              <div className="relative">
                <input type="number" min={1} max={15} step={0.5} value={annualReturn}
                  onChange={e => setAnnualReturn(parseFloat(e.target.value) || 7)}
                  className="w-full border border-gray-300 rounded-md px-2 pr-6 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Withdrawal Rate</label>
              <div className="relative">
                <input type="number" min={2} max={6} step={0.5} value={withdrawalRate}
                  onChange={e => setWithdrawalRate(parseFloat(e.target.value) || 4)}
                  className="w-full border border-gray-300 rounded-md px-2 pr-6 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Post-Ret. Return</label>
              <div className="relative">
                <input type="number" min={1} max={10} step={0.5} value={postReturn}
                  onChange={e => setPostReturn(parseFloat(e.target.value) || 5)}
                  className="w-full border border-gray-300 rounded-md px-2 pr-6 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal progress + key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Years to Retire</p>
            <p className="text-3xl font-bold font-display text-brand-600 mt-1">{yearsToRetirement}</p>
            <p className="text-xs text-gray-400 mt-0.5">at age {retirementAge}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Target Nest Egg</p>
            <p className="text-3xl font-bold font-display text-gray-800 mt-1">{fmtM(neededNestEgg)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{fmt(monthlySpend)}/mo · {withdrawalRate}% rule</p>
          </div>
          <div className={`bg-white rounded-xl border-2 p-4 text-center ${onTrack ? 'border-emerald-200' : 'border-rose-200'}`}>
            <p className="text-xs text-gray-500 font-medium">Projected at 63</p>
            <p className={`text-3xl font-bold font-display mt-1 ${onTrack ? 'text-emerald-600' : 'text-rose-500'}`}>
              {fmtM(projectedAtRetirement)}
            </p>
            <p className={`text-xs mt-0.5 font-medium ${onTrack ? 'text-emerald-500' : 'text-rose-400'}`}>
              {onTrack ? `+${fmtM(surplus)} surplus` : `${fmtM(Math.abs(surplus))} shortfall`}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Funds Last Until</p>
            {depletionAge === null ? (
              <>
                <p className="text-3xl font-bold font-display text-emerald-600 mt-1">∞</p>
                <p className="text-xs text-gray-400 mt-0.5">portfolio sustains itself</p>
              </>
            ) : (
              <>
                <p className={`text-3xl font-bold font-display mt-1 ${depletionAge >= 90 ? 'text-emerald-600' : depletionAge >= 80 ? 'text-amber-500' : 'text-rose-500'}`}>
                  Age {depletionAge}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{depletionAge - retirementAge} yrs of income</p>
              </>
            )}
          </div>
        </div>

        {/* Progress toward target */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Current Progress toward Target</p>
            <p className="text-sm font-bold text-brand-600">{progressPct.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${onTrack ? 'bg-emerald-500' : 'bg-brand-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>{fmtM(retirementTotal)} today</span>
            <span>{fmtM(neededNestEgg)} goal</span>
          </div>
        </div>

        {/* Growth projection chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Portfolio Growth to Retirement</h3>
          <p className="text-xs text-gray-400 mb-4">
            Projected at {annualReturn}% annual return · {fmt(annualContribution / 12)}/mo contributions
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={fmtM} width={64} />
              <Tooltip
                formatter={(v, name) => [fmt(Number(v)), name === 'projected' ? 'Projected Portfolio' : 'Target Nest Egg']}
                labelFormatter={(l) => {
                  const pt = growthData.find(d => d.year === l)
                  return `${l} (Age ${pt?.age ?? ''})`
                }}
              />
              <ReferenceLine y={neededNestEgg} stroke="#10b981" strokeDasharray="6 3" strokeWidth={1.5}
                label={{ value: `Target: ${fmtM(neededNestEgg)}`, position: 'insideTopRight', fontSize: 11, fill: '#10b981' }} />
              <Area type="monotone" dataKey="projected" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#projGrad)" dot={false} activeDot={{ r: 5 }} name="projected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending scenarios */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Spending Scenarios at Retirement</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                  <th className="pb-2 pr-4 font-medium">Monthly Spend</th>
                  <th className="pb-2 pr-4 font-medium">Nest Egg Needed</th>
                  <th className="pb-2 pr-4 font-medium">vs. Projection</th>
                  <th className="pb-2 font-medium">Funds Last Until</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[10000, 11000, 12000, 12500, 13000, 14000, 15000].map(spend => {
                  const nest = (spend * 12) / (withdrawalRate / 100)
                  const diff = projectedAtRetirement - nest
                  const postR = postReturn / 100
                  let b = projectedAtRetirement
                  let yrs = 0
                  while (b > 0 && yrs < 60) { b = b * (1 + postR) - spend * 12; if (b > 0) yrs++ }
                  const deplAge = b <= 0 ? retirementAge + yrs : null
                  const isSelected = spend === monthlySpend
                  return (
                    <tr key={spend} className={`${isSelected ? 'bg-brand-50 font-semibold' : 'hover:bg-gray-50'}`}>
                      <td className="py-2.5 pr-4 text-gray-700">
                        {fmt(spend)}/mo {isSelected && <span className="text-xs text-brand-500 ml-1">← current</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-700">{fmtM(nest)}</td>
                      <td className={`py-2.5 pr-4 font-medium ${diff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {diff >= 0 ? '+' : ''}{fmtM(diff)}
                      </td>
                      <td className={`py-2.5 ${!deplAge ? 'text-emerald-600' : deplAge >= 90 ? 'text-emerald-600' : deplAge >= 80 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {deplAge === null ? '∞ (self-sustaining)' : `Age ${deplAge}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
