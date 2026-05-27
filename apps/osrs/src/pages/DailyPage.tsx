import { useState, useEffect } from 'react'
import { DAILY_TASKS } from '../data/daily'
import type { DailyTask } from '../types'
import { format } from 'date-fns'

const STORAGE_KEY = 'osrs-daily-tasks'
const DATE_KEY = 'osrs-daily-date'

function getTodayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

function loadChecked(): Set<string> {
  try {
    const storedDate = localStorage.getItem(DATE_KEY)
    const today = getTodayKey()
    if (storedDate !== today) {
      // New day — reset
      localStorage.setItem(DATE_KEY, today)
      localStorage.removeItem(STORAGE_KEY)
      return new Set()
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveChecked(checked: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]))
  localStorage.setItem(DATE_KEY, getTodayKey())
}

const CATEGORY_META: Record<DailyTask['category'], { label: string; icon: string; color: string }> = {
  morning: { label: 'Morning Login', icon: '🌅', color: 'text-yellow-400' },
  evening: { label: 'Evening Login', icon: '🌙', color: 'text-blue-400' },
  weekly: { label: 'Weekly (Sundays)', icon: '📅', color: 'text-purple-400' },
}

export function DailyPage() {
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked())

  useEffect(() => {
    saveChecked(checked)
  }, [checked])

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function resetAll() {
    setChecked(new Set())
  }

  const categories = ['morning', 'evening', 'weekly'] as const
  const totalTasks = DAILY_TASKS.length
  const doneTasks = DAILY_TASKS.filter(t => checked.has(t.id)).length

  // AFK stacking tips
  const afkTips = [
    'Redwoods + Cannonballs = WC + Smithing XP simultaneously',
    'Amethyst Mining + podcast = Mining + Crafting feed',
    'NMZ Dharok during chores = ultra-AFK Att/Str/Def XP',
    'Herbiboar + Netflix = 200k Hunter XP/hr',
    'Vyres + YouTube = 2.5M GP/hr passive income',
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0d060]">📋 Daily Tasks</h1>
          <p className="text-[#9b8c60] text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')} — {doneTasks}/{totalTasks} done
          </p>
        </div>
        <button
          onClick={resetAll}
          className="px-3 py-1.5 text-xs rounded-lg bg-[#2c2416] border border-[#5a4a28] text-[#9b8c60] hover:text-[#c8a951] hover:border-[#c8a951] transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#9b8c60]">Today's progress</span>
          <span className="text-xs font-bold text-[#c8a951]">{doneTasks}/{totalTasks}</span>
        </div>
        <div className="h-2 bg-[#2c2416] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5a8a3a] to-[#c8a951] transition-all duration-300"
            style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Task groups */}
      {categories.map(cat => {
        const tasks = DAILY_TASKS.filter(t => t.category === cat)
        const meta = CATEGORY_META[cat]
        const doneHere = tasks.filter(t => checked.has(t.id)).length

        return (
          <div key={cat} className="rounded-xl bg-[#1a1209] border border-[#5a4a28] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#2c2416] border-b border-[#5a4a28] flex items-center justify-between">
              <span className={`font-bold text-sm ${meta.color}`}>
                {meta.icon} {meta.label}
              </span>
              <span className="text-xs text-[#9b8c60]">{doneHere}/{tasks.length}</span>
            </div>
            <div className="divide-y divide-[#5a4a28]/30">
              {tasks.map(task => {
                const isDone = checked.has(task.id)
                return (
                  <label
                    key={task.id}
                    className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#2c2416]/50 ${
                      isDone ? 'opacity-60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggle(task.id)}
                      className="mt-0.5 flex-shrink-0 w-4 h-4 accent-[#c8a951] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDone ? 'line-through text-[#9b8c60]' : 'text-[#e8d9a0]'}`}>
                        {task.label}
                      </p>
                      <p className="text-xs text-[#9b8c60] mt-0.5 leading-relaxed">{task.detail}</p>
                      {task.xpGain && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-[#c8a951] bg-[#c8a951]/10 px-2 py-0.5 rounded-full">
                          {task.xpGain}
                        </span>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* AFK stacking tips */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-4">
        <p className="text-xs font-bold text-[#9b8c60] uppercase tracking-wider mb-3">🔥 AFK Stacking Tips</p>
        <ul className="space-y-1.5">
          {afkTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#9b8c60]">
              <span className="text-[#c8a951] flex-shrink-0">→</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* 12 hrs/week session guide */}
      <div className="rounded-xl bg-[#1a1209] border border-[#5a4a28] p-4">
        <p className="text-xs font-bold text-[#9b8c60] uppercase tracking-wider mb-3">📆 Weekly Session Split (12 hrs)</p>
        <div className="space-y-2">
          {[
            { session: 'Session A (4 hrs)', desc: 'Active skill grind — pick one skill and stick to it this week.' },
            { session: 'Session B (4 hrs)', desc: 'Slayer night — Konar tasks for XP + Att/Str/Def/HP byproduct.' },
            { session: 'Session C (4 hrs)', desc: 'AFK session — stack Redwoods + Cannonballs or NMZ Dharok while multitasking.' },
          ].map(({ session, desc }) => (
            <div key={session} className="flex items-start gap-2">
              <span className="text-[#c8a951] font-bold text-xs whitespace-nowrap mt-0.5">{session}</span>
              <span className="text-xs text-[#9b8c60]">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
