export interface IngredientInRecipe {
  id?: number
  ingredient_id?: number
  name: string
  quantity?: string
  unit?: string
  notes?: string
  sort_order: number
}

export interface RecipeListItem {
  id: number
  title: string
  category?: string
  cuisine?: string
  image_filename?: string
  servings: number
  prep_time_mins?: number
  cook_time_mins?: number
  is_custom: boolean
  tags?: string
}

export interface Recipe extends RecipeListItem {
  description?: string
  instructions: string
  source_url?: string
  external_id?: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  created_at: string
  updated_at: string
  ingredients: IngredientInRecipe[]
}

export interface PaginatedRecipes {
  items: RecipeListItem[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface RecipeFilters {
  q?: string
  ingredient?: string
  category?: string
  cuisine?: string
  is_custom?: boolean
  page?: number
  per_page?: number
}

export interface RecipeFormData {
  title: string
  description: string
  instructions: string
  category: string
  cuisine: string
  servings: number
  prep_time_mins: string
  cook_time_mins: string
  image_filename: string
  source_url: string
  tags: string
  calories: number | ''
  protein_g: number | ''
  carbs_g: number | ''
  fat_g: number | ''
  ingredients: IngredientInRecipe[]
}
