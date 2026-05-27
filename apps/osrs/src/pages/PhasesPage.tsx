import { useQuery } from '@tanstack/react-query'
import { fetchHiscores } from '../api/hiscores'
import { PHASES } from '../data/phases'

const PHASE_COLORS = [
  { border: 'border-blue-600', bg: 'bg-blue-900/20', badge: 'bg-blue-900/40 text-blue-400', dot: 'bg-blue-500' },
  { border: 'border-yellow-600', bg: 'bg-yellow-900/20', badge: 'bg-yellow-900/40 text-yellow-400', dot: 'bg-yellow-500' },
  { border: 'border-red-600', bg: 'bg-red-900/20', badge: 'bg-red-900/40 text-red-400', dot: 'bg-red-500' },
  { border: 'border-green-600', bg: 'bg-green-900/20', badge: 'bg-green-900/40 text-green-400', dot: 'bg-green-500' },
  { border: 'border-teal-600', bg: 'bg-teal-900/20', badge: 'bg-teal-900/40 text-teal-400', dot: 'bg-teal-500' },
  { border: 'border-purple-600', bg: 'bg-purple-900/20', badge: 'bg-purple-900/40 text-purple-400', dot: 'bg-purple-500' },
]

// Milestone calendar (estimated from guide)
const MILESTONES = [
  { date: 'Aug 2026', label: '+Prayer, +Cooking, +Construction → 8 × 99s' },
  { date: 'Dec 2026', label: '+Thieving — ~150M GP banked, 9 × 99s' },
  { date: 'Jun 2027', label: '+Slayer, +Att, +Str, +Def → 13 × 99s' },
  { date: 'Dec 2027', label: '+Hunter, +Herblore, +Farming → 16 × 99s' },
  { date: 'Jun 2028', label: '+Mining, +Crafting, +Smithing → 19 × 99s' },
  { date: 'Dec 2028', label: '+WC, +Fishing → 21 × 99s' },
  { date: 'Mid 2029', label: '🏆 +Agility, +RC = MAX CAPE' },
]

export function PhasesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['hiscores'],
    queryFn: fetchHiscores,
    staleTime: 5 * 60_000,
  })

  const skills = data?.skills ?? []
  const cappedNames = new Set(skills.filter(s => s.level >= 99).map(s => s.name))

  // Determine current phase
  function phaseComplete(phaseIndex: number): boolean {
    const phase = PHASES[phaseIndex]
    return phase.skills.every(s => cappedNames.has(s))
  }

  function phaseActive(phaseIndex: number): boolean {
    if (phaseIndex === 0) return true
    return phaseComplete(phaseIndex - 1) && !phaseComplete(phaseIndex)
  }

  const totalHours = PHASES.reduce((sum, p) => sum + p.estimatedHours, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#f0d060]">🗓️ Phase Plan</h1>
        <p className="text-[#9b8c60] text-sm mt-0.5">
          ~{totalHours.toLocaleString()} active hours total · 2.5–3 years at 12 hrs/week
        </p>
      </div>

      {/* Phase cards */}
      {PHASES.map((phase, i) => {
        const colors = PHASE_COLORS[i]
        const complete = !isLoading && phaseComplete(i)
        const active = !isLoading && phaseActive(i)
        const locked = !isLoading && !active && !complete

        return (
          <div
            key={phase.phase}
            className={`rounded-xl border-2 transition-all ${
              active
                ? `${colors.border} ${colors.bg}`
                : complete
                ? 'border-[#c8a951]/40 bg-[#2c2416]/40'
                : 'border-[#5a4a28]/40 bg-[#1a1209]/60 opacity-70'
            }`}
          >
            {/* Phase header */}
            <div className="px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                complete ? 'bg-[#c8a951] text-[#1a1209]' : active ? `${colors.dot} text-white` : 'bg-[#2c2416] text-[#9b8c60]'
              }`}>
                {complete ? '✓' : phase.phase}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-base ${complete ? 'text-[#c8a951]' : active ? 'text-[#f0d060]' : 'text-[#9b8c60]'}`}>
                    Phase {phase.phase}: {phase.title}
                  </span>
                  {active && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      ACTIVE
                    </span>
                  )}
                  {complete && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c8a951]/20 text-[#c8a951]">
                      COMPLETE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9b8c60]">{phase.subtitle} · ~{phase.estimatedHours} hrs</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-sm font-bold ${phase.gpDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {phase.gpDelta > 0 ? '+' : ''}{(phase.gpDelta / 1000).toFixed(0)}M GP
                </p>
                <p className="text-[10px] text-[#9b8c60]">{phase.gpDelta > 0 ? 'net profit' : 'net cost'}</p>
              </div>
            </div>

            {/* Skills in phase */}
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {phase.skills.map(s => {
                  const capped = cappedNames.has(s)
                  return (
                    <span
                      key={s}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        capped
                          ? 'bg-[#c8a951]/20 text-[#c8a951]'
                          : active
                          ? `${colors.badge} border border-current/20`
                          : 'bg-[#2c2416] text-[#9b8c60]'
                      }`}
                    >
                      {capped ? '✓ ' : ''}{s}
                    </span>
                  )
                })}
              </div>
              <p className="text-xs text-[#9b8c60] leading-relaxed">{phase.notes}</p>
            </div>
          </div>
        )
      })}

      {/* Calendar milestones */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-4">
        <p className="text-xs font-bold text-[#9b8c60] uppercase tracking-wider mb-3">📅 Projected Milestones (12 hrs/week)</p>
        <div className="space-y-2">
          {MILESTONES.map(({ date, label }) => (
            <div key={date} className="flex items-start gap-3">
              <span className="text-[#c8a951] font-mono text-xs whitespace-nowrap mt-0.5 w-20 flex-shrink-0">{date}</span>
              <span className="text-xs text-[#9b8c60]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key quests */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-4">
        <p className="text-xs font-bold text-[#9b8c60] uppercase tracking-wider mb-3">📜 Key Quests to Complete</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { quest: 'Perilous Moons', why: 'Unlocks Sulphur Naguas (170k XP/hr melee)' },
            { quest: 'Sins of the Father', why: 'Unlocks Vyres (Thieving) + Darkmeyer access' },
            { quest: 'Bone Voyage', why: 'Fossil Island access for Herbiboar + bird houses' },
            { quest: 'Love Story', why: 'Demon Butler for Construction training' },
            { quest: 'Family Crest', why: 'Goldsmith gauntlets for Blast Furnace' },
            { quest: 'Song of the Elves', why: 'Crystal tools + Priff access' },
            { quest: 'Temple of the Eye', why: 'Guardians of the Rift access' },
            { quest: 'Hard Morytania Diary', why: '+10% Vyre pickpocket success' },
          ].map(({ quest, why }) => (
            <div key={quest} className="flex items-start gap-2">
              <span className="text-[#c8a951] flex-shrink-0 text-xs mt-0.5">◆</span>
              <div>
                <p className="text-xs font-semibold text-[#e8d9a0]">{quest}</p>
                <p className="text-[10px] text-[#9b8c60]">{why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
