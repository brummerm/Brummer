import { useQuery } from '@tanstack/react-query'
import { fetchListings } from '../api/listings'
import { ListingCard } from '../components/listings/ListingCard'

export function DismissedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['listings', { include_dismissed: true, dismissed_only: true }],
    queryFn: () => fetchListings({ include_dismissed: true }),
  })

  // filter to only dismissed ones
  const dismissed = data?.filter(l => l.is_dismissed) ?? []

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">🚫 Dismissed</h1>
        <span className="text-sm text-gray-400">{dismissed.length} hidden</span>
      </div>
      <p className="text-sm text-gray-500">These listings are hidden from the main view. Click ↩ to restore any of them.</p>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-200 h-64 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && dismissed.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🚫</p>
          <p className="font-semibold text-gray-600">Nothing dismissed</p>
        </div>
      )}

      {!isLoading && dismissed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dismissed.map(listing => (
            <ListingCard key={listing.id} listing={listing} showDismissed />
          ))}
        </div>
      )}
    </div>
  )
}
