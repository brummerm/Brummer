import client from './client'
import type { Trip, TripWithDetails, ItineraryItem, PackingItem } from '../types/travel'

export const getTrips = () => client.get<Trip[]>('/travel/trips').then(r => r.data)
export const getTrip = (id: number) => client.get<TripWithDetails>(`/travel/trips/${id}`).then(r => r.data)
export const createTrip = (data: Omit<Trip, 'id' | 'created_at'>) =>
  client.post<Trip>('/travel/trips', data).then(r => r.data)
export const updateTrip = (id: number, data: Partial<Trip>) =>
  client.put<Trip>(`/travel/trips/${id}`, data).then(r => r.data)
export const deleteTrip = (id: number) => client.delete(`/travel/trips/${id}`)
export const duplicateTrip = (id: number) => client.post<Trip>(`/travel/trips/${id}/duplicate`).then(r => r.data)

export const addItineraryItem = (data: Omit<ItineraryItem, 'id' | 'created_at'>) =>
  client.post<ItineraryItem>('/travel/itinerary', data).then(r => r.data)
export const updateItineraryItem = (id: number, data: Partial<ItineraryItem>) =>
  client.put<ItineraryItem>(`/travel/itinerary/${id}`, data).then(r => r.data)
export const deleteItineraryItem = (id: number) => client.delete(`/travel/itinerary/${id}`)

export const addPackingItem = (data: Omit<PackingItem, 'id' | 'created_at'>) =>
  client.post<PackingItem>('/travel/packing', data).then(r => r.data)
export const updatePackingItem = (id: number, data: Partial<PackingItem>) =>
  client.put<PackingItem>(`/travel/packing/${id}`, data).then(r => r.data)
export const deletePackingItem = (id: number) => client.delete(`/travel/packing/${id}`)
