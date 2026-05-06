import { Link } from 'react-router-dom'
import { languages } from '../curriculum/index.ts'
import { getCompletedCount } from '../progress.ts'

export default function HomePage() {
  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">💻 Code Lab</h1>
          <p className="text-gray-500 text-lg">Learn to code with interactive lessons and a built-in IDE.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {languages.map(lang => {
            const completed = getCompletedCount(lang.id)
            const total = lang.lessons.length
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0
            return (
              <Link
                key={lang.id}
                to={`/learn/${lang.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{lang.icon}</span>
                  {completed > 0 && (
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {pct}%
                    </span>
                  )}
                </div>
                <h2 className="font-bold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">{lang.name}</h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{lang.description}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{completed}/{total} lessons</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
