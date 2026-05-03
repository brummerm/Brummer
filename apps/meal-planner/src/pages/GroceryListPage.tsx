import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGroceryList } from '../api/grocery'
import { getWeekPlanByDate } from '../api/mealPlan'
import { updateIngredientCategory } from '../api/recipes'
import { useUIStore } from '../store/uiStore'
import type { GroceryLineItem } from '../types/grocery'
import { weekLabel } from '../utils/weekDates'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import clsx from 'clsx'

const CATEGORY_ICONS: Record<string, string> = {
  Produce: '🥦',
  'Meat & Seafood': '🥩',
  Meat: '🥩',
  'Dairy & Eggs': '🥛',
  Dairy: '🥛',
  Bakery: '🍞',
  Frozen: '🧊',
  Pantry: '🥫',
  Beverages: '🥤',
  Other: '🛒',
}

const STORE_SECTIONS = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Frozen', 'Pantry', 'Beverages', 'Other']

interface CustomItem {
  id: string
  name: string
  quantity: string
  unit: string
}

function GroceryItem({ item, checked, onToggle, planId }: {
  item: GroceryLineItem
  checked: boolean
  onToggle: () => void
  planId?: number
}) {
  const queryClient = useQueryClient()
  const categoryMutation = useMutation({
    mutationFn: (category: string) => updateIngredientCategory(item.ingredient_id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery', planId] })
    },
  })

  return (
    <li
      className={clsx(
        'flex items-center gap-3 py-2 select-none',
        checked && 'opacity-40 line-through'
      )}
    >
      <div
        className={clsx(
          'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer',
          checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
        )}
        onClick={onToggle}
      >
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <div className="flex-1 cursor-pointer" onClick={onToggle}>
        <span className="font-medium text-gray-800">{item.ingredient_name}</span>
        {item.source_recipes.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            from: {item.source_recipes.join(', ')}
          </p>
        )}
      </div>
      {item.ingredient_category === 'Other' && (
        <select
          value=""
          onChange={(e) => { if (e.target.value) categoryMutation.mutate(e.target.value) }}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-500 bg-white focus:ring-1 focus:ring-brand-400"
          title="Move to section"
          disabled={categoryMutation.isPending}
        >
          <option value="">Move to…</option>
          {STORE_SECTIONS.filter((s) => s !== 'Other').map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </li>
  )
}

function CustomGroceryItem({ item, checked, onToggle, onRemove }: {
  item: CustomItem
  checked: boolean
  onToggle: () => void
  onRemove: () => void
}) {
  return (
    <li className={clsx('flex items-start gap-3 py-2 select-none', checked && 'opacity-40 line-through')}>
      <div
        className={clsx(
          'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer',
          checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
        )}
        onClick={onToggle}
      >
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <div className="flex-1 cursor-pointer" onClick={onToggle}>
        <span className="font-medium text-gray-800">{item.name}</span>
        {(item.quantity || item.unit) && (
          <span className="text-gray-500 text-sm ml-2">
            {[item.quantity, item.unit].filter(Boolean).join(' ')}
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        className="text-gray-300 hover:text-red-400 transition-colors px-1"
        title="Remove item"
      >
        ✕
      </button>
    </li>
  )
}

function AddItemForm({ onAdd, onCancel }: {
  onAdd: (item: Omit<CustomItem, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, quantity: quantity.trim(), unit: unit.trim() })
    setName('')
    setQuantity('')
    setUnit('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap pt-1">
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none flex-1 min-w-32"
        autoFocus
      />
      <input
        type="text"
        placeholder="Qty"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none w-16"
      />
      <input
        type="text"
        placeholder="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none w-20"
      />
      <Button type="submit" size="sm" disabled={!name.trim()}>Add</Button>
      <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600">
        Cancel
      </button>
    </form>
  )
}

export default function GroceryListPage() {
  const { weekPlanId } = useParams<{ weekPlanId?: string }>()
  const { activeWeek, checkedGroceryItems, toggleGroceryItem, clearGroceryChecks } = useUIStore()
  const [customItems, setCustomItems] = useState<CustomItem[]>([])
  const [checkedCustomIds, setCheckedCustomIds] = useState<Set<string>>(new Set())
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['meal-plan', activeWeek],
    queryFn: () => getWeekPlanByDate(activeWeek),
    enabled: !weekPlanId,
  })

  const planId = weekPlanId ? Number(weekPlanId) : plan?.id

  const { data: groceryList, isLoading: groceryLoading } = useQuery({
    queryKey: ['grocery', planId],
    queryFn: () => getGroceryList(planId!),
    enabled: Boolean(planId),
  })

  const isLoading = planLoading || groceryLoading

  function addCustomItem(item: Omit<CustomItem, 'id'>) {
    setCustomItems((prev) => [...prev, { ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2) }])
    setShowAddForm(false)
  }

  function removeCustomItem(id: string) {
    setCustomItems((prev) => prev.filter((i) => i.id !== id))
    setCheckedCustomIds((prev) => { const next = new Set(prev); next.delete(id); return next })
  }

  function toggleCustomItem(id: string) {
    setCheckedCustomIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function exportAsText() {
    if (!groceryList) return
    const lines: string[] = []
    lines.push(`Grocery List — Week of ${weekLabel(groceryList.week_start)}`)
    lines.push('='.repeat(36))
    lines.push('')

    for (const [category, items] of Object.entries(groceryList.grouped_by_category)) {
      lines.push(`${CATEGORY_ICONS[category] || '•'} ${category}`)
      lines.push('-'.repeat(20))
      for (const item of items) {
        lines.push(`- ${item.ingredient_name}`)
      }
      lines.push('')
    }

    if (customItems.length > 0) {
      lines.push('🛒 Additional Items')
      lines.push('-'.repeat(20))
      for (const item of customItems) {
        const qty = [item.quantity, item.unit].filter(Boolean).join(' ')
        lines.push(`- ${item.name}${qty ? `  (${qty})` : ''}`)
      }
      lines.push('')
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grocery-list-${groceryList.week_start}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-display font-bold">Grocery List</h1>
          {groceryList && (
            <p className="text-sm text-gray-500 mt-1">Week of {weekLabel(groceryList.week_start)}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="secondary" size="sm" onClick={clearGroceryChecks}>
            Uncheck All
          </Button>
          {groceryList && (
            <Button variant="secondary" size="sm" onClick={exportAsText}>
              ⬇ Export
            </Button>
          )}
          <Button size="sm" onClick={() => window.print()}>
            🖨️ Print
          </Button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {/* Empty state when no recipes planned */}
      {groceryList && groceryList.items.length === 0 && customItems.length === 0 && !showAddForm && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg font-medium">No ingredients yet</p>
          <p className="text-sm mt-1">Assign some recipes in the planner to generate your list.</p>
        </div>
      )}

      {/* Recipe-based category sections */}
      {groceryList && groceryList.items.length > 0 && (
        <>
          {/* Print header */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold">Grocery List</h1>
            <p className="text-gray-500">Week of {weekLabel(groceryList.week_start)}</p>
          </div>

          {Object.entries(groceryList.grouped_by_category).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                <span>{CATEGORY_ICONS[category] || '🛒'}</span>
                <span>{category}</span>
                <span className="ml-auto text-xs text-gray-400 font-normal">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </h2>
              <ul className="divide-y divide-gray-50">
                {items.map((item) => (
                  <GroceryItem
                    key={`${item.ingredient_id}_${item.unit}`}
                    item={item}
                    checked={checkedGroceryItems.has(item.ingredient_id)}
                    onToggle={() => toggleGroceryItem(item.ingredient_id)}
                    planId={planId}
                  />
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {/* Additional / manually added items — always visible once list loads */}
      {groceryList && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
            <span>➕</span>
            <span>Additional Items</span>
            {customItems.length > 0 && (
              <span className="ml-auto text-xs text-gray-400 font-normal">
                {customItems.length} item{customItems.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>

          {customItems.length > 0 && (
            <ul className="divide-y divide-gray-50 mb-2">
              {customItems.map((item) => (
                <CustomGroceryItem
                  key={item.id}
                  item={item}
                  checked={checkedCustomIds.has(item.id)}
                  onToggle={() => toggleCustomItem(item.id)}
                  onRemove={() => removeCustomItem(item.id)}
                />
              ))}
            </ul>
          )}

          {showAddForm ? (
            <AddItemForm onAdd={addCustomItem} onCancel={() => setShowAddForm(false)} />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 mt-1"
            >
              + Add item
            </button>
          )}
        </div>
      )}

      {groceryList && (groceryList.items.length > 0 || customItems.length > 0) && (
        <p className="text-xs text-gray-300 text-center no-print">
          Click items to check them off • Checks are not saved
        </p>
      )}
    </div>
  )
}
