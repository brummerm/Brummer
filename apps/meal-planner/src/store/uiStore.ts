import { create } from 'zustand'
import { currentWeekStart, currentMonthStr } from '../utils/weekDates'

type PlannerView = 'week' | 'month'

interface UIStore {
  activeWeek: string
  setActiveWeek: (week: string) => void
  activeMonth: string
  setActiveMonth: (month: string) => void
  plannerView: PlannerView
  setPlannerView: (view: PlannerView) => void
  checkedGroceryItems: Set<number>
  toggleGroceryItem: (id: number) => void
  clearGroceryChecks: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  activeWeek: currentWeekStart(),
  setActiveWeek: (week) => set({ activeWeek: week }),
  activeMonth: currentMonthStr(),
  setActiveMonth: (month) => set({ activeMonth: month }),
  plannerView: 'week',
  setPlannerView: (view) => set({ plannerView: view }),
  checkedGroceryItems: new Set(),
  toggleGroceryItem: (id) =>
    set((state) => {
      const next = new Set(state.checkedGroceryItems)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { checkedGroceryItems: next }
    }),
  clearGroceryChecks: () => set({ checkedGroceryItems: new Set() }),
}))
