import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listRecipes, deleteRecipe } from '../api/recipes'
import type { RecipeFilters } from '../types/recipe'
import RecipeCard from '../components/recipes/RecipeCard'
import RecipeFiltersBar from '../components/recipes/RecipeFilters'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

export default function RecipeIndexPage() {
  const [filters, setFilters] = useState<RecipeFilters>({ page: 1, per_page: 24 })
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipes', filters],
    queryFn: () => listRecipes(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  })

  function handleDelete(id: number) {
    if (confirm('Delete this recipe?')) deleteMutation.mutate(id)
  }

  function updateFilters(partial: Partial<RecipeFilters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-gray-900">Recipes</h1>
        <Link to="/recipes/new">
          <Button>+ Add Recipe</Button>
        </Link>
      </div>

      <RecipeFiltersBar filters={filters} onChange={updateFilters} />

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-red-500">
          Failed to load recipes. Is the backend running?
        </div>
      )}

      {data && (
        <>
          <p className="text-sm text-gray-500">{data.total} recipe{data.total !== 1 ? 's' : ''}</p>
          {data.total === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🍳</p>
              <p className="text-lg font-medium">No recipes yet</p>
              <p className="text-sm mt-1">
                <Link to="/settings" className="text-brand-500 hover:underline">Import from TheMealDB</Link>
                {' '}or{' '}
                <Link to="/recipes/new" className="text-brand-500 hover:underline">create your own</Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.items.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {data.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => updateFilters({ page: (filters.page || 1) - 1 })}
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page {filters.page} of {data.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page === data.pages}
                onClick={() => updateFilters({ page: (filters.page || 1) + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
