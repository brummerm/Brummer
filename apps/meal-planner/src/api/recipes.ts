import client from './client'
import type { PaginatedRecipes, Recipe, RecipeFilters, RecipeFormData, RecipeListItem } from '../types/recipe'

export async function listRecipes(filters: RecipeFilters = {}): Promise<PaginatedRecipes> {
  const { data } = await client.get('/recipes', { params: filters })
  return data
}

export async function getRecipe(id: number): Promise<Recipe> {
  const { data } = await client.get(`/recipes/${id}`)
  return data
}

export async function createRecipe(payload: Partial<RecipeFormData>): Promise<Recipe> {
  const { data } = await client.post('/recipes', toPayload(payload))
  return data
}

export async function updateRecipe(id: number, payload: Partial<RecipeFormData>): Promise<Recipe> {
  const { data } = await client.put(`/recipes/${id}`, toPayload(payload))
  return data
}

export async function deleteRecipe(id: number): Promise<void> {
  await client.delete(`/recipes/${id}`)
}

export async function deleteAllRecipes(): Promise<{ deleted: number }> {
  const { data } = await client.delete('/recipes')
  return data
}

export async function getRandomRecipe(category?: string): Promise<RecipeListItem> {
  const { data } = await client.get('/recipes/random', { params: category ? { category } : {} })
  return data
}

export async function getCategories(): Promise<string[]> {
  const { data } = await client.get('/recipes/categories')
  return data
}

export async function getCuisines(): Promise<string[]> {
  const { data } = await client.get('/recipes/cuisines')
  return data
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/images/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.filename
}

export async function getIngredients(q?: string): Promise<{ id: number; name: string; category?: string }[]> {
  const { data } = await client.get('/ingredients', { params: q ? { q } : {} })
  return data
}

export async function updateIngredientCategory(id: number, category: string): Promise<{ id: number; name: string; category?: string }> {
  const { data } = await client.patch(`/ingredients/${id}`, { category })
  return data
}

function toPayload(form: Partial<RecipeFormData>) {
  return {
    ...form,
    servings: Number(form.servings) || 4,
    prep_time_mins: form.prep_time_mins ? Number(form.prep_time_mins) : null,
    cook_time_mins: form.cook_time_mins ? Number(form.cook_time_mins) : null,
    calories: form.calories !== '' && form.calories != null ? Number(form.calories) : null,
    protein_g: form.protein_g !== '' && form.protein_g != null ? Number(form.protein_g) : null,
    carbs_g: form.carbs_g !== '' && form.carbs_g != null ? Number(form.carbs_g) : null,
    fat_g: form.fat_g !== '' && form.fat_g != null ? Number(form.fat_g) : null,
    ingredients: (form.ingredients || []).map((ing, i) => ({
      ...ing,
      sort_order: i,
    })),
  }
}
