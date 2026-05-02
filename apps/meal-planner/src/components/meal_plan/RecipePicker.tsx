import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listRecipes } from '../../api/recipes'
import type { RecipeListItem, RecipeFilters } from '../../types/recipe'
import RecipeCard from '../recipes/RecipeCard'
import RecipeFiltersBar from '../recipes/RecipeFilters'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (recipe: RecipeListItem) => void
}

export default function RecipePicker({ open, onClose, onSelect }: Props) {
  const [filters, setFilters] = useState<RecipeFilters>({ page: 1, per_page: 18 })

  const { data, isLoading } = useQuery({
    queryKey: ['recipe-picker', filters],
    queryFn: () => listRecipes(filters),
    enabled: open,
  })

  function handleSelect(recipe: RecipeListItem) {
    onSelect(recipe)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Pick a Recipe" size="xl">
      <div className="space-y-4">
        <RecipeFiltersBar
          filters={filters}
          onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
        />
        {isLoading && <div className="flex justify-center py-10"><Spinner /></div>}
        {data && (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {data.items.map((r) => (
                <RecipeCard key={r.id} recipe={r} compact onSelect={handleSelect} />
              ))}
            </div>
            {data.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="px-2 py-1 text-sm text-gray-500">
                  {filters.page} / {data.pages}
                </span>
                <button
                  disabled={filters.page === data.pages}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
