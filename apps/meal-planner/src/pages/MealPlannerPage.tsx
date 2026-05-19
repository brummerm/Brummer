import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWeekPlanByDate, randomizeSlot } from '../api/mealPlan'
import { useUIStore } from '../store/uiStore'
import {
  currentWeekStart, nextWeekStart, prevWeekStart,
  currentMonthStr, nextMonthStr, prevMonthStr, monthLabel,
  monthStrFromWeekStart, weekLabel, dayDate, DAY_SHORT,
} from '../utils/weekDates'
import MealSlotCard from '../components/meal_plan/MealSlotCard'
import MonthView from '../components/meal_plan/MonthView'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { format } from 'date-fns'
import type { MealType } from '../types/mealPlan'
import clsx from 'clsx'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']
const MEAL_LABELS = { breakfast: '☀️ Breakfast', lunch: '🌤️ Lunch', dinner: '🌙 Dinner' }

export default function MealPlannerPage() {
  const { weekStart: weekParam } = useParams<{ weekStart?: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    activeWeek, setActiveWeek,
    activeMonth, setActiveMonth,
    plannerView, setPlannerView,
  } = useUIStore()

  const weekStart = weekParam || activeWeek

  // Mobile: which day is selected (0=Mon … 6=Sun, matching DAY_SHORT)
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const jsDay = new Date().getDay() // 0=Sun, 1=Mon…6=Sat
    // Convert JS day to Mon-based index (Mon=0 … Sun=6)
    return jsDay === 0 ? 6 : jsDay - 1
  })

  useEffect(() => {
    if (weekParam) setActiveWeek(weekParam)
  }, [weekParam, setActiveWeek])

  const { data: plan, isLoading } = useQuery({
    queryKey: ['meal-plan', weekStart],
    queryFn: () => getWeekPlanByDate(weekStart),
    enabled: plannerView === 'week',
  })

  const randomizeAllMut = useMutation({
    mutationFn: async () => {
      if (!plan) return
      const empty = plan.slots.filter(s => s.slot_type === 'empty')
      await Promise.all(empty.map(s => randomizeSlot(plan.id, s.id)))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-plan', weekStart] }),
  })

  function goMonth(dir: 'prev' | 'next') {
    setActiveMonth(dir === 'next' ? nextMonthStr(activeMonth) : prevMonthStr(activeMonth))
  }

  function switchView(view: 'week' | 'month') {
    if (view === 'month') {
      setActiveMonth(monthStrFromWeekStart(weekStart))
    }
    setPlannerView(view)
  }

  function getSlot(day: number, meal: MealType) {
    return plan?.slots.find((s) => s.day_of_week === day && s.meal_type === meal)
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Meal Planner</h1>
          {plannerView === 'week' && (
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => { const w = prevWeekStart(weekStart); setActiveWeek(w); navigate(`/planner/${w}`) }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors text-lg leading-none">‹</button>
              <p className="text-sm text-gray-500">{weekLabel(weekStart)}</p>
              <button onClick={() => { const w = nextWeekStart(weekStart); setActiveWeek(w); navigate(`/planner/${w}`) }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors text-lg leading-none">›</button>
              <button onClick={() => { const w = currentWeekStart(); setActiveWeek(w); navigate(`/planner/${w}`) }}
                className="text-xs text-[#0079bf] hover:underline font-medium px-1">Today</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {plan && plannerView === 'week' && (
            <>
              <Link to={`/grocery/${plan.id}`}>
                <Button variant="secondary" size="sm">🛒 Grocery List</Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => randomizeAllMut.mutate()}
                disabled={randomizeAllMut.isPending}
              >
                🎲 Randomize Week
              </Button>
            </>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={clsx(
                  'px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                  plannerView === v
                    ? 'bg-white shadow text-[#0079bf]'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Month navigation (month view only) ── */}
      {plannerView === 'month' && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => goMonth('prev')}>← Prev</Button>
          <span className="font-medium text-gray-700 min-w-44 text-center">
            {monthLabel(activeMonth)}
          </span>
          <Button variant="secondary" size="sm" onClick={() => goMonth('next')}>Next →</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveMonth(currentMonthStr())}
          >
            This Month
          </Button>
        </div>
      )}

      {/* ── Week view ── */}
      {plannerView === 'week' && (
        <>
          {isLoading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

          {plan && (
            <>
              {/* ── Mobile: day pill selector + single-day view (< md) ── */}
              <div className="md:hidden">
                {/* Day pill row */}
                <div className="flex overflow-x-auto gap-2 pb-2 mb-4 -mx-4 px-4">
                  {DAY_SHORT.map((day, i) => {
                    const d = dayDate(weekStart, i)
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDayIndex(i)}
                        className={clsx(
                          'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                          selectedDayIndex === i
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <span className="text-xs font-semibold">{day}</span>
                        <span className="text-xs opacity-75">{format(d, 'M/d')}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Selected day's meals — vertical stack */}
                <div className="space-y-3">
                  {MEAL_TYPES.map((meal) => {
                    const slot = getSlot(selectedDayIndex, meal)
                    return (
                      <div key={meal}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 pl-1">
                          {MEAL_LABELS[meal]}
                        </p>
                        {slot ? (
                          <MealSlotCard
                            slot={slot}
                            planId={plan.id}
                            weekKey={weekStart}
                            allSlots={plan.slots}
                          />
                        ) : (
                          <div className="min-h-[90px] rounded-lg bg-gray-50 border border-dashed border-gray-200" />
                        )}
                      </div>
                    )
                  })}

                  {/* Daily calorie total for selected day */}
                  {(() => {
                    const daySlots = plan.slots.filter(
                      (s) => s.day_of_week === selectedDayIndex && s.slot_type === 'recipe'
                    )
                    const total = daySlots.reduce((sum, s) => {
                      const cal = (s.recipe as any)?.calories as number | undefined
                      return cal != null ? sum + cal : sum
                    }, 0)
                    return total > 0 ? (
                      <p className="text-xs text-gray-400 text-center pt-1">~{Math.round(total)} cal today</p>
                    ) : null
                  })()}
                </div>
              </div>

              {/* ── Desktop: 7-column grid (md+) ── */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {Array.from({ length: 7 }, (_, day) => {
                      const d = dayDate(weekStart, day)
                      return (
                        <div key={day} className="text-center">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {DAY_SHORT[day]}
                          </p>
                          <p className="text-sm font-medium text-gray-800">{format(d, 'MMM d')}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Meal rows */}
                  {MEAL_TYPES.map((meal) => (
                    <div key={meal} className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 pl-1">
                        {MEAL_LABELS[meal]}
                      </p>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }, (_, day) => {
                          const slot = getSlot(day, meal)
                          if (!slot) return (
                            <div key={day} className="min-h-[90px] rounded-lg bg-gray-50 border border-dashed border-gray-200" />
                          )
                          return (
                            <MealSlotCard
                              key={slot.id}
                              slot={slot}
                              planId={plan.id}
                              weekKey={weekStart}
                              allSlots={plan.slots}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Daily calorie totals */}
                  <div className="grid grid-cols-7 gap-2 mt-1">
                    {Array.from({ length: 7 }, (_, day) => {
                      const daySlots = plan.slots.filter((s) => s.day_of_week === day && s.slot_type === 'recipe')
                      const total = daySlots.reduce((sum, s) => {
                        const cal = (s.recipe as any)?.calories as number | undefined
                        return cal != null ? sum + cal : sum
                      }, 0)
                      return (
                        <div key={day} className="text-center">
                          {total > 0 && (
                            <p className="text-[10px] text-gray-400">~{Math.round(total)} cal</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Month view ── */}
      {plannerView === 'month' && (
        <MonthView monthStr={activeMonth} />
      )}
    </div>
  )
}
