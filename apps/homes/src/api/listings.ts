import axios from 'axios'
import type { Listing, HomesStats } from '../types'

const BASE = '/api/homes'

export async function fetchListings(params: {
  neighborhood?: string
  sort?: string
  favorites_only?: boolean
  include_dismissed?: boolean
}): Promise<Listing[]> {
  const { data } = await axios.get<Listing[]>(`${BASE}/listings`, { params })
  return data
}

export async function fetchStats(): Promise<HomesStats> {
  const { data } = await axios.get<HomesStats>(`${BASE}/stats`)
  return data
}

export async function toggleFavorite(id: number): Promise<Listing> {
  const { data } = await axios.post<Listing>(`${BASE}/listings/${id}/favorite`)
  return data
}

export async function dismissListing(id: number): Promise<Listing> {
  const { data } = await axios.post<Listing>(`${BASE}/listings/${id}/dismiss`)
  return data
}

export async function undoDismiss(id: number): Promise<void> {
  await axios.delete(`${BASE}/listings/${id}/dismiss`)
}

export async function triggerScrape(): Promise<{ status: string }> {
  const { data } = await axios.post<{ status: string }>(`${BASE}/scrape`)
  return data
}

export interface ScrapeSettings {
  max_price: number
  min_beds: number
  min_baths: number
  no_hoa: boolean
  no_foreclosure: boolean
  single_family_only: boolean
  neighborhoods: string[]
}

export async function fetchSettings(): Promise<ScrapeSettings> {
  const { data } = await axios.get<ScrapeSettings>(`${BASE}/settings`)
  return data
}

export async function updateSettings(patch: Partial<ScrapeSettings>): Promise<ScrapeSettings> {
  const { data } = await axios.patch<ScrapeSettings>(`${BASE}/settings`, patch)
  return data
}

export async function fetchNeighborhoods(): Promise<string[]> {
  const { data } = await axios.get<string[]>(`${BASE}/neighborhoods`)
  return data
}
