import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRubric, addCriterion, updateCriterion, deleteCriterion, saveGradeEntry } from '../api/grades'

export default function RubricDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const rubricId = Number(id)

  const [newCrit, setNewCrit] = useState({ name: '', description: '', max_points: 10 })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editVal, setEditVal] = useState({ name: '', description: '', max_points: 10 })

  // Grading state
  const [grading, setGrading] = useState(false)
  const [label, setLabel] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})

  const { data: rubric, isLoading } = useQuery({
    queryKey: ['rubric', rubricId],
    queryFn: () => getRubric(rubricId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['rubric', rubricId] })

  const addMut = useMutation({ mutationFn: addCriterion, onSuccess: () => { invalidate(); setNewCrit({ name: '', description: '', max_points: 10 }) } })
  const updateMut = useMutation({ mutationFn: ({ id: cid, ...data }: { id: number } & typeof editVal) => updateCriterion(cid, data),
    onSuccess: () => { invalidate(); setEditingId(null) } })
  const deleteMut = useMutation({ mutationFn: deleteCriterion, onSuccess: invalidate })

  const saveMut = useMutation({
    mutationFn: saveGradeEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grade-history'] })
      navigate('/history')
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>
  if (!rubric) return <p className="text-center py-20 text-gray-500">Rubric not found.</p>

  const totalPossible = rubric.criteria.reduce((s, c) => s + c.max_points, 0)
  const totalEarned = Object.entries(scores).reduce((s, [cid, pts]) => {
    const crit = rubric.criteria.find(c => String(c.id) === cid)
    return s + Math.min(pts, crit?.max_points ?? pts)
  }, 0)
  const pct = totalPossible > 0 ? (totalEarned / totalPossible * 100) : 0
  const letter = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'
  const letterColor = { A: 'text-green-600', B: 'text-blue-600', C: 'text-yellow-600', D: 'text-orange-600', F: 'text-red-600' }[letter]

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-brand-600 mb-4 flex items-center gap-1">← All Rubrics</button>

      <div className="flex items-start justify-between mb-6">
        <div>
          {rubric.subject && <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{rubric.subject}</span>}
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-2">{rubric.name}</h1>
          {rubric.description && <p className="text-gray-500 mt-1">{rubric.description}</p>}
          <p className="text-sm text-gray-400 mt-1">Total: {totalPossible} points</p>
        </div>
        <button onClick={() => { setGrading(!grading); setScores({}) }}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors">
          {grading ? 'Cancel' : '📝 Grade'}
        </button>
      </div>

      {/* Grade Calculator Panel */}
      {grading && (
        <div className="bg-brand-50 rounded-xl border border-brand-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Grade Calculator</h3>
          <div className="mb-4">
            <label className="text-xs text-gray-600 mb-1 block">Label (student name, assignment, etc.)</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              placeholder="e.g. John Doe — Essay #1" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div className="space-y-3 mb-4">
            {rubric.criteria.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <input type="number" min="0" max={c.max_points} step="0.5"
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                    value={scores[String(c.id)] ?? ''}
                    onChange={e => setScores(s => ({ ...s, [String(c.id)]: parseFloat(e.target.value) || 0 }))} />
                  <span>/ {c.max_points}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-brand-200">
            <div className="text-sm">
              <span className="text-gray-600">Score: </span>
              <span className="font-semibold">{totalEarned.toFixed(1)} / {totalPossible}</span>
              <span className="text-gray-500 ml-2">({pct.toFixed(1)}%)</span>
              <span className={`ml-3 text-2xl font-bold ${letterColor}`}>{letter}</span>
            </div>
            <button
              disabled={!label || saveMut.isPending}
              onClick={() => saveMut.mutate({ rubric_id: rubricId, label, scores })}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
              Save Grade
            </button>
          </div>
        </div>
      )}

      {/* Criteria list */}
      <div className="space-y-2 mb-6">
        {rubric.criteria.map((c, idx) => (
          <div key={c.id} className="bg-white rounded-lg border border-gray-100 p-4">
            {editingId === c.id ? (
              <div className="space-y-2">
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={editVal.name} onChange={e => setEditVal(v => ({ ...v, name: e.target.value }))} />
                <div className="flex gap-2">
                  <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="Description" value={editVal.description} onChange={e => setEditVal(v => ({ ...v, description: e.target.value }))} />
                  <input type="number" min="1" className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    value={editVal.max_points} onChange={e => setEditVal(v => ({ ...v, max_points: parseFloat(e.target.value) || 10 }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={() => updateMut.mutate({ id: c.id, ...editVal })}
                    className="text-sm text-brand-600 font-medium hover:text-brand-700">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-xs bg-gray-100 text-gray-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900">{c.name}</p>
                    <span className="text-xs text-brand-600 font-medium">{c.max_points} pts</span>
                  </div>
                  {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => { setEditingId(c.id); setEditVal({ name: c.name, description: c.description, max_points: c.max_points }) }}
                    className="text-gray-400 hover:text-brand-600">Edit</button>
                  <button onClick={() => { if (confirm('Delete criterion?')) deleteMut.mutate(c.id) }}
                    className="text-gray-400 hover:text-red-500">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add criterion */}
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add criterion</h4>
        <div className="flex gap-2">
          <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Criterion name *" value={newCrit.name} onChange={e => setNewCrit(c => ({ ...c, name: e.target.value }))} />
          <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Description" value={newCrit.description} onChange={e => setNewCrit(c => ({ ...c, description: e.target.value }))} />
          <input type="number" min="1" className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Max pts" value={newCrit.max_points} onChange={e => setNewCrit(c => ({ ...c, max_points: parseFloat(e.target.value) || 10 }))} />
          <button disabled={!newCrit.name || addMut.isPending}
            onClick={() => addMut.mutate({ rubric_id: rubricId, ...newCrit, sort_order: rubric.criteria.length })}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
