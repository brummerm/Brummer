export interface GroceryLineItem {
  ingredient_id: number
  ingredient_name: string
  ingredient_category: string
  combined_quantity: string
  unit: string
  source_recipes: string[]
}

export interface GroceryListResponse {
  week_plan_id: number
  week_start: string
  items: GroceryLineItem[]
  grouped_by_category: Record<string, GroceryLineItem[]>
}
