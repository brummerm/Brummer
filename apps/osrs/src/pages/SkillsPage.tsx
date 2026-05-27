import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchHiscores } from '../api/hiscores'
import { SKILL_GUIDES, XP_99, xpToNext99, xpForLevel } from '../data/skills'
import type { SkillGuide } from '../types'

const CLICK_BADGE: Record<string, { label: string; color: string }> = {
  'ultra-low': { label: 'Ultra-Low Clicks', color: 'bg-green-900/40 text-green-400 border-green-800/40' },
  low: { label: 'Low Clicks', color: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/40' },
  medium: { label: 'Medium Clicks', color: 'bg-orange-900/40 text-orange-400 border-orange-800/40' },
  high: { label: 'High Clicks', color: 'bg-red-900/40 text-red-400 border-red-800/40' },
}

const PHASE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Ph 1: Quick Wins', color: 'text-blue-400' },
  2: { label: 'Ph 2: GP Engine', color: 'text-yellow-400' },
  3: { label: 'Ph 3: Combat', color: 'text-red-400' },
  4: { label: 'Ph 4: Resources', color: 'text-green-400' },
  5: { label: 'Ph 5: AFK Profit', color: 'text-teal-400' },
  6: { label: 'Ph 6: Final Boss', color: 'text-purple-400' },
}

export function SkillsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['hiscores'],
    queryFn: fetchHiscores,
    staleTime: 5 * 60_000,
  })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'remaining' | 'maxed'>('all')
  const [phaseFilter, setPhaseFilter] = useState<number | null>(null)

  const skills = data?.skills ?? []

  const guides = SKILL_GUIDES.filter(g => g.skill !== 'Overall').filter(g => {
    const live = skills.find(s => s.name === g.skill)
    const is99 = live ? live.level >= 99 : g.alreadyMaxed
    if (filter === 'remaining' && is99) return false
    if (filter === 'maxed' && !is99) return false
    if (phaseFilter !== null && g.phase !== phaseFilter) return false
    return true
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-[#f0d060]">⚔️ Skills</h1>
        <div className="flex gap-1.5 ml-auto">
          {(['all', 'remaining', 'maxed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors capitalize ${
                filter === f
                  ? 'bg-[#5a4a28] border-[#c8a951] text-[#f0d060]'
                  : 'bg-[#1a1209] border-[#5a4a28] text-[#9b8c60] hover:text-[#c8a951]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Phase filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setPhaseFilter(null)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
            phaseFilter === null
              ? 'bg-[#5a4a28] border-[#c8a951] text-[#f0d060]'
              : 'bg-[#1a1209] border-[#5a4a28] text-[#9b8c60] hover:text-[#c8a951]'
          }`}
        >
          All Phases
        </button>
        {[1, 2, 3, 4, 5, 6].map(p => (
          <button
            key={p}
            onClick={() => setPhaseFilter(phaseFilter === p ? null : p)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              phaseFilter === p
                ? 'bg-[#5a4a28] border-[#c8a951] text-[#f0d060]'
                : 'bg-[#1a1209] border-[#5a4a28] text-[#9b8c60] hover:text-[#c8a951]'
            }`}
          >
            Phase {p}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[#2c2416] animate-pulse" />
          ))}
        </div>
      )}

      {/* Skill list */}
      {!isLoading && guides.map(guide => {
        const live = skills.find(s => s.name === guide.skill)
        const level = live?.level ?? (guide.alreadyMaxed ? 99 : 1)
        const xp = live?.xp ?? xpForLevel(level)
        const is99 = level >= 99
        const xpLeft = xpToNext99(xp)
        const progress = Math.min(100, (xp / XP_99) * 100)
        const isExpanded = expanded === guide.skill
        const best = guide.methods[0]
        const phaseMeta = PHASE_LABELS[guide.phase]
        const hoursLeft = is99 ? 0 : Math.round(guide.estimatedHoursTotal * (xpLeft / XP_99))

        return (
          <div
            key={guide.skill}
            className={`rounded-xl border transition-all ${
              is99
                ? 'bg-[#1e1a0e] border-[#5a4a28]/50'
                : 'bg-[#1a1209] border-[#5a4a28]'
            }`}
          >
            {/* Summary row */}
            <button
              onClick={() => setExpanded(isExpanded ? null : guide.skill)}
              className="w-full text-left px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{guide.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${is99 ? 'text-[#c8a951]' : 'text-[#e8d9a0]'}`}>
                      {guide.skill}
                    </span>
                    {is99 && <span className="text-[#c8a951] text-xs font-bold">✓ 99</span>}
                    {!is99 && (
                      <>
                        <span className="text-xs text-[#9b8c60]">Lv {level}</span>
                        <span className={`text-[10px] font-semibold ${phaseMeta.color}`}>
                          {phaseMeta.label}
                        </span>
                      </>
                    )}
                  </div>
                  {!is99 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#2c2416] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5a8a3a] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#9b8c60] whitespace-nowrap">
                        {(xpLeft / 1000).toFixed(0)}k left
                      </span>
                    </div>
                  )}
                </div>
                {/* Right side stats */}
                <div className="flex-shrink-0 text-right hidden sm:block">
                  {!is99 && (
                    <>
                      <p className="text-xs text-[#9b8c60]">~{hoursLeft} hrs</p>
                      <p className={`text-[10px] ${guide.gpNet > 0 ? 'text-green-400' : guide.gpNet < 0 ? 'text-red-400' : 'text-[#9b8c60]'}`}>
                        {guide.gpNet > 0 ? '+' : ''}{(guide.gpNet / 1000).toFixed(0)}M GP
                      </p>
                    </>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-[#9b8c60] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-[#5a4a28]/60 pt-3 space-y-3">
                {/* Methods */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#9b8c60] uppercase tracking-wider">Training Methods</p>
                  {guide.methods.map((method, i) => {
                    const cb = CLICK_BADGE[method.clickIntensity]
                    return (
                      <div
                        key={i}
                        className={`rounded-lg p-3 border ${i === 0 ? 'bg-[#2c2416] border-[#c8a951]/30' : 'bg-[#1e1a0e] border-[#5a4a28]/40'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`text-sm font-semibold ${i === 0 ? 'text-[#f0d060]' : 'text-[#e8d9a0]'}`}>
                            {i === 0 && '★ '}{method.label}
                          </span>
                          <div className="flex-shrink-0 flex flex-col items-end gap-1">
                            {method.xpPerHour > 0 && (
                              <span className="text-[10px] font-mono text-[#9b8c60] whitespace-nowrap">
                                {(method.xpPerHour / 1000).toFixed(0)}k XP/hr
                              </span>
                            )}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cb.color}`}>
                              {cb.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#9b8c60] leading-relaxed">{method.notes}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Tips */}
                <div className="rounded-lg bg-[#1e1a0e] border border-[#5a4a28]/40 p-3">
                  <p className="text-[10px] font-bold text-[#9b8c60] uppercase tracking-wider mb-1.5">💡 Tips</p>
                  <p className="text-xs text-[#9b8c60] leading-relaxed">{guide.tips}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {!isLoading && guides.length === 0 && (
        <div className="text-center py-10 text-[#9b8c60]">No skills match that filter.</div>
      )}
    </div>
  )
}
