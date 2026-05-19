import client from './client'
import type { WeekPlan, WeekPlanListItem, MealSlot, MealSlotUpdate } from '../types/mealPlan'

export async function listWeekPlans(): Promise<WeekPlanListItem[]> {
  const { data } = await client.get('/meal-plans')
  return data
}

export async function getWeekPlanByDate(weekStart: string): Promise<WeekPlan> {
  const { data } = await client.get(`/meal-plans/by-week/${weekStart}`)
  return data
}

export async function getWeekPlan(id: number): Promise<WeekPlan> {
  const { data } = await client.get(`/meal-plans/${id}`)
  return data
}

export async function updateSlot(
  planId: number,
  slotId: number,
  payload: MealSlotUpdate
): Promise<MealSlot> {
  const { data } = await client.put(`/meal-plans/${planId}/slots/${slotId}`, payload)
  return data
}

export async function randomizeSlot(
  planId: number,
  slotId: number,
  category?: string
): Promise<MealSlot> {
  const { data } = await client.post(
    `/meal-plans/${planId}/slots/${slotId}/randomize`,
    null,
    { params: category ? { category } : {} }
  )
  return data
}

export const deleteSlot = (planId: number, slotId: number) =>
  client.delete(`/meal-plans/${planId}/slots/${slotId}`)

export const addSlot = (planId: number, data: { day_of_week: number; label: string }) =>
  client.post<MealSlot>(`/meal-plans/${planId}/slots`, data).then(r => r.data)
