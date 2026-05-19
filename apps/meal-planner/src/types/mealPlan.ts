import type { RecipeListItem } from './recipe'

export type SlotType = 'recipe' | 'leftovers' | 'going_out' | 'empty' | 'custom'
export type MealType = 'breakfast' | 'lunch' | 'dinner'

export interface MealSlot {
  id: number
  day_of_week: number  // 0=Mon … 6=Sun
  meal_type: string    // free-form label (e.g. "Breakfast", "Snack", custom)
  slot_type: SlotType
  recipe_id?: number
  recipe?: RecipeListItem
  servings_override?: number
  notes?: string
  source_slot_id?: number
  sort_order: number
}

export interface WeekPlan {
  id: number
  week_start: string  // ISO date
  notes?: string
  slots: MealSlot[]
  created_at: string
  updated_at: string
}

export interface WeekPlanListItem {
  id: number
  week_start: string
  created_at: string
}

export interface MealSlotUpdate {
  slot_type: SlotType
  recipe_id?: number
  servings_override?: number
  notes?: string
  source_slot_id?: number
}
