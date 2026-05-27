import { SKILL_GUIDES } from '../data/skills'

interface GpRow {
  skill: string
  icon: string
  phase: number
  gpNet: number
  hours: number
  method: string
}

const EXPENSE_ROWS: GpRow[] = SKILL_GUIDES
  .filter(g => !g.alreadyMaxed && g.gpNet < 0)
  .map(g => ({
    skill: g.skill,
    icon: g.icon,
    phase: g.phase,
    gpNet: g.gpNet,
    hours: g.estimatedHoursTotal,
    method: g.methods[0]?.label ?? '',
  }))
  .sort((a, b) => a.gpNet - b.gpNet)

const INCOME_ROWS: GpRow[] = SKILL_GUIDES
  .filter(g => !g.alreadyMaxed && g.gpNet > 0)
  .map(g => ({
    skill: g.skill,
    icon: g.icon,
    phase: g.phase,
    gpNet: g.gpNet,
    hours: g.estimatedHoursTotal,
    method: g.methods[0]?.label ?? '',
  }))
  .sort((a, b) => b.gpNet - a.gpNet)

const totalExpenses = EXPENSE_ROWS.reduce((sum, r) => sum + r.gpNet, 0)
const totalIncome = INCOME_ROWS.reduce((sum, r) => sum + r.gpNet, 0)
const netGp = totalExpenses + totalIncome

const GP_MILESTONES = [
  { phase: 'Start', target: 50_000, note: 'Minimum GP to begin Prayer + Cooking' },
  { phase: 'Pre-Construction', target: 150_000, note: 'After Thieving — fund mahogany benches' },
  { phase: 'Mid-grind', target: 100_000, note: 'Maintained through Slayer drops' },
  { phase: 'End of max', target: 200_000, note: 'Projected net after all training' },
]

function GpBar({ value, maxAbs }: { value: number; maxAbs: number }) {
  const pct = Math.min(100, (Math.abs(value) / maxAbs) * 100)
  const positive = value > 0
  return (
    <div className="h-1.5 bg-[#2c2416] rounded-full overflow-hidden w-20">
      <div
        className={`h-full rounded-full ${positive ? 'bg-green-500' : 'bg-red-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function GpPage() {
  const maxAbs = Math.max(
    ...EXPENSE_ROWS.map(r => Math.abs(r.gpNet)),
    ...INCOME_ROWS.map(r => Math.abs(r.gpNet)),
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#f0d060]">💰 GP Tracker</h1>
        <p className="text-[#9b8c60] text-sm mt-0.5">Estimated costs and income across all skills</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-3 text-center">
          <p className="text-xs text-[#9b8c60] mb-1">Total Costs</p>
          <p className="text-lg font-bold text-red-400">{(totalExpenses / 1000).toFixed(0)}M</p>
        </div>
        <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-3 text-center">
          <p className="text-xs text-[#9b8c60] mb-1">Total Income</p>
          <p className="text-lg font-bold text-green-400">+{(totalIncome / 1000).toFixed(0)}M</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${netGp >= 0 ? 'bg-green-950/30 border-green-800/40' : 'bg-red-950/30 border-red-800/40'}`}>
          <p className="text-xs text-[#9b8c60] mb-1">Net GP</p>
          <p className={`text-lg font-bold ${netGp >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netGp >= 0 ? '+' : ''}{(netGp / 1000).toFixed(0)}M
          </p>
        </div>
      </div>

      {/* GP priority tip */}
      <div className="rounded-xl bg-[#2c1a05] border border-[#c8a951]/40 p-4">
        <p className="text-xs font-bold text-[#c8a951] uppercase tracking-wider mb-2">💡 GP Strategy</p>
        <p className="text-sm text-[#9b8c60] leading-relaxed">
          Front-load <strong className="text-[#e8d9a0]">Thieving at Vyres</strong> (~60 hrs) to bank +150M GP before spending on Construction or Herblore.
          This ensures you never have to pause training due to cash. The entire max is net-positive with this ordering.
        </p>
      </div>

      {/* Expenses table */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#2c2416] border-b border-[#5a4a28]">
          <span className="text-sm font-bold text-red-400">💸 GP Expenses</span>
        </div>
        <div className="divide-y divide-[#5a4a28]/30">
          {EXPENSE_ROWS.map(row => (
            <div key={row.skill} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-base flex-shrink-0">{row.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#e8d9a0]">{row.skill}</p>
                <p className="text-[10px] text-[#9b8c60] truncate">{row.method}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <GpBar value={row.gpNet} maxAbs={maxAbs} />
                <span className="text-xs font-bold text-red-400">{(row.gpNet / 1000).toFixed(0)}M</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 bg-[#2c2416] border-t border-[#5a4a28] flex justify-between">
          <span className="text-xs text-[#9b8c60]">Total</span>
          <span className="text-sm font-bold text-red-400">{(totalExpenses / 1000).toFixed(0)}M</span>
        </div>
      </div>

      {/* Income table */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#2c2416] border-b border-[#5a4a28]">
          <span className="text-sm font-bold text-green-400">💵 GP Income (passive while training)</span>
        </div>
        <div className="divide-y divide-[#5a4a28]/30">
          {INCOME_ROWS.map(row => (
            <div key={row.skill} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-base flex-shrink-0">{row.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#e8d9a0]">{row.skill}</p>
                <p className="text-[10px] text-[#9b8c60] truncate">{row.method}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <GpBar value={row.gpNet} maxAbs={maxAbs} />
                <span className="text-xs font-bold text-green-400">+{(row.gpNet / 1000).toFixed(0)}M</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 bg-[#2c2416] border-t border-[#5a4a28] flex justify-between">
          <span className="text-xs text-[#9b8c60]">Total</span>
          <span className="text-sm font-bold text-green-400">+{(totalIncome / 1000).toFixed(0)}M</span>
        </div>
      </div>

      {/* GP Milestones */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-4">
        <p className="text-xs font-bold text-[#9b8c60] uppercase tracking-wider mb-3">🏦 GP Bank Targets</p>
        <div className="space-y-2">
          {GP_MILESTONES.map(({ phase, target, note }) => (
            <div key={phase} className="flex items-start gap-3">
              <span className="text-[#c8a951] font-bold text-xs whitespace-nowrap w-28 flex-shrink-0 mt-0.5">{phase}</span>
              <div>
                <span className="text-xs font-bold text-[#f0d060]">{(target / 1000).toFixed(0)}M GP</span>
                <span className="text-xs text-[#9b8c60] ml-2">{note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget routes table */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#2c2416] border-b border-[#5a4a28]">
          <span className="text-sm font-bold text-[#c8a951]">🔀 Budget vs Premium Routes</span>
        </div>
        <div className="divide-y divide-[#5a4a28]/30">
          {[
            { skill: 'Construction', budget: 'Mahogany Homes (~30M)', premium: 'Mahogany Benches (~150M)' },
            { skill: 'Prayer', budget: 'Ensouled Heads (~15M)', premium: 'Sunfire Dragon Bones (~40M)' },
            { skill: 'Herblore', budget: 'Self-farmed herbs (~40M)', premium: 'Buy herbs (~90M)' },
            { skill: 'Mining', budget: 'Amethyst AFK (+25M profit)', premium: 'Volcanic Mine for speed' },
          ].map(({ skill, budget, premium }) => (
            <div key={skill} className="px-4 py-2.5">
              <p className="text-xs font-bold text-[#e8d9a0] mb-1">{skill}</p>
              <div className="flex gap-3 text-[10px]">
                <span className="text-green-400">💚 Budget: {budget}</span>
                <span className="text-yellow-400">⭐ Premium: {premium}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
