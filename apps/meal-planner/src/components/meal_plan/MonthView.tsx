import { useQueries } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format, isToday } from 'date-fns'
import { getWeekPlanByDate } from '../../api/mealPlan'
import {
  getMonthWeekStarts,
  getMonthCalendarDays,
  isInMonth,
  weekStartStr,
  DAY_SHORT,
} from '../../utils/weekDates'
import { useUIStore } from '../../store/uiStore'
import type { MealSlot, WeekPlan } from '../../types/mealPlan'
import Spinner from '../ui/Spinner'
import clsx from 'clsx'

interface Props {
  monthStr: string
}

const MEAL_ORDER: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner']

function SlotChip({ slot }: { slot: MealSlot }) {
  if (slot.slot_type === 'empty') return null

  if (slot.slot_type === 'recipe' && slot.recipe) {
    return (
      <p className="truncate text-xs leading-tight text-brand-700 font-medium">
        {slot.recipe.title}
      </p>
    )
  }
  if (slot.slot_type === 'leftovers') {
    return <p className="text-xs leading-tight text-blue-500">🥡 Leftovers</p>
  }
  if (slot.slot_type === 'going_out') {
    return <p className="text-xs leading-tight text-purple-500">🍜 Going Out</p>
  }
  return null
}

export default function MonthView({ monthStr }: Props) {
  const navigate = useNavigate()
  const { setPlannerView, setActiveWeek } = useUIStore()

  const weekStarts = getMonthWeekStarts(monthStr)
  const calendarDays = getMonthCalendarDays(monthStr)

  const results = useQueries({
    queries: weekStarts.map((ws) => ({
      queryKey: ['meal-plan', ws],
      queryFn: () => getWeekPlanByDate(ws),
      staleTime: 1000 * 30,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)

  // Build lookup: "yyyy-MM-dd" → MealSlot[]
  const slotsByDate: Record<string, MealSlot[]> = {}
  results.forEach((r) => {
    const plan = r.data as WeekPlan | undefined
    if (!plan) return
    plan.slots.forEach((slot) => {
      const d = format(
        new Date(plan.week_start + 'T00:00:00').setDate(
          new Date(plan.week_start + 'T00:00:00').getDate() + slot.day_of_week
        ),
        'yyyy-MM-dd'
      )
      if (!slotsByDate[d]) slotsByDate[d] = []
      slotsByDate[d].push(slot)
    })
  })

  function handleDayClick(date: Date) {
    const ws = weekStartStr(date)
    setActiveWeek(ws)
    setPlannerView('week')
    navigate(`/planner/${ws}`)
  }

  return (
    <div className="space-y-2">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_SHORT.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {/* Calendar grid */}
      {!isLoading && (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const inMonth = isInMonth(date, monthStr)
            const today = isToday(date)
            const daySlots = slotsByDate[dateStr] || []
            // Sort by meal order
            const ordered = MEAL_ORDER.map((mt) =>
              daySlots.find((s) => s.meal_type === mt)
            ).filter(Boolean) as MealSlot[]
            const hasContent = ordered.some((s) => s.slot_type !== 'empty')

            return (
              <div
                key={i}
                onClick={() => handleDayClick(date)}
                className={clsx(
                  'min-h-[90px] rounded-lg p-1.5 cursor-pointer transition-colors border',
                  inMonth
                    ? 'bg-white hover:bg-brand-50 border-gray-100'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-50',
                  today && 'ring-2 ring-brand-400'
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={clsx(
                      'text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full',
                      today
                        ? 'bg-brand-500 text-white'
                        : inMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                  {hasContent && inMonth && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-300" />
                  )}
                </div>

                {/* Meal slots */}
                <div className="space-y-0.5">
                  {ordered.map((slot) => (
                    <SlotChip key={slot.id} slot={slot} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-1">
        Click any day to open it in week view
      </p>
    </div>
  )
}
