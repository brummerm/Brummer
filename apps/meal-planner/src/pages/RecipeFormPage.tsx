import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRecipe, createRecipe, updateRecipe, getIngredients } from '../api/recipes'
import type { RecipeFormData, IngredientInRecipe } from '../types/recipe'
import ImageUpload from '../components/ui/ImageUpload'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

const DEFAULT_FORM: RecipeFormData = {
  title: '',
  description: '',
  instructions: '',
  category: '',
  cuisine: '',
  servings: 4,
  prep_time_mins: '',
  cook_time_mins: '',
  image_filename: '',
  source_url: '',
  tags: '',
  ingredients: [],
}

function IngredientRow({
  ing,
  index,
  onChange,
  onRemove,
}: {
  ing: IngredientInRecipe
  index: number
  onChange: (i: number, field: keyof IngredientInRecipe, val: string) => void
  onRemove: (i: number) => void
}) {
  const [suggestions, setSuggestions] = useState<{ id: number; name: string }[]>([])
  const [showSug, setShowSug] = useState(false)

  async function fetchSuggestions(q: string) {
    if (q.length < 2) { setSuggestions([]); return }
    const results = await getIngredients(q)
    setSuggestions(results)
    setShowSug(true)
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Ingredient name *"
          value={ing.name}
          onChange={(e) => {
            onChange(index, 'name', e.target.value)
            fetchSuggestions(e.target.value)
          }}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-brand-400 outline-none"
        />
        {showSug && suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full mt-1 max-h-32 overflow-y-auto text-sm">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="px-2 py-1.5 hover:bg-brand-50 cursor-pointer"
                onMouseDown={() => {
                  onChange(index, 'name', s.name)
                  setShowSug(false)
                }}
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        type="text"
        placeholder="Qty"
        value={ing.quantity || ''}
        onChange={(e) => onChange(index, 'quantity', e.target.value)}
        className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-brand-400 outline-none"
      />
      <input
        type="text"
        placeholder="Unit"
        value={ing.unit || ''}
        onChange={(e) => onChange(index, 'unit', e.target.value)}
        className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-brand-400 outline-none"
      />
      <input
        type="text"
        placeholder="Notes"
        value={ing.notes || ''}
        onChange={(e) => onChange(index, 'notes', e.target.value)}
        className="w-28 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-brand-400 outline-none"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-400 hover:text-red-600 text-sm px-1"
      >
        ✕
      </button>
    </div>
  )
}

export default function RecipeFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<RecipeFormData>(DEFAULT_FORM)
  const [error, setError] = useState('')

  const { data: existing, isLoading } = useQuery({
    queryKey: ['recipe', Number(id)],
    queryFn: () => getRecipe(Number(id)),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        description: existing.description || '',
        instructions: existing.instructions || '',
        category: existing.category || '',
        cuisine: existing.cuisine || '',
        servings: existing.servings || 4,
        prep_time_mins: existing.prep_time_mins ? String(existing.prep_time_mins) : '',
        cook_time_mins: existing.cook_time_mins ? String(existing.cook_time_mins) : '',
        image_filename: existing.image_filename || '',
        source_url: existing.source_url || '',
        tags: existing.tags || '',
        ingredients: existing.ingredients.map((ing, i) => ({
          ingredient_id: ing.ingredient_id,
          name: ing.name,
          quantity: ing.quantity || '',
          unit: ing.unit || '',
          notes: ing.notes || '',
          sort_order: i,
        })),
      })
    }
  }, [existing])

  const saveMutation = useMutation({
    mutationFn: () =>
      isEdit ? updateRecipe(Number(id), form) : createRecipe(form),
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipe', recipe.id] })
      navigate(`/recipes/${recipe.id}`)
    },
    onError: () => setError('Failed to save. Check your inputs and try again.'),
  })

  function setField<K extends keyof RecipeFormData>(key: K, value: RecipeFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addIngredient() {
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { name: '', quantity: '', unit: '', notes: '', sort_order: f.ingredients.length }],
    }))
  }

  function updateIngredient(index: number, field: keyof IngredientInRecipe, value: string) {
    setForm((f) => {
      const ings = [...f.ingredients]
      ings[index] = { ...ings[index], [field]: value }
      return { ...f, ingredients: ings }
    })
  }

  function removeIngredient(index: number) {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== index) }))
  }

  if (isEdit && isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link to="/recipes" className="text-sm text-gray-400 hover:text-brand-500 mb-2 inline-block">
          ← Back to Recipes
        </Link>
        <h1 className="text-3xl font-display font-bold">{isEdit ? 'Edit Recipe' : 'New Recipe'}</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setError(''); saveMutation.mutate() }}
        className="space-y-6"
      >
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setField('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <input type="text" value={form.cuisine} onChange={(e) => setField('cuisine', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input type="number" min={1} value={form.servings} onChange={(e) => setField('servings', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prep (mins)</label>
              <input type="number" min={0} value={form.prep_time_mins} onChange={(e) => setField('prep_time_mins', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cook (mins)</label>
              <input type="number" min={0} value={form.cook_time_mins} onChange={(e) => setField('cook_time_mins', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" placeholder="e.g. Pasta,Vegetarian,Quick"
              value={form.tags} onChange={(e) => setField('tags', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">Photo</h2>
          <ImageUpload value={form.image_filename} onChange={(f) => setField('image_filename', f)} />
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">Ingredients</h2>
          <div className="space-y-2">
            {form.ingredients.map((ing, i) => (
              <IngredientRow
                key={i}
                ing={ing}
                index={i}
                onChange={updateIngredient}
                onRemove={removeIngredient}
              />
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addIngredient}>
            + Add Ingredient
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">Instructions</h2>
          <p className="text-xs text-gray-400">One step per line</p>
          <textarea
            rows={12}
            value={form.instructions}
            onChange={(e) => setField('instructions', e.target.value)}
            placeholder="Step 1: Preheat the oven to 180°C..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none font-mono"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Recipe'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
