import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchListings } from '../api/listings'
import { ListingCard } from '../components/listings/ListingCard'
import { FilterBar } from '../components/listings/FilterBar'

export function ListingsPage() {
  const [neighborhood, setNeighborhood] = useState('')
  const [sort, setSort] = useState('newest')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', { neighborhood, sort }],
    queryFn: () => fetchListings({ neighborhood: neighborhood || undefined, sort }),
  })

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">🏠 NYC Listings</h1>
        <span className="text-sm text-gray-400">{data?.length ?? 0} homes</span>
      </div>

      <FilterBar
        neighborhood={neighborhood}
        sort={sort}
        onNeighborhood={setNeighborhood}
        onSort={setSort}
      />

      {isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
          ⚠️ Failed to load listings.
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-200 h-64 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-semibold text-gray-600">No listings yet</p>
          <p className="text-sm mt-1">The daily scrape runs automatically. Use "Scrape Now" in the sidebar to fetch immediately.</p>
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
