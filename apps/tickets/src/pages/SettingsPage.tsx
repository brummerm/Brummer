import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  getSettings, updateSettings,
  getLabels, createLabel, deleteLabel, Label,
  getSavedViews, deleteSavedView,
} from '../api/tickets'
import { PageSpinner, Spinner } from '../components/ui/Spinner'
import { useToast } from '../context/ToastContext'

const PRESET_LABEL_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#64748b',
]

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // ── Settings ────────────────────────────────────────────────────────────────
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  const [member1, setMember1] = useState('')
  const [member2, setMember2] = useState('')

  useEffect(() => {
    if (settings) {
      setMember1(settings.member1_name)
      setMember2(settings.member2_name)
    }
  }, [settings])

  const updateSettingsMut = useMutation({
    mutationFn: () => updateSettings({ member1_name: member1.trim(), member2_name: member2.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      addToast('Settings saved!', 'success')
    },
    onError: () => addToast('Failed to save settings', 'error'),
  })

  // ── Labels ──────────────────────────────────────────────────────────────────
  const { data: labels = [], isLoading: labelsLoading } = useQuery({
    queryKey: ['labels'],
    queryFn: getLabels,
  })

  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#6366f1')

  const createLabelMut = useMutation({
    mutationFn: () => createLabel(newLabelName.trim(), newLabelColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] })
      setNewLabelName('')
      addToast('Label created!', 'success')
    },
    onError: () => addToast('Failed to create label', 'error'),
  })

  const deleteLabelMut = useMutation({
    mutationFn: (id: number) => deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] })
      addToast('Label deleted', 'success')
    },
    onError: () => addToast('Failed to delete label', 'error'),
  })

  // ── Saved Views ─────────────────────────────────────────────────────────────
  const { data: views = [], isLoading: viewsLoading } = useQuery({
    queryKey: ['saved-views'],
    queryFn: getSavedViews,
  })

  const deleteViewMut = useMutation({
    mutationFn: (id: number) => deleteSavedView(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-views'] })
      addToast('View deleted', 'success')
    },
    onError: () => addToast('Failed to delete view', 'error'),
  })

  if (settingsLoading) return <PageSpinner />

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/apps/tickets/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* ── Household members ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Household Members</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Member 1</label>
            <input
              value={member1}
              onChange={(e) => setMember1(e.target.value)}
              placeholder="e.g. Matt"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Member 2</label>
            <input
              value={member2}
              onChange={(e) => setMember2(e.target.value)}
              placeholder="e.g. Partner"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <button
          onClick={() => updateSettingsMut.mutate()}
          disabled={!member1.trim() || !member2.trim() || updateSettingsMut.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
        >
          {updateSettingsMut.isPending && <Spinner size="sm" />}
          Save Names
        </button>
      </section>

      {/* ── Labels ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Labels</h2>

        {labelsLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : (
          <div className="space-y-2 mb-4">
            {labels.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-3">No labels yet</p>
            )}
            {labels.map((label: Label) => (
              <div key={label.id} className="flex items-center gap-3 group">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1 text-sm text-gray-700">{label.name}</span>
                <button
                  onClick={() => deleteLabelMut.mutate(label.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                  aria-label="Delete label"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create label */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (newLabelName.trim()) createLabelMut.mutate()
          }}
          className="flex gap-2"
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-shrink-0">
              <div
                className="w-6 h-6 rounded-full cursor-pointer border-2 border-gray-200"
                style={{ backgroundColor: newLabelColor }}
              />
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </div>
            <input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Label name…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {PRESET_LABEL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewLabelColor(c)}
                className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${
                  newLabelColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={!newLabelName.trim() || createLabelMut.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {createLabelMut.isPending ? <Spinner size="sm" /> : '+ Add'}
          </button>
        </form>
      </section>

      {/* ── Saved Views ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Saved Views</h2>
        {viewsLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : views.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">No saved views yet</p>
        ) : (
          <div className="space-y-2">
            {views.map((view) => (
              <div key={view.id} className="flex items-center gap-3 group">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="flex-1 text-sm text-gray-700">{view.name}</span>
                <span className="text-xs text-gray-400 font-mono truncate max-w-[160px]">
                  {view.filters_json}
                </span>
                <button
                  onClick={() => deleteViewMut.mutate(view.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
