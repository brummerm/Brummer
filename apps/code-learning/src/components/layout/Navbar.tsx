import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ title }: { title?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-40 no-print border-b border-gray-700">
      <div className="max-w-full px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <a href="/dashboard/" className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:block">← Dashboard</a>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💻</span>
            <span className="font-bold text-lg text-white">Code Lab</span>
          </Link>
          {title && <span className="hidden md:block text-gray-400 text-sm">/ {title}</span>}
        </div>
        <button onClick={() => setOpen(o => !o)} className="sm:hidden p-2 rounded text-gray-400 hover:text-white">
          ☰
        </button>
      </div>
      {open && (
        <div className="sm:hidden bg-gray-800 border-t border-gray-700 px-4 py-3">
          <a href="/dashboard/" className="block text-gray-300 hover:text-white py-2 text-sm">← Back to Dashboard</a>
        </div>
      )}
    </nav>
  )
}
