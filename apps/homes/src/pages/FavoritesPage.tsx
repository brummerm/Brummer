import { useQuery } from '@tanstack/react-query'
import { fetchListings } from '../api/listings'
import { ListingCard } from '../components/listings/ListingCard'

export function FavoritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['listings', { favorites_only: true }],
    queryFn: () => fetchListings({ favorites_only: true }),
  })

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">⭐ Favorites</h1>
        <span className="text-sm text-gray-400">{data?.length ?? 0} saved</span>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-200 h-64 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-semibold text-gray-600">No favorites yet</p>
          <p className="text-sm mt-1">Click the ⭐ on any listing to save it here.</p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
