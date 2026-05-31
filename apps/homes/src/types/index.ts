export interface Listing {
  id: number
  zillow_id: string
  address: string
  neighborhood: 'Brooklyn' | 'Queens' | 'Manhattan'
  price: number
  beds: number | null
  baths: number | null
  sqft: number | null
  days_on_market: number | null
  listing_agent: string | null
  property_type: string | null
  zillow_url: string
  image_url: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  first_seen: string
  last_seen: string
  is_favorite: boolean
  is_dismissed: boolean
}

export interface HomesStats {
  total_active: number
  new_today: number
  favorites: number
  by_neighborhood: Record<string, number>
  last_scraped: string | null
  last_scrape_status: string | null
}
