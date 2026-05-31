interface Props {
  neighborhood: string
  sort: string
  onNeighborhood: (v: string) => void
  onSort: (v: string) => void
}

const NEIGHBORHOODS = ['All', 'Brooklyn', 'Queens', 'Manhattan']
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'dom', label: 'Days Listed' },
]

export function FilterBar({ neighborhood, sort, onNeighborhood, onSort }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Neighborhood pills */}
      <div className="flex gap-1.5">
        {NEIGHBORHOODS.map(n => (
          <button
            key={n}
            onClick={() => onNeighborhood(n === 'All' ? '' : n)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              (n === 'All' && !neighborhood) || n === neighborhood
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Sort:</span>
        <select
          value={sort}
          onChange={e => onSort(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {SORTS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
