import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, updateSettings, fetchNeighborhoods } from '../api/listings'
import type { ScrapeSettings } from '../api/listings'

const BATH_OPTIONS = [1, 1.5, 2, 2.5, 3]
const BED_OPTIONS = [1, 2, 3, 4, 5]

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  return `$${(n / 1000).toFixed(0)}K`
}

export function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['homes-settings'],
    queryFn: fetchSettings,
  })

  const { data: allNeighborhoods = [] } = useQuery({
    queryKey: ['homes-neighborhoods'],
    queryFn: fetchNeighborhoods,
  })

  const [form, setForm] = useState<ScrapeSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings && !form) setForm(settings)
  }, [settings])

  const saveMut = useMutation({
    mutationFn: (data: Partial<ScrapeSettings>) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  if (isLoading || !form) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  function handleSave() {
    if (!form) return
    saveMut.mutate(form)
  }

  function toggleNeighborhood(n: string) {
    setForm(f => {
      if (!f) return f
      const has = f.neighborhoods.includes(n)
      return {
        ...f,
        neighborhoods: has
          ? f.neighborhoods.filter(x => x !== n)
          : [...f.neighborhoods, n],
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">⚙️ Scrape Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Changes apply on the next scrape run.
        </p>
      </div>

      {/* Max Price */}
      <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">Max Price</label>
          <span className="text-lg font-bold text-blue-600">{formatPrice(form.max_price)}</span>
        </div>
        <input
          type="range"
          min={100_000}
          max={2_000_000}
          step={25_000}
          value={form.max_price}
          onChange={e => setForm(f => f ? { ...f, max_price: Number(e.target.value) } : f)}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>$100K</span><span>$500K</span><span>$1M</span><span>$1.5M</span><span>$2M</span>
        </div>
      </div>

      {/* Beds & Baths */}
      <div className="rounded-xl bg-white border border-gray-200 p-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Min Beds</label>
          <div className="flex gap-1.5 flex-wrap">
            {BED_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setForm(f => f ? { ...f, min_beds: n } : f)}
                className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${
                  form.min_beds === n
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                }`}
              >
                {n === 5 ? '5+' : n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Min Baths</label>
          <div className="flex gap-1.5 flex-wrap">
            {BATH_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setForm(f => f ? { ...f, min_baths: n } : f)}
                className={`w-12 h-10 rounded-lg text-sm font-bold border transition-colors ${
                  form.min_baths === n
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Neighborhoods */}
      <div className="rounded-xl bg-white border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-800 mb-3">Neighborhoods</label>
        <div className="flex flex-wrap gap-2">
          {allNeighborhoods.map(n => {
            const active = form.neighborhoods.includes(n)
            return (
              <button
                key={n}
                onClick={() => toggleNeighborhood(n)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {active ? '✓ ' : ''}{n}
              </button>
            )
          })}
        </div>
        {form.neighborhoods.length === 0 && (
          <p className="text-xs text-red-500 mt-2">Select at least one neighborhood.</p>
        )}
      </div>

      {/* Toggles */}
      <div className="rounded-xl bg-white border border-gray-200 divide-y divide-gray-100">
        {[
          { key: 'no_hoa', label: 'No HOA', desc: 'Exclude listings with HOA fees' },
          { key: 'no_foreclosure', label: 'No Foreclosures', desc: 'Exclude foreclosure listings' },
          { key: 'single_family_only', label: 'Single-Family Only', desc: 'Exclude condos, co-ops, multi-family' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <button
              onClick={() => setForm(f => f ? { ...f, [key]: !f[key as keyof ScrapeSettings] } : f)}
              className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ${
                form[key as keyof ScrapeSettings] ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={Boolean(form[key as keyof ScrapeSettings])}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  form[key as keyof ScrapeSettings] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saveMut.isPending || form.neighborhoods.length === 0}
        className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saveMut.isPending ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
