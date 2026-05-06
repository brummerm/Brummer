import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays } from 'date-fns'

// parseISO on a date-only string returns midnight UTC, which shifts the day
// backward in any US timezone. Appending T12:00:00 forces local-noon parsing.
const parseDate = (s: string) => new Date(s + 'T12:00:00')
import {
  getTrip, updateTrip, addItineraryItem, deleteItineraryItem, updateItineraryItem,
  addPackingItem, updatePackingItem, deletePackingItem,
} from '../api/travel'
import type { TripStatus } from '../types/travel'

const TEMPLATES: Record<string, { name: string; category: string }[]> = {
  'Weekend Trip': [
    { name: 'Phone charger', category: 'Electronics' },
    { name: 'Change of clothes', category: 'Clothing' },
    { name: 'Toiletries', category: 'Toiletries' },
    { name: 'Wallet & ID', category: 'Documents' },
    { name: 'Snacks', category: 'Food' },
  ],
  'International Flight': [
    { name: 'Passport', category: 'Documents' },
    { name: 'Travel insurance docs', category: 'Documents' },
    { name: 'Neck pillow', category: 'Comfort' },
    { name: 'Noise-canceling headphones', category: 'Electronics' },
    { name: 'Eye mask', category: 'Comfort' },
    { name: 'Portable charger', category: 'Electronics' },
    { name: 'Snacks', category: 'Food' },
  ],
  'Beach Vacation': [
    { name: 'Sunscreen SPF 50+', category: 'Toiletries' },
    { name: 'Swimsuit', category: 'Clothing' },
    { name: 'Beach towel', category: 'Gear' },
    { name: 'Sunglasses', category: 'Accessories' },
    { name: 'Flip flops', category: 'Clothing' },
    { name: 'Waterproof phone case', category: 'Electronics' },
    { name: 'After-sun lotion', category: 'Toiletries' },
  ],
  'Hiking Trip': [
    { name: 'Trail map / GPS', category: 'Navigation' },
    { name: 'Water bottle (2L)', category: 'Gear' },
    { name: 'Trail snacks', category: 'Food' },
    { name: 'First aid kit', category: 'Safety' },
    { name: 'Hiking boots', category: 'Clothing' },
    { name: 'Rain jacket', category: 'Clothing' },
    { name: 'Sunscreen', category: 'Toiletries' },
    { name: 'Headlamp', category: 'Gear' },
  ],
}

const STATUS_COLORS: Record<TripStatus, string> = {
  planning:  'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

type Tab = 'itinerary' | 'packing' | 'overview'

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const tripId = Number(id)
  const [tab, setTab] = useState<Tab>('itinerary')
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [newDay, setNewDay] = useState(0)
  const [newTime, setNewTime] = useState('')
  const [newLoc, setNewLoc] = useState('')
  const [newCost, setNewCost] = useState(0)
  const [showTemplates, setShowTemplates] = useState(false)

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['trip', tripId] })

  const addItinMut = useMutation({ mutationFn: addItineraryItem, onSuccess: invalidate })
  const delItinMut = useMutation({ mutationFn: deleteItineraryItem, onSuccess: invalidate })
  const moveItinMut = useMutation({
    mutationFn: ({ id, day_offset }: { id: number; day_offset: number }) => updateItineraryItem(id, { day_offset }),
    onSuccess: invalidate,
  })

  const addPackMut = useMutation({ mutationFn: addPackingItem, onSuccess: invalidate })
  const togglePackMut = useMutation({ mutationFn: ({ id: itemId, packed }: { id: number; packed: boolean }) =>
    updatePackingItem(itemId, { packed }), onSuccess: invalidate })
  const delPackMut = useMutation({ mutationFn: deletePackingItem, onSuccess: invalidate })

  const updateStatusMut = useMutation({ mutationFn: (status: TripStatus) => updateTrip(tripId, { status }),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ['trips'] }) } })

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>
  if (!trip) return <p className="text-center py-20 text-gray-500">Trip not found.</p>

  const days = trip.itinerary.length > 0
    ? Math.max(...trip.itinerary.map(i => i.day_offset)) + 1
    : 0
  const totalItinCost = trip.itinerary.reduce((s, i) => s + i.estimated_cost, 0)
  const packedCount = trip.packing_items.filter(i => i.packed).length

  const byCategory = trip.packing_items.reduce<Record<string, typeof trip.packing_items>>((acc, item) => {
    (acc[item.category] = acc[item.category] ?? []).push(item)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-brand-600 mb-2 flex items-center gap-1">← All Trips</button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 break-words">{trip.title}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {trip.destination}{trip.country ? `, ${trip.country}` : ''}
            {trip.start_date && ` · ${format(parseDate(trip.start_date), 'MMM d')}`}
            {trip.end_date && ` – ${format(parseDate(trip.end_date), 'MMM d, yyyy')}`}
          </p>
        </div>
        <select
          value={trip.status}
          onChange={e => updateStatusMut.mutate(e.target.value as TripStatus)}
          className={`text-sm font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer self-start flex-shrink-0 ${STATUS_COLORS[trip.status]}`}
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-2 sm:p-4 text-center">
          <div className="text-base sm:text-2xl font-bold text-brand-600 truncate">{trip.budget > 0 ? `${trip.currency} ${trip.budget.toLocaleString()}` : '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Budget</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-2 sm:p-4 text-center">
          <div className="text-base sm:text-2xl font-bold text-gray-700 truncate">{totalItinCost > 0 ? `${trip.currency} ${totalItinCost.toLocaleString()}` : '—'}</div>
          <div className="text-xs text-gray-500 mt-1">Planned Spend</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-2 sm:p-4 text-center">
          <div className="text-base sm:text-2xl font-bold text-gray-700">{packedCount}/{trip.packing_items.length}</div>
          <div className="text-xs text-gray-500 mt-1">Items Packed</div>
        </div>
      </div>

      {/* Timeline */}
      {days > 0 && (
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {Array.from({ length: days }, (_, d) => {
            const count = trip.itinerary.filter(i => i.day_offset === d).length
            return (
              <button
                key={d}
                onClick={() => { setTab('itinerary') }}
                className="flex-shrink-0 flex flex-col items-center bg-white border border-gray-100 rounded-lg px-3 py-2 min-w-[52px] hover:border-brand-300 transition-colors"
              >
                <span className="text-xs font-semibold text-brand-600">Day {d + 1}</span>
                {trip.start_date && (
                  <span className="text-xs text-gray-400">{format(addDays(parseDate(trip.start_date), d), 'MMM d')}</span>
                )}
                <span className="text-xs text-gray-500 mt-0.5">{count} {count === 1 ? 'activity' : 'activities'}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
        {(['itinerary', 'packing', 'overview'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Itinerary tab */}
      {tab === 'itinerary' && (
        <div className="space-y-6">
          {Array.from({ length: days }, (_, d) => {
            const dayItems = trip.itinerary.filter(i => i.day_offset === d)
            const isFirstDay = d === 0
            const isLastDay = d === days - 1
            return (
              <div key={d}>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-brand-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{d + 1}</span>
                  Day {d + 1}
                  {trip.start_date && <span className="text-xs text-gray-400">{format(addDays(parseDate(trip.start_date), d), 'EEE, MMM d')}</span>}
                </h3>
                <div className="space-y-2 ml-8">
                  {dayItems.map((item, idx) => {
                    const isFirstItem = idx === 0
                    const isLastItem = idx === dayItems.length - 1
                    const canMoveUp = !(isFirstItem && isFirstDay)
                    const canMoveDown = !(isLastItem && isLastDay)
                    return (
                      <div key={item.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-start gap-3">
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <button
                            disabled={!canMoveUp || moveItinMut.isPending}
                            onClick={() => moveItinMut.mutate({ id: item.id, day_offset: d - 1 })}
                            className="text-gray-300 hover:text-brand-500 disabled:opacity-20 text-xs leading-none transition-colors"
                            title="Move to previous day"
                          >↑</button>
                          <button
                            disabled={!canMoveDown || moveItinMut.isPending}
                            onClick={() => moveItinMut.mutate({ id: item.id, day_offset: d + 1 })}
                            className="text-gray-300 hover:text-brand-500 disabled:opacity-20 text-xs leading-none transition-colors"
                            title="Move to next day"
                          >↓</button>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.time_label && <span className="text-xs text-gray-400">{item.time_label}</span>}
                            <span className="font-medium text-sm">{item.title}</span>
                          </div>
                          {item.location && <p className="text-xs text-gray-500 mt-0.5">📍 {item.location}</p>}
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                          {item.estimated_cost > 0 && <p className="text-xs text-brand-600 mt-0.5">💰 {trip.currency} {item.estimated_cost}</p>}
                        </div>
                        <button onClick={() => delItinMut.mutate(item.id)} className="text-gray-300 hover:text-red-400 text-xs transition-colors">✕</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Add item form */}
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add activity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Activity title *" value={newItem} onChange={e => setNewItem(e.target.value)} />
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Location" value={newLoc} onChange={e => setNewLoc(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-500">Day</label>
                <input type="number" min="1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={newDay + 1} onChange={e => setNewDay(Math.max(0, parseInt(e.target.value) - 1 || 0))} />
              </div>
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 self-end"
                placeholder="Time (e.g. 9:00 AM)" value={newTime} onChange={e => setNewTime(e.target.value)} />
              <input type="number" min="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 self-end"
                placeholder="Est. cost" value={newCost || ''} onChange={e => setNewCost(parseFloat(e.target.value) || 0)} />
            </div>
            <button
              disabled={!newItem || addItinMut.isPending}
              onClick={() => {
                addItinMut.mutate({ trip_id: tripId, title: newItem, day_offset: newDay, time_label: newTime, location: newLoc, estimated_cost: newCost, description: '' })
                setNewItem(''); setNewTime(''); setNewLoc(''); setNewCost(0)
              }}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
              Add Activity
            </button>
          </div>
        </div>
      )}

      {/* Packing tab */}
      {tab === 'packing' && (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="font-semibold text-gray-700 mb-2">{cat}</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-2.5">
                    <input type="checkbox" checked={item.packed}
                      onChange={() => togglePackMut.mutate({ id: item.id, packed: !item.packed })}
                      className="h-4 w-4 text-brand-500 rounded border-gray-300 cursor-pointer" />
                    <span className={`flex-1 text-sm ${item.packed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.name}</span>
                    <button onClick={() => delPackMut.mutate(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Add item</h4>
              <button
                onClick={() => setShowTemplates(s => !s)}
                className="text-xs text-brand-500 hover:text-brand-700 font-medium transition-colors"
              >
                {showTemplates ? 'Hide templates' : 'From Template'}
              </button>
            </div>
            {showTemplates && (
              <div className="mb-3">
                <select
                  defaultValue=""
                  onChange={e => {
                    const templateName = e.target.value
                    if (!templateName) return
                    const items = TEMPLATES[templateName]
                    items.forEach(item => {
                      addPackMut.mutate({ trip_id: tripId, name: item.name, category: item.category, packed: false })
                    })
                    setShowTemplates(false)
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">— select a template —</option>
                  {Object.keys(TEMPLATES).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <input className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Item name" value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newItem) { addPackMut.mutate({ trip_id: tripId, name: newItem, category: newCategory, packed: false }); setNewItem('') }}} />
              <input className="w-full sm:w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
              <button disabled={!newItem || addPackMut.isPending}
                onClick={() => { addPackMut.mutate({ trip_id: tripId, name: newItem, category: newCategory, packed: false }); setNewItem('') }}
                className="w-full sm:w-auto px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
          <h3 className="font-semibold text-gray-900 mb-4">Trip Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-gray-500">Destination:</span> <span className="font-medium ml-2">{trip.destination}</span></div>
            <div><span className="text-gray-500">Country:</span> <span className="font-medium ml-2">{trip.country || '—'}</span></div>
            <div><span className="text-gray-500">Start:</span> <span className="font-medium ml-2">{trip.start_date ? format(parseDate(trip.start_date), 'MMM d, yyyy') : '—'}</span></div>
            <div><span className="text-gray-500">End:</span> <span className="font-medium ml-2">{trip.end_date ? format(parseDate(trip.end_date), 'MMM d, yyyy') : '—'}</span></div>
            <div><span className="text-gray-500">Budget:</span> <span className="font-medium ml-2">{trip.budget > 0 ? `${trip.currency} ${trip.budget.toLocaleString()}` : '—'}</span></div>
            <div><span className="text-gray-500">Planned spend:</span> <span className="font-medium ml-2">{totalItinCost > 0 ? `${trip.currency} ${totalItinCost.toFixed(0)}` : '—'}</span></div>
          </div>
          {trip.notes && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{trip.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
