import client from './client'
import type { GroceryListResponse } from '../types/grocery'

export async function getGroceryList(weekPlanId: number): Promise<GroceryListResponse> {
  const { data } = await client.get(`/grocery/${weekPlanId}`)
  return data
}
