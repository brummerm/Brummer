import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { updateSlot, randomizeSlot, deleteSlot } from '../../api/mealPlan'
import type { MealSlot, SlotType } from '../../types/mealPlan'
import type { RecipeListItem } from '../../types/recipe'
import { imageUrl } from '../../utils/formatters'
import RecipePicker from './RecipePicker'
import clsx from 'clsx'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  slot: MealSlot
  planId: number
  weekKey: string
  allSlots?: MealSlot[]
}

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

  const deleteMutation = useMutation({
    mutationFn: () => deleteSlot(planId, slot.id),
    onSuccess: invalidate,
  })

  function handlePickRecipe(recipe: RecipeListItem) {
    updateMutation.mutate({ slot_type: 'recipe', recipe_id: recipe.id })
    setPickerOpen(false)
  }

  const isLoading = updateMutation.isPending || randomMutation.isPending || deleteMutation.isPending
  const img = imageUrl(slot.recipe?.image_filename)
  const calories = (slot.recipe as any)?.calories as number | undefined

  const recipeSlots = allSlots.filter(s => s.id !== slot.id && s.slot_type === 'recipe' && s.recipe)

  return (
    <>
      <div className={clsx(
        'rounded-lg border bg-white p-2 flex flex-col gap-1.5 text-xs transition-all group',
        slot.slot_type === 'empty' ? 'border-dashed border-gray-200' : 'border-[#dfe1e6] shadow-sm',
        isLoading && 'opacity-60'
      )}>
        {/* Header row: label + actions */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate">
            {slot.meal_type}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button title="Random recipe" onClick={() => randomMutation.mutate()}
              className="text-gray-300 hover:text-[#0079bf] transition-colors text-sm leading-none"
              disabled={isLoading}>🎲</button>
            <button title="Delete" onClick={() => deleteMutation.mutate()}
              className="text-gray-300 hover:text-red-400 transition-colors leading-none"
              disabled={isLoading}>✕</button>
          </div>
        </div>

        {/* Content */}
        {slot.slot_type === 'recipe' && slot.recipe && (
          <div className="flex flex-col gap-0.5">
            <Link to={`/recipes/${slot.recipe.id}`} className="flex items-center gap-1.5 group/link">
              <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-gray-100 flex-shrink-0">
                {img
                  ? <img src={img} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300">🍽</div>}
              </div>
              <span className="text-gray-700 group-hover/link:text-[#0079bf] line-clamp-2 leading-tight font-medium text-xs">
                {slot.recipe.title}
              </span>
            </Link>
            {calories != null && <p className="text-gray-400 text-[10px]">{calories} cal</p>}
            <button onClick={() => setPickerOpen(true)}
              className="text-[10px] text-gray-400 hover:text-[#0079bf] text-left mt-0.5">
              change →
            </button>
          </div>
        )}

        {(slot.slot_type === 'empty' || (slot.slot_type === 'recipe' && !slot.recipe)) && (
          <div className="flex gap-1.5 mt-0.5">
            <button onClick={() => setPickerOpen(true)}
              className="text-[#0079bf] hover:text-[#026aaa] text-xs font-medium">
              + Pick recipe
            </button>
            <span className="text-gray-200">|</span>
            <button onClick={() => randomMutation.mutate()}
              className="text-gray-400 hover:text-[#0079bf] text-xs">
              🎲 Random
            </button>
          </div>
        )}

        {slot.slot_type === 'leftovers' && (
          <div className="mt-0.5">
            <p className="text-blue-500 font-medium">🥡 Leftovers</p>
            {recipeSlots.length > 0 && (
              <select
                value={slot.source_slot_id ?? ''}
                onChange={(e) => updateMutation.mutate({
                  slot_type: 'leftovers',
                  source_slot_id: e.target.value ? Number(e.target.value) : undefined
                })}
                className="text-xs rounded border border-gray-200 px-1 py-0.5 text-gray-600 bg-white w-full mt-1"
              >
                <option value="">From which meal?</option>
                {recipeSlots.map(s => (
                  <option key={s.id} value={s.id}>
                    {DAY_NAMES[s.day_of_week]}: {s.recipe?.title}
                  </option>
                ))}
              </select>
            )}
            <button onClick={() => updateMutation.mutate({ slot_type: 'recipe' })}
              className="text-[10px] text-gray-400 hover:text-gray-600 mt-1">change type</button>
          </div>
        )}

        {slot.slot_type === 'going_out' && (
          <div className="mt-0.5">
            <p className="text-purple-500 font-medium">🍜 Going Out</p>
            <button onClick={() => updateMutation.mutate({ slot_type: 'empty' })}
              className="text-[10px] text-gray-400 hover:text-gray-600 mt-1">change type</button>
          </div>
        )}

        {/* Slot type switcher — small links at bottom for empty slots */}
        {slot.slot_type === 'empty' && (
          <div className="flex gap-1.5 text-[10px] text-gray-300">
            <button onClick={() => updateMutation.mutate({ slot_type: 'leftovers' })}
              className="hover:text-blue-400">leftovers</button>
            <span>·</span>
            <button onClick={() => updateMutation.mutate({ slot_type: 'going_out' })}
              className="hover:text-purple-400">going out</button>
          </div>
        )}
      </div>

      <RecipePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handlePickRecipe} />
    </>
  )
}
