import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWeekPlanByDate, randomizeSlot, addSlot } from '../api/mealPlan'
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
import clsx from 'clsx'
import type { MealSlot } from '../types/mealPlan'

const QUICK_LABELS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Brunch', 'Dessert']

// Per-day "Add meal" inline form
function AddMealForm({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (label: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [label, setLabel] = useState('')
  return (
    <div className="mt-1 space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {QUICK_LABELS.map(l => (
          <button key={l} type="button"
            onClick={() => onAdd(l)}
            disabled={isPending}
            className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 hover:border-[#0079bf] hover:text-[#0079bf] transition-colors">
            {l}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Custom label…"
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-[#0079bf] outline-none min-w-0"
          onKeyDown={e => { if (e.key === 'Enter' && label.trim()) { onAdd(label.trim()); setLabel('') } }}
        />
        <button
          onClick={() => { if (label.trim()) { onAdd(label.trim()); setLabel('') } }}
          disabled={!label.trim() || isPending}
          className="text-xs px-2 py-1 bg-[#0079bf] text-white rounded disabled:opacity-50 flex-shrink-0">
          Add
        </button>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 px-1">✕</button>
      </div>
    </div>
  )
}

// One day column (desktop)
function DayColumn({
  dayIndex,
  dateLabel,
  slots,
  planId,
  weekKey,
  allSlots,
  onAddSlot,
  addPending,
}: {
  dayIndex: number
  dateLabel: string
  slots: MealSlot[]
  planId: number
  weekKey: string
  allSlots: MealSlot[]
  onAddSlot: (day: number, label: string) => void
  addPending: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  return (
    <div className="flex flex-col w-[160px] flex-shrink-0">
      {/* Day header */}
      <div className="text-center mb-2">
        <p className="text-xs font-bold text-[#172b4d] uppercase tracking-wide">{DAY_SHORT[dayIndex]}</p>
        <p className="text-xs text-gray-400">{dateLabel}</p>
      </div>
      {/* Slots */}
      <div className="space-y-2 flex-1">
        {slots.map(slot => (
          <MealSlotCard key={slot.id} slot={slot} planId={planId} weekKey={weekKey} allSlots={allSlots} />
        ))}
      </div>
      {/* Add meal */}
      {showForm ? (
        <AddMealForm
          onAdd={label => { onAddSlot(dayIndex, label); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
          isPending={addPending}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-gray-400 hover:text-[#0079bf] hover:bg-blue-50 border border-dashed border-gray-200 hover:border-[#0079bf]/40 transition-colors">
          + Add meal
        </button>
      )}
    </div>
  )
}

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

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const jsDay = new Date().getDay()
    return jsDay === 0 ? 6 : jsDay - 1
  })
  const [mobileShowForm, setMobileShowForm] = useState(false)

  useEffect(() => {
    if (weekParam) setActiveWeek(weekParam)
  }, [weekParam, setActiveWeek])

  const { data: plan, isLoading } = useQuery({
    queryKey: ['meal-plan', weekStart],
    queryFn: () => getWeekPlanByDate(weekStart),
    enabled: plannerView === 'week',
  })

  const addSlotMut = useMutation({
    mutationFn: ({ day, label }: { day: number; label: string }) =>
      addSlot(plan!.id, { day_of_week: day, label }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-plan', weekStart] }),
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
    if (view === 'month') setActiveMonth(monthStrFromWeekStart(weekStart))
    setPlannerView(view)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Meal Planner</h1>
          {plannerView === 'week' && (
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => { const w = prevWeekStart(weekStart); setActiveWeek(w); navigate(`/planner/${w}`) }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none">‹</button>
              <p className="text-sm text-gray-500">{weekLabel(weekStart)}</p>
              <button onClick={() => { const w = nextWeekStart(weekStart); setActiveWeek(w); navigate(`/planner/${w}`) }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none">›</button>
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
              <Button variant="secondary" size="sm"
                onClick={() => randomizeAllMut.mutate()}
                disabled={randomizeAllMut.isPending}>
                🎲 Randomize Week
              </Button>
            </>
          )}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['week', 'month'] as const).map(v => (
              <button key={v} onClick={() => switchView(v)}
                className={clsx('px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                  plannerView === v ? 'bg-white shadow text-[#0079bf]' : 'text-gray-500 hover:text-gray-700'
                )}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Month nav */}
      {plannerView === 'month' && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => goMonth('prev')}>← Prev</Button>
          <span className="font-medium text-gray-700 min-w-44 text-center">{monthLabel(activeMonth)}</span>
          <Button variant="secondary" size="sm" onClick={() => goMonth('next')}>Next →</Button>
          <Button variant="ghost" size="sm" onClick={() => setActiveMonth(currentMonthStr())}>This Month</Button>
        </div>
      )}

      {/* Week view */}
      {plannerView === 'week' && (
        <>
          {isLoading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

          {plan && (
            <>
              {/* Mobile: day pill selector */}
              <div className="md:hidden flex overflow-x-auto gap-2 pb-2 -mx-4 px-4">
                {DAY_SHORT.map((day, i) => {
                  const d = dayDate(weekStart, i)
                  const count = plan.slots.filter(s => s.day_of_week === i).length
                  return (
                    <button key={day} onClick={() => setSelectedDayIndex(i)}
                      className={clsx(
                        'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                        selectedDayIndex === i ? 'bg-[#0079bf] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}>
                      <span className="text-xs font-semibold">{day}</span>
                      <span className="text-xs opacity-75">{format(d, 'M/d')}</span>
                      {count > 0 && <span className="text-[10px] mt-0.5 opacity-75">{count} meal{count !== 1 ? 's' : ''}</span>}
                    </button>
                  )
                })}
              </div>

              {/* Mobile: selected day's slots */}
              <div className="md:hidden space-y-2">
                {plan.slots
                  .filter(s => s.day_of_week === selectedDayIndex)
                  .map(slot => (
                    <MealSlotCard key={slot.id} slot={slot} planId={plan.id} weekKey={weekStart} allSlots={plan.slots} />
                  ))
                }
                {plan.slots.filter(s => s.day_of_week === selectedDayIndex).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No meals yet — add one below</p>
                )}
                {mobileShowForm ? (
                  <AddMealForm
                    onAdd={label => { addSlotMut.mutate({ day: selectedDayIndex, label }); setMobileShowForm(false) }}
                    onCancel={() => setMobileShowForm(false)}
                    isPending={addSlotMut.isPending}
                  />
                ) : (
                  <button onClick={() => setMobileShowForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#0079bf]/40 hover:text-[#0079bf] transition-colors">
                    + Add meal to {DAY_SHORT[selectedDayIndex]}
                  </button>
                )}
              </div>

              {/* Desktop: 7-column flex layout */}
              <div className="hidden md:flex gap-3 overflow-x-auto pb-4">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const d = dayDate(weekStart, dayIndex)
                  const daySlots = plan.slots
                    .filter(s => s.day_of_week === dayIndex)
                    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
                  return (
                    <DayColumn
                      key={dayIndex}
                      dayIndex={dayIndex}
                      dateLabel={format(d, 'MMM d')}
                      slots={daySlots}
                      planId={plan.id}
                      weekKey={weekStart}
                      allSlots={plan.slots}
                      onAddSlot={(day, label) => addSlotMut.mutate({ day, label })}
                      addPending={addSlotMut.isPending}
                    />
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {plannerView === 'month' && <MonthView monthStr={activeMonth} />}
    </div>
  )
}
