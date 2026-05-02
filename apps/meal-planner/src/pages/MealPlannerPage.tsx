import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getWeekPlanByDate } from '../api/mealPlan'
import { useUIStore } from '../store/uiStore'
import {
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
  const {
    activeWeek, setActiveWeek,
    activeMonth, setActiveMonth,
    plannerView, setPlannerView,
  } = useUIStore()

  const weekStart = weekParam || activeWeek

  useEffect(() => {
    if (weekParam) setActiveWeek(weekParam)
  }, [weekParam, setActiveWeek])

  const { data: plan, isLoading } = useQuery({
    queryKey: ['meal-plan', weekStart],
    queryFn: () => getWeekPlanByDate(weekStart),
    enabled: plannerView === 'week',
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
          <h1 className="text-3xl font-display font-bold">Meal Planner</h1>
          {plannerView === 'week' && (
            <p className="text-sm text-gray-500 mt-0.5">{weekLabel(weekStart)}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Grocery list shortcut (week view only) */}
          {plan && plannerView === 'week' && (
            <Link to={`/grocery/${plan.id}`}>
              <Button variant="secondary" size="sm">🛒 Grocery List</Button>
            </Link>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={clsx(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                  plannerView === v
                    ? 'bg-white shadow text-brand-600'
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
        <div className="flex items-center gap-2">
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
            <div className="overflow-x-auto">
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
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
