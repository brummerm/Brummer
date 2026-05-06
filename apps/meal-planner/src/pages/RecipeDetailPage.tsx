import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRecipe, deleteRecipe } from '../api/recipes'
import { imageUrl, formatTime } from '../utils/formatters'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const recipeId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => getRecipe(recipeId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      navigate('/recipes')
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (isError || !recipe) return <div className="text-center py-20 text-red-500">Recipe not found.</div>

  const img = imageUrl(recipe.image_filename)
  const steps = recipe.instructions
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Link to="/recipes" className="text-sm text-gray-400 hover:text-brand-500 mb-2 inline-block">
            ← Back to Recipes
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-gray-500 mt-2">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/recipes/${recipe.id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => confirm('Delete this recipe?') && deleteMutation.mutate()}
          >
            Delete
          </Button>
        </div>
      </div>

      {img && (
        <img
          src={img}
          alt={recipe.title}
          className="w-full h-72 object-cover rounded-xl shadow"
        />
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {recipe.category && <Badge color="brand">{recipe.category}</Badge>}
        {recipe.cuisine && <Badge color="blue">{recipe.cuisine}</Badge>}
        {recipe.is_custom && <Badge color="green">Custom Recipe</Badge>}
        {recipe.tags?.split(',').map((t) => (
          <Badge key={t} color="gray">{t.trim()}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-brand-50 rounded-xl p-4 text-center">
        {recipe.prep_time_mins && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Prep</p>
            <p className="font-semibold text-brand-700">{formatTime(recipe.prep_time_mins)}</p>
          </div>
        )}
        {recipe.cook_time_mins && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Cook</p>
            <p className="font-semibold text-brand-700">{formatTime(recipe.cook_time_mins)}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Servings</p>
          <p className="font-semibold text-brand-700">{recipe.servings}</p>
        </div>
      </div>

      {recipe.ingredients.length > 0 && (
        <div>
          <h2 className="text-xl font-display font-semibold mb-3">Ingredients</h2>
          <ul className="divide-y divide-gray-100">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="py-2 flex items-baseline gap-2">
                <span className="font-medium text-brand-700 min-w-16 text-sm">
                  {[ing.quantity, ing.unit].filter(Boolean).join(' ')}
                </span>
                <span className="text-gray-800">{ing.name}</span>
                {ing.notes && <span className="text-gray-400 text-sm italic">({ing.notes})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <h2 className="text-xl font-display font-semibold mb-3">Instructions</h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {recipe.source_url && (
        <p className="text-sm text-gray-400">
          Source:{' '}
          <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
            {recipe.source_url}
          </a>
        </p>
      )}
    </div>
  )
}
