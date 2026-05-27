import { useQuery } from '@tanstack/react-query'
import { fetchHiscores } from '../api/hiscores'
import { SKILL_GUIDES, XP_99, xpToNext99, SKILL_ORDER } from '../data/skills'
import { PHASES } from '../data/phases'
import type { HiscoresSkill } from '../types'

const CLICK_COLORS: Record<string, string> = {
  'ultra-low': 'text-green-400',
  low: 'text-yellow-400',
  medium: 'text-orange-400',
  high: 'text-red-400',
}

function XpBar({ current, target, color }: { current: number; target: number; color: string }) {
  const pct = Math.min(100, (current / target) * 100)
  return (
    <div className="h-2 bg-[#2c2416] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function SkillCard({ skill }: { skill: HiscoresSkill }) {
  const guide = SKILL_GUIDES.find(g => g.skill === skill.name)
  if (skill.name === 'Overall') return null

  const is99 = skill.level >= 99
  const xpLeft = xpToNext99(skill.xp)
  const startXp = skill.xp - (is99 ? 0 : 0)
  const progress = is99 ? 100 : Math.min(99, (skill.xp / XP_99) * 100)
  const color = is99 ? '#c8a951' : '#5a8a3a'

  return (
    <div
      className={`rounded-lg p-3 border transition-colors ${
        is99
          ? 'bg-[#2c2416] border-[#c8a951]/40'
          : 'bg-[#1e1a0e] border-[#5a4a28]/60'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{guide?.icon ?? '🔷'}</span>
        <span className={`text-xs font-semibold truncate ${is99 ? 'text-[#f0d060]' : 'text-[#e8d9a0]'}`}>
          {skill.name}
        </span>
        {is99 && <span className="ml-auto text-xs font-bold text-[#c8a951]">99 ✓</span>}
        {!is99 && (
          <span className="ml-auto text-xs font-mono text-[#9b8c60]">{skill.level}</span>
        )}
      </div>
      <XpBar current={skill.xp} target={XP_99} color={color} />
      {!is99 && (
        <p className="text-[10px] text-[#9b8c60] mt-1">
          {(xpLeft / 1000).toFixed(0)}k xp left
        </p>
      )}
    </div>
  )
}

export function OverviewPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['hiscores'],
    queryFn: fetchHiscores,
    staleTime: 5 * 60_000,
  })

  const skills = data?.skills ?? []
  const overall = skills.find(s => s.name === 'Overall')
  const skillsOnly = skills.filter(s => s.name !== 'Overall')

  const capped = skillsOnly.filter(s => s.level >= 99)
  const remaining = skillsOnly.filter(s => s.level < 99)

  // Total XP left to max
  const totalXpLeft = remaining.reduce((sum, s) => sum + xpToNext99(s.xp), 0)
  const totalXpAtMax = 23 * XP_99
  const totalXpNow = skillsOnly.reduce((sum, s) => sum + Math.min(s.xp, XP_99), 0)
  const overallProgress = (totalXpNow / totalXpAtMax) * 100

  // Determine current phase
  const phase1Skills = ['Prayer', 'Cooking', 'Construction']
  const phase2Skills = ['Thieving']
  const phase3Skills = ['Slayer', 'Attack', 'Strength', 'Defence']

  let currentPhase = 1
  const cappedNames = new Set(capped.map(s => s.name))
  if (phase1Skills.every(s => cappedNames.has(s))) currentPhase = 2
  if (phase2Skills.every(s => cappedNames.has(s))) currentPhase = 3
  if (phase3Skills.every(s => cappedNames.has(s))) currentPhase = 4
  if (capped.length >= 18) currentPhase = 5
  if (capped.length >= 21) currentPhase = 6

  const phaseData = PHASES[currentPhase - 1]

  // Estimated total hours remaining
  const totalHoursRemaining = SKILL_GUIDES
    .filter(g => !g.alreadyMaxed && !cappedNames.has(g.skill))
    .reduce((sum, g) => {
      const live = skills.find(s => s.name === g.skill)
      if (!live) return sum + g.estimatedHoursTotal
      // Scale hours by remaining XP fraction
      const xpLeft = xpToNext99(live.xp)
      const fraction = xpLeft / XP_99
      return sum + g.estimatedHoursTotal * fraction
    }, 0)

  const orderedSkills = SKILL_ORDER
    .filter(name => name !== 'Overall')
    .map(name => skills.find(s => s.name === name))
    .filter(Boolean) as HiscoresSkill[]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f0d060]">⚔️ The BrummJob</h1>
          <p className="text-[#9b8c60] text-sm mt-0.5">Journey to the Max Cape</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2c2416] border border-[#5a4a28] text-[#9b8c60] hover:text-[#c8a951] hover:border-[#c8a951] text-xs transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {isError && (
        <div className="rounded-lg bg-red-950/40 border border-red-800/50 px-4 py-3 text-red-400 text-sm">
          ⚠️ Could not reach OSRS hiscores. Stats shown may be from cache.
        </div>
      )}

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#2c2416] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Level"
            value={overall?.level.toLocaleString() ?? '—'}
            sub={`Rank #${overall?.rank?.toLocaleString() ?? '—'}`}
            icon="📊"
          />
          <StatCard
            label="99s Earned"
            value={`${capped.length} / 23`}
            sub={`${remaining.length} skills left`}
            icon="🏆"
          />
          <StatCard
            label="Current Phase"
            value={`Phase ${currentPhase}`}
            sub={phaseData?.title ?? ''}
            icon="🗓️"
          />
          <StatCard
            label="Hrs Remaining"
            value={`~${Math.round(totalHoursRemaining).toLocaleString()}`}
            sub="at 12 hrs/week"
            icon="⏱️"
          />
        </div>
      )}

      {/* Overall progress */}
      {!isLoading && (
        <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#e8d9a0]">Progress to Max Cape</span>
            <span className="text-sm font-bold text-[#c8a951]">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[#2c2416] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c8a951] to-[#f0d060] transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-[#9b8c60] mt-2">
            {(totalXpLeft / 1_000_000).toFixed(1)}M XP remaining across {remaining.length} skills
          </p>
        </div>
      )}

      {/* Current phase banner */}
      {!isLoading && phaseData && (
        <div className="rounded-xl bg-[#2c1a05] border border-[#c8a951]/40 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#c8a951] uppercase tracking-wider">
              Phase {currentPhase} — Active
            </span>
          </div>
          <p className="text-base font-bold text-[#f0d060] mb-1">{phaseData.title}</p>
          <p className="text-sm text-[#9b8c60]">{phaseData.notes}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {phaseData.skills.map(s => {
              const live = skills.find(sk => sk.name === s)
              const done = live && live.level >= 99
              return (
                <span
                  key={s}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    done
                      ? 'bg-[#c8a951]/20 text-[#c8a951]'
                      : 'bg-[#5a4a28]/60 text-[#e8d9a0]'
                  }`}
                >
                  {done ? '✓ ' : ''}{s}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Skills grid */}
      {!isLoading && orderedSkills.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#9b8c60] uppercase tracking-wider mb-3">All Skills</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {orderedSkills.map(skill => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: string }) {
  return (
    <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-3 md:p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-[#9b8c60] font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#f0d060]">{value}</p>
      <p className="text-xs text-[#9b8c60] mt-0.5">{sub}</p>
    </div>
  )
}
