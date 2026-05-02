import { useQuery } from '@tanstack/react-query'
import { getCategories, getCuisines } from '../../api/recipes'
import type { RecipeFilters } from '../../types/recipe'

interface Props {
  filters: RecipeFilters
  onChange: (f: Partial<RecipeFilters>) => void
}

export default function RecipeFiltersBar({ filters, onChange }: Props) {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: cuisines = [] } = useQuery({ queryKey: ['cuisines'], queryFn: getCuisines })

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search by title..."
        value={filters.q || ''}
        onChange={(e) => onChange({ q: e.target.value, page: 1 })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none flex-1 min-w-48"
      />
      <input
        type="text"
        placeholder="Search by ingredient..."
        value={filters.ingredient || ''}
        onChange={(e) => onChange({ ingredient: e.target.value || undefined, page: 1 })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none flex-1 min-w-48"
      />
      <select
        value={filters.category || ''}
        onChange={(e) => onChange({ category: e.target.value || undefined, page: 1 })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      >
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        value={filters.cuisine || ''}
        onChange={(e) => onChange({ cuisine: e.target.value || undefined, page: 1 })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      >
        <option value="">All Cuisines</option>
        {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        value={filters.is_custom === undefined ? '' : String(filters.is_custom)}
        onChange={(e) => {
          const v = e.target.value
          onChange({ is_custom: v === '' ? undefined : v === 'true', page: 1 })
        }}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      >
        <option value="">All Recipes</option>
        <option value="true">My Recipes</option>
        <option value="false">Imported</option>
      </select>
      {(filters.q || filters.ingredient || filters.category || filters.cuisine || filters.is_custom !== undefined) && (
        <button
          onClick={() => onChange({ q: undefined, ingredient: undefined, category: undefined, cuisine: undefined, is_custom: undefined, page: 1 })}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
