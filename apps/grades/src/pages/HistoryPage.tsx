import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { getGradeHistory, deleteGradeEntry } from '../api/grades'

const LETTER_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-600',
  F: 'bg-red-100 text-red-600',
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: entries = [], isLoading } = useQuery({ queryKey: ['grade-history'], queryFn: getGradeHistory })

  const deleteMut = useMutation({
    mutationFn: deleteGradeEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grade-history'] }),
  })

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Grade History</h1>
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-brand-600 flex items-center gap-1">← Rubrics</button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">No grades saved yet.</p>
          <p className="text-sm mt-2">Open a rubric and click "Grade" to save a calculation.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rubric</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">%</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{entry.label}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.rubric_name}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{entry.total_earned} / {entry.total_possible}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{entry.percentage.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${LETTER_COLORS[entry.letter_grade] ?? 'bg-gray-100 text-gray-600'}`}>
                      {entry.letter_grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{format(new Date(entry.created_at), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('Delete this entry?')) deleteMut.mutate(entry.id) }}
                      className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
