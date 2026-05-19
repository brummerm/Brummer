import { Link } from 'react-router-dom'
import type { RecipeListItem } from '../../types/recipe'
import { imageUrl, formatTime } from '../../utils/formatters'
import Badge from '../ui/Badge'

interface RecipeCardProps {
  recipe: RecipeListItem
  onDelete?: (id: number) => void
  compact?: boolean
  onSelect?: (recipe: RecipeListItem) => void
}

export default function RecipeCard({ recipe, onDelete, compact, onSelect }: RecipeCardProps) {
  const img = imageUrl(recipe.image_filename)

  const inner = (
    <div className={`bg-white rounded-xl border border-[#dfe1e6] overflow-hidden hover:border-[#0079bf]/30 hover:shadow-md transition-all ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect ? () => onSelect(recipe) : undefined}
    >
      <div className="h-40 bg-gray-100 overflow-hidden">
        {img ? (
          <img src={img} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🍽️</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-[#172b4d] text-sm leading-tight line-clamp-2 mb-2">
          {recipe.title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {recipe.category && <Badge color="brand">{recipe.category}</Badge>}
          {recipe.cuisine && <Badge color="blue">{recipe.cuisine}</Badge>}
          {recipe.is_custom && <Badge color="green">Custom</Badge>}
        </div>
        {!compact && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {recipe.prep_time_mins && <span>Prep: {formatTime(recipe.prep_time_mins)}</span>}
            {recipe.cook_time_mins && <span>Cook: {formatTime(recipe.cook_time_mins)}</span>}
            <span>{recipe.servings} servings</span>
          </div>
        )}
      </div>
      {!compact && !onSelect && (
        <div className="px-3 pb-3 flex gap-2">
          <Link
            to={`/recipes/${recipe.id}`}
            className="text-xs text-[#0079bf] hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            View
          </Link>
          <Link
            to={`/recipes/${recipe.id}/edit`}
            className="text-xs text-[#5e6c84] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          {onDelete && (
            <button
              className="text-xs text-red-400 hover:underline ml-auto"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(recipe.id) }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )

  return onSelect ? inner : <div>{inner}</div>
}
