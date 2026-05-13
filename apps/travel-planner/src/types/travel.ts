export type TripStatus = 'planning' | 'active' | 'completed' | 'cancelled'

export interface Trip {
  id: number
  title: string
  destination: string
  country: string
  start_date: string | null
  end_date: string | null
  budget: number
  currency: string
  status: TripStatus
  notes: string
  created_at: string
}

export interface TripWithDetails extends Trip {
  itinerary: ItineraryItem[]
  packing_items: PackingItem[]
}

export interface ItineraryItem {
  id: number
  trip_id: number
  day_offset: number
  time_label: string
  title: string
  description: string
  location: string
  estimated_cost: number
  notes: string
  created_at: string
}

export interface PackingItem {
  id: number
  trip_id: number
  name: string
  category: string
  packed: boolean
  created_at: string
}
