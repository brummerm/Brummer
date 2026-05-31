import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleFavorite, dismissListing, undoDismiss } from '../../api/listings'
import type { Listing } from '../../types'

const HOOD_COLORS: Record<string, string> = {
  Brooklyn: 'bg-blue-100 text-blue-700 border-blue-200',
  Queens: 'bg-green-100 text-green-700 border-green-200',
  Manhattan: 'bg-purple-100 text-purple-700 border-purple-200',
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p)
}

function formatSqft(n: number | null) {
  if (!n) return null
  return n.toLocaleString() + ' sqft'
}

interface Props {
  listing: Listing
  showDismissed?: boolean
}

export function ListingCard({ listing, showDismissed = false }: Props) {
  const queryClient = useQueryClient()
  const [dismissed, setDismissed] = useState(false)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] })
    queryClient.invalidateQueries({ queryKey: ['homes-stats'] })
  }

  const favMut = useMutation({ mutationFn: () => toggleFavorite(listing.id), onSuccess: invalidate })
  const dismissMut = useMutation({
    mutationFn: () => dismissListing(listing.id),
    onSuccess: () => { setDismissed(true); invalidate() },
  })
  const undoMut = useMutation({
    mutationFn: () => undoDismiss(listing.id),
    onSuccess: () => { setDismissed(false); invalidate() },
  })

  // Show a brief "dismissed" flash before the card disappears from the list
  if (dismissed && !showDismissed) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between text-sm text-gray-500">
        <span>Dismissed</span>
        <button
          onClick={() => undoMut.mutate()}
          className="text-blue-600 hover:underline text-xs"
        >
          Undo
        </button>
      </div>
    )
  }

  const hoodColor = HOOD_COLORS[listing.neighborhood] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  const domText = listing.days_on_market != null
    ? listing.days_on_market === 0 ? 'New today' : `${listing.days_on_market}d on market`
    : null

  return (
    <div className={`rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
      listing.is_favorite ? 'border-yellow-300' : 'border-gray-200'
    }`}>
      {/* Photo */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.address}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🏠</div>
        )}
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${hoodColor}`}>
            {listing.neighborhood}
          </span>
          {domText && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              listing.days_on_market === 0
                ? 'bg-green-500 text-white'
                : listing.days_on_market! <= 7
                ? 'bg-green-100 text-green-700'
                : 'bg-white/90 text-gray-600'
            }`}>
              {domText}
            </span>
          )}
        </div>
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={() => favMut.mutate()}
            disabled={favMut.isPending}
            title={listing.is_favorite ? 'Remove favorite' : 'Add to favorites'}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-base shadow transition-all ${
              listing.is_favorite
                ? 'bg-yellow-400 text-white'
                : 'bg-white/90 hover:bg-yellow-50 text-gray-400 hover:text-yellow-500'
            }`}
          >
            ⭐
          </button>
          {!showDismissed && (
            <button
              onClick={() => dismissMut.mutate()}
              disabled={dismissMut.isPending}
              title="Dismiss listing"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center text-base shadow transition-all"
            >
              ✕
            </button>
          )}
          {showDismissed && (
            <button
              onClick={() => undoMut.mutate()}
              disabled={undoMut.isPending}
              title="Restore listing"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-blue-50 text-gray-400 hover:text-blue-500 flex items-center justify-center text-sm shadow transition-all"
            >
              ↩
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Price */}
        <p className="text-xl font-bold text-gray-900">{formatPrice(listing.price)}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mt-0.5">
          {listing.beds != null && <span><strong className="text-gray-900">{listing.beds}</strong> bd</span>}
          {listing.baths != null && <span><strong className="text-gray-900">{listing.baths}</strong> ba</span>}
          {listing.sqft != null && <span className="text-gray-500 text-xs">{formatSqft(listing.sqft)}</span>}
        </div>

        {/* Address */}
        <p className="text-sm text-gray-700 mt-1 leading-tight truncate" title={listing.address}>
          {listing.address}
        </p>

        {/* Agent */}
        {listing.listing_agent && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{listing.listing_agent}</p>
        )}

        {/* Zillow link */}
        <a
          href={listing.zillow_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 transition-colors"
        >
          View on Zillow →
        </a>
      </div>
    </div>
  )
}
