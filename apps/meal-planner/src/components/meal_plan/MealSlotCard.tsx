import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { updateSlot, randomizeSlot, clearSlot } from '../../api/mealPlan'
import type { MealSlot, SlotType } from '../../types/mealPlan'
import type { RecipeListItem } from '../../types/recipe'
import { imageUrl, SLOT_TYPE_LABELS, SLOT_TYPE_COLORS } from '../../utils/formatters'
import RecipePicker from './RecipePicker'
import clsx from 'clsx'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_LABELS: Record<string, string> = { breakfast: 'Bkfst', lunch: 'Lunch', dinner: 'Dinner' }

interface Props {
  slot: MealSlot
  planId: number
  weekKey: string
  allSlots?: MealSlot[]
}

const SLOT_TYPES: SlotType[] = ['recipe', 'leftovers', 'going_out', 'empty']

export default function MealSlotCard({ slot, planId, weekKey, allSlots = [] }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const queryClient = useQueryClient()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['meal-plan', weekKey] })
    queryClient.invalidateQueries({ queryKey: ['grocery'] })
  }

  const updateMutation = useMutation({
    mutationFn: (data: { slot_type: SlotType; recipe_id?: number; source_slot_id?: number }) =>
      updateSlot(planId, slot.id, data),
    onSuccess: invalidate,
  })

  const randomMutation = useMutation({
    mutationFn: () => randomizeSlot(planId, slot.id),
    onSuccess: invalidate,
  })

  const clearMutation = useMutation({
    mutationFn: () => clearSlot(planId, slot.id),
    onSuccess: invalidate,
  })

  function handleTypeChange(type: SlotType) {
    if (type === 'recipe') {
      setPickerOpen(true)
    } else {
      updateMutation.mutate({ slot_type: type })
    }
  }

  function handlePickRecipe(recipe: RecipeListItem) {
    updateMutation.mutate({ slot_type: 'recipe', recipe_id: recipe.id })
  }

  function handleSourceSlotChange(sourceSlotId: number | undefined) {
    updateMutation.mutate({ slot_type: 'leftovers', source_slot_id: sourceSlotId })
  }

  const isLoading = updateMutation.isPending || randomMutation.isPending || clearMutation.isPending
  const img = imageUrl(slot.recipe?.image_filename)

  // Nutrition display — only shown when recipe has calories
  const calories = (slot.recipe as any)?.calories as number | undefined

  // All recipe slots other than this one, for leftover source picker
  const recipeSlots = allSlots.filter(
    (s) => s.id !== slot.id && s.slot_type === 'recipe' && s.recipe
  )

  return (
    <>
      <div className={clsx(
        'rounded-lg border p-2 min-h-[90px] flex flex-col gap-1 text-xs transition-all',
        slot.slot_type === 'empty' ? 'border-dashed border-gray-200 bg-white' : 'border-gray-200 bg-white shadow-sm',
        isLoading && 'opacity-60'
      )}>
        {/* Slot type selector */}
        <div className="flex items-center justify-between">
          <select
            value={slot.slot_type}
            onChange={(e) => handleTypeChange(e.target.value as SlotType)}
            className={clsx(
              'text-xs rounded px-1 py-0.5 border-0 font-medium cursor-pointer focus:ring-1 focus:ring-brand-400',
              SLOT_TYPE_COLORS[slot.slot_type]
            )}
          >
            {SLOT_TYPES.map((t) => (
              <option key={t} value={t}>{SLOT_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              title="Random recipe"
              onClick={() => randomMutation.mutate()}
              className="text-gray-300 hover:text-brand-400 transition-colors text-base leading-none"
              disabled={isLoading}
            >
              🎲
            </button>
            {slot.slot_type !== 'empty' && (
              <button
                title="Clear"
                onClick={() => clearMutation.mutate()}
                className="text-gray-300 hover:text-red-400 transition-colors"
                disabled={isLoading}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {slot.slot_type === 'recipe' && slot.recipe && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            <Link to={`/recipes/${slot.recipe.id}`} className="flex items-center gap-1.5 group">
              <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-gray-100">
                {img
                  ? <img src={img} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300">🍽</div>
                }
              </div>
              <span className="text-gray-700 group-hover:text-brand-600 line-clamp-2 leading-tight font-medium">
                {slot.recipe.title}
              </span>
            </Link>
            {calories != null && (
              <p className="text-gray-400 text-[10px] leading-tight pl-0.5">{calories} cal</p>
            )}
          </div>
        )}

        {slot.slot_type === 'recipe' && !slot.recipe && (
          <button
            onClick={() => setPickerOpen(true)}
            className="text-brand-400 hover:text-brand-600 text-xs mt-1"
          >
            + Pick a recipe
          </button>
        )}

        {slot.slot_type === 'leftovers' && (
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-blue-400">🥡 Leftovers</p>
            {recipeSlots.length > 0 && (
              <select
                value={slot.source_slot_id ?? ''}
                onChange={(e) => handleSourceSlotChange(e.target.value ? Number(e.target.value) : undefined)}
                className="text-xs rounded border border-gray-200 px-1 py-0.5 text-gray-600 bg-white focus:ring-1 focus:ring-brand-400 w-full"
              >
                <option value="">From which meal?</option>
                {recipeSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {DAY_NAMES[s.day_of_week]} {MEAL_LABELS[s.meal_type]}: {s.recipe?.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {slot.slot_type === 'going_out' && (
          <p className="text-purple-400 mt-1">🍜 Going Out</p>
        )}

        {slot.slot_type === 'empty' && (
          <button
            onClick={() => setPickerOpen(true)}
            className="text-gray-300 hover:text-gray-400 text-xs mt-1"
          >
            + Add meal
          </button>
        )}
      </div>

      <RecipePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickRecipe}
      />
    </>
  )
}
