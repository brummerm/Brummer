import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { getTrips, createTrip, deleteTrip, duplicateTrip } from '../api/travel'
import type { Trip, TripStatus } from '../types/travel'

const STATUS_COLORS: Record<TripStatus, string> = {
  planning:  'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

const EMPTY: Omit<Trip, 'id' | 'created_at'> = {
  title: '', destination: '', country: '',
  start_date: null, end_date: null,
  budget: 0, currency: 'USD',
  status: 'planning', notes: '',
}

export default function TripsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data: trips = [], isLoading } = useQuery({ queryKey: ['trips'], queryFn: getTrips })

  const createMut = useMutation({
    mutationFn: createTrip,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trips'] }); setShowModal(false); setForm(EMPTY) },
  })

  const deleteMut = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })

  const duplicateMut = useMutation({
    mutationFn: duplicateTrip,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })

  const set = (k: keyof typeof form, v: string | number | null) => setForm(f => ({ ...f, [k]: v }))

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">My Trips</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
        >
          + New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">✈️</div>
          <p className="text-lg">No trips yet. Start planning your next adventure!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map(trip => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-brand-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg group-hover:text-brand-600 transition-colors">
                    {trip.title}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {trip.destination}{trip.country ? `, ${trip.country}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[trip.status]}`}>
                  {trip.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                {(trip.start_date || trip.end_date) && (
                  <p>
                    📅 {trip.start_date ? format(new Date(trip.start_date), 'MMM d, yyyy') : '?'}
                    {trip.end_date ? ` → ${format(new Date(trip.end_date), 'MMM d, yyyy')}` : ''}
                  </p>
                )}
                {trip.budget > 0 && (
                  <p>💰 {trip.currency} {trip.budget.toLocaleString()}</p>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={e => { e.stopPropagation(); duplicateMut.mutate(trip.id) }}
                  className="text-xs text-blue-400 hover:text-blue-600 transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={e => { e.stopPropagation(); if (confirm('Delete this trip?')) deleteMut.mutate(trip.id) }}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-display text-2xl font-bold mb-4">New Trip</h2>
            <div className="space-y-3">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Trip title (e.g. Tokyo Spring 2026)"
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Destination city"
                  value={form.destination}
                  onChange={e => set('destination', e.target.value)}
                />
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Country"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    value={form.start_date ?? ''} onChange={e => set('start_date', e.target.value || null)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    value={form.end_date ?? ''} onChange={e => set('end_date', e.target.value || null)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="number" min="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Budget" value={form.budget || ''} onChange={e => set('budget', parseFloat(e.target.value) || 0)} />
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {['USD','EUR','GBP','JPY','CAD','AUD','MXN'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                disabled={!form.title || !form.destination || createMut.isPending}
                onClick={() => createMut.mutate(form)}
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
                {createMut.isPending ? 'Creating…' : 'Create Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
