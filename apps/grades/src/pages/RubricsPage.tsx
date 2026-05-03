import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getRubrics, createRubric, deleteRubric } from '../api/grades'

export default function RubricsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', description: '' })

  const { data: rubrics = [], isLoading } = useQuery({ queryKey: ['rubrics'], queryFn: getRubrics })

  const createMut = useMutation({
    mutationFn: createRubric,
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['rubrics'] }); setShowModal(false); navigate(`/rubrics/${r.id}`) },
  })

  const deleteMut = useMutation({
    mutationFn: deleteRubric,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rubrics'] }),
  })

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Rubrics</h1>
          <p className="text-gray-500 text-sm mt-1">Build rubrics, then grade with them.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors">
          + New Rubric
        </button>
      </div>

      {rubrics.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg">No rubrics yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rubrics.map(rubric => (
            <div key={rubric.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all">
              <div className="mb-3">
                {rubric.subject && (
                  <span className="text-xs font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                    {rubric.subject}
                  </span>
                )}
                <h2 className="font-semibold text-gray-900 text-lg mt-2">{rubric.name}</h2>
                {rubric.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{rubric.description}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate(`/rubrics/${rubric.id}`)}
                  className="flex-1 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                  Open
                </button>
                <button
                  onClick={() => { if (confirm('Delete this rubric and all its grades?')) deleteMut.mutate(rubric.id) }}
                  className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
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
            <h2 className="font-display text-2xl font-bold mb-4">New Rubric</h2>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Rubric name (e.g. Essay Rubric)" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Subject (e.g. CS, English)" value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                rows={3} placeholder="Description (optional)" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button disabled={!form.name || createMut.isPending}
                onClick={() => createMut.mutate(form)}
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
                {createMut.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
