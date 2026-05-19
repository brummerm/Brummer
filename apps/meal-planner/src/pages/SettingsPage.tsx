import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSeedStatus, runSeed, importFromUrl } from '../api/seed'
import { deleteAllRecipes } from '../api/recipes'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [seedResult, setSeedResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [seeding, setSeeding] = useState(false)

  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlResult, setUrlResult] = useState<{ status: string; title?: string; message?: string } | null>(null)

  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearResult, setClearResult] = useState<{ deleted: number } | null>(null)

  async function handleClearAll() {
    if (!clearConfirm) { setClearConfirm(true); return }
    setClearing(true)
    setClearResult(null)
    try {
      const result = await deleteAllRecipes()
      setClearResult(result)
      setClearConfirm(false)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['seed-status'] })
      refetch()
    } catch {
      setClearResult({ deleted: -1 })
    } finally {
      setClearing(false)
    }
  }

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['seed-status'],
    queryFn: getSeedStatus,
  })

  async function handleSeed() {
    setSeeding(true)
    setSeedResult(null)
    try {
      const result = await runSeed()
      setSeedResult(result)
      refetch()
    } catch {
      setSeedResult({ imported: 0, skipped: 0, errors: ['Seed failed. Check the backend is running.'] })
    } finally {
      setSeeding(false)
    }
  }

  async function handleUrlImport(e: React.FormEvent) {
    e.preventDefault()
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlResult(null)
    try {
      const result = await importFromUrl(urlInput.trim())
      setUrlResult(result)
      if (result.status === 'imported') setUrlInput('')
      refetch()
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to import. Check the URL and try again.'
      setUrlResult({ status: 'error', message: detail })
    } finally {
      setUrlLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-display font-bold">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Recipe Database</h2>
        {isLoading ? (
          <Spinner size="sm" />
        ) : status ? (
          <div className="space-y-1 text-sm text-gray-600">
            <p>Imported recipes: <span className="font-semibold">{status.seeded}</span></p>
            <p>Custom recipes: <span className="font-semibold">{status.custom}</span></p>
          </div>
        ) : null}

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="font-medium text-gray-700">Import from TheMealDB</h3>
          <p className="text-sm text-gray-500">
            Imports ~200 recipes across 14 categories from{' '}
            <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
              TheMealDB
            </a>{' '}
            (free, no account needed). Already-imported recipes are skipped.
            This may take 1–2 minutes as images are downloaded.
          </p>
          <Button onClick={handleSeed} disabled={seeding}>
            {seeding ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Importing… (this takes a minute)
              </span>
            ) : status?.seed_complete ? (
              'Re-import / Update Recipes'
            ) : (
              'Import Recipes Now'
            )}
          </Button>
          {seedResult && (
            <div className={`rounded-lg p-3 text-sm ${seedResult.errors.length ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
              <p>Imported: <strong>{seedResult.imported}</strong> &nbsp; Skipped: <strong>{seedResult.skipped}</strong></p>
              {seedResult.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {seedResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* URL import */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="font-medium text-gray-700">Import from a URL</h3>
          <p className="text-sm text-gray-500">
            Paste a link to any recipe page — AllRecipes, BBC Good Food, Food Network, Serious Eats, and 500+ other sites are supported.
          </p>
          <form onSubmit={handleUrlImport} className="flex gap-2">
            <input
              type="url"
              placeholder="https://www.allrecipes.com/recipe/..."
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlResult(null) }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
              disabled={urlLoading}
            />
            <Button type="submit" disabled={urlLoading || !urlInput.trim()}>
              {urlLoading ? <span className="flex items-center gap-2"><Spinner size="sm" /> Importing…</span> : 'Import'}
            </Button>
          </form>
          {urlResult && (
            <div className={`rounded-lg p-3 text-sm ${
              urlResult.status === 'error' ? 'bg-red-50 text-red-700'
              : urlResult.status === 'skipped' ? 'bg-yellow-50 text-yellow-800'
              : 'bg-green-50 text-green-800'
            }`}>
              {urlResult.status === 'imported' && <p>✓ Imported <strong>{urlResult.title}</strong></p>}
              {urlResult.status === 'skipped' && <p>{urlResult.message}</p>}
              {urlResult.status === 'error' && <p>{urlResult.message}</p>}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="border-t border-red-100 pt-4 space-y-3">
          <h3 className="font-medium text-red-600">Danger Zone</h3>
          <p className="text-sm text-gray-500">
            Permanently delete all recipes. This cannot be undone. Any meal plan slots using these recipes will be cleared.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                clearConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
            >
              {clearing
                ? <span className="flex items-center gap-2"><Spinner size="sm" /> Deleting…</span>
                : clearConfirm
                ? 'Yes, delete everything'
                : 'Clear all recipes'}
            </button>
            {clearConfirm && !clearing && (
              <button
                onClick={() => setClearConfirm(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
          {clearResult && clearResult.deleted >= 0 && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              ✓ Deleted <strong>{clearResult.deleted}</strong> recipe{clearResult.deleted !== 1 ? 's' : ''}.
            </p>
          )}
          {clearResult && clearResult.deleted === -1 && (
            <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
