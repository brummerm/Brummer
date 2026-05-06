import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor.tsx'
import { languages } from '../curriculum/index.ts'
import { isCompleted, markComplete, getCompletedCount } from '../progress.ts'
import { runJavaScript, runPython, previewHTML, showStatic } from '../runner.ts'
import type { RunResult } from '../runner.ts'
import type { Lesson } from '../curriculum/types.ts'
import Navbar from '../components/layout/Navbar.tsx'

type MobileTab = 'lesson' | 'editor' | 'output'

export default function LessonPage() {
  const { languageId, lessonId } = useParams<{ languageId: string; lessonId: string }>()
  const navigate = useNavigate()

  const lang = languages.find(l => l.id === languageId)
  const lesson: Lesson | undefined = lang?.lessons.find(l => l.id === lessonId) ?? lang?.lessons[0]

  const [code, setCode] = useState(lesson?.starterCode ?? '')
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [mobileTab, setMobileTab] = useState<MobileTab>('lesson')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (lesson) setCode(lesson.starterCode)
    setResult(null)
    setStatusMsg('')
    setMobileTab('lesson')
  }, [lessonId, languageId, lesson])

  const handleRun = useCallback(async () => {
    if (!lang || !lesson) return
    setRunning(true)
    setResult(null)
    setStatusMsg('Running…')
    setMobileTab('output')
    try {
      let r: RunResult
      if (lang.runtime === 'javascript') r = await runJavaScript(code)
      else if (lang.runtime === 'python') r = await runPython(code, setStatusMsg)
      else if (lang.runtime === 'html') r = await previewHTML(code)
      else r = await showStatic()
      setResult(r)
    } finally {
      setRunning(false)
      setStatusMsg('')
    }
  }, [lang, lesson, code])

  const handleMarkComplete = () => {
    if (lang && lesson) {
      markComplete(lang.id, lesson.id)
      const idx = lang.lessons.findIndex(l => l.id === lesson.id)
      if (idx < lang.lessons.length - 1) {
        navigate(`/learn/${lang.id}/${lang.lessons[idx + 1].id}`)
      }
    }
  }

  if (!lang) return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Language not found.</p>
          <Link to="/" className="text-brand-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )

  if (!lesson) return null

  const completedCount = getCompletedCount(lang.id)
  const done = isCompleted(lang.id, lesson.id)
  const lessonIdx = lang.lessons.findIndex(l => l.id === lesson.id)
  const prevLesson = lessonIdx > 0 ? lang.lessons[lessonIdx - 1] : null
  const nextLesson = lessonIdx < lang.lessons.length - 1 ? lang.lessons[lessonIdx + 1] : null

  const canRun = lang.runtime !== 'static'

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top navbar with language + lesson info */}
      <nav className="bg-gray-900 text-white sticky top-0 z-40 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/dashboard/" className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:block flex-shrink-0">← Dashboard</a>
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xl">{lang.icon}</span>
              <span className="font-bold text-white hidden sm:block">{lang.name}</span>
            </Link>
            <span className="text-gray-500 hidden sm:block">/</span>
            <span className="text-gray-300 text-sm truncate hidden sm:block">{lesson.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">{completedCount}/{lang.lessons.length} done</span>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="sm:hidden text-gray-400 hover:text-white px-2 py-1 text-sm border border-gray-600 rounded"
            >
              Lessons
            </button>
            <Link to="/" className="text-gray-400 hover:text-white text-xs hidden sm:block">All Languages</Link>
          </div>
        </div>
      </nav>

      {/* Mobile tab bar */}
      <div className="sm:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
        {(['lesson', 'editor', 'output'] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              mobileTab === tab ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500'
            }`}
          >
            {tab === 'editor' ? '📝 Editor' : tab === 'lesson' ? '📖 Lesson' : '▶ Output'}
          </button>
        ))}
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — lesson list */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} sm:block w-full sm:w-56 lg:w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto absolute sm:relative z-30 sm:z-auto top-0 left-0 h-full sm:h-auto`}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{lang.name} Lessons</span>
              <button onClick={() => setSidebarOpen(false)} className="sm:hidden text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <nav className="space-y-0.5">
              {lang.lessons.map(l => {
                const lessonDone = isCompleted(lang.id, l.id)
                const active = l.id === lesson.id
                return (
                  <Link
                    key={l.id}
                    to={`/learn/${lang.id}/${l.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex-shrink-0 w-4 h-4 text-xs flex items-center justify-center">
                      {lessonDone ? '✅' : active ? '▶' : '○'}
                    </span>
                    <span className="truncate">{l.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Lesson Content Panel */}
        <div className={`${mobileTab !== 'lesson' ? 'hidden sm:flex' : 'flex'} flex-col flex-1 sm:flex-none sm:w-[380px] lg:w-[440px] overflow-y-auto bg-white border-r border-gray-200`}>
          <div className="p-5 flex-1">
            <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
          {/* Nav + complete buttons */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                {prevLesson && (
                  <Link to={`/learn/${lang.id}/${prevLesson.id}`} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    ← Prev
                  </Link>
                )}
              </div>
              <button
                onClick={handleMarkComplete}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  done
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-brand-600 hover:bg-brand-700 text-white'
                }`}
              >
                {done ? '✓ Completed' : nextLesson ? 'Complete & Next →' : 'Mark Complete ✓'}
              </button>
            </div>
          </div>
        </div>

        {/* Editor + Output Panel */}
        <div className={`${mobileTab === 'lesson' ? 'hidden sm:flex' : 'flex'} flex-col flex-1 overflow-hidden bg-gray-900`}>
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <span className="text-xs text-gray-400 font-mono">
              {lang.id === 'html' || lang.id === 'css' ? 'index.html' :
               lang.id === 'javascript' ? 'script.js' :
               lang.id === 'python' ? 'main.py' :
               lang.id === 'java' ? 'Main.java' :
               lang.id === 'cpp' ? 'main.cpp' : 'commands.sh'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCode(lesson.starterCode)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
              {canRun ? (
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="text-xs font-medium px-3 py-1 rounded bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-colors flex items-center gap-1"
                >
                  {running ? '⏳ Running…' : '▶ Run'}
                </button>
              ) : (
                <span className="text-xs text-gray-500 px-2 py-1">Read-only preview</span>
              )}
            </div>
          </div>

          {/* Editor area */}
          <div className={`${mobileTab === 'output' ? 'hidden sm:block' : 'block'} flex-1 overflow-hidden`} style={{ minHeight: 0 }}>
            <CodeEditor code={code} onChange={setCode} runtime={lang.runtime} languageId={lang.id} />
          </div>

          {/* Output / Preview Panel */}
          <div className={`${mobileTab === 'editor' ? 'hidden sm:block' : 'block'} h-48 sm:h-56 border-t border-gray-700 bg-gray-950 flex flex-col flex-shrink-0`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {result?.isPreview ? 'Preview' : 'Output'}
              </span>
              {statusMsg && <span className="text-xs text-yellow-400 animate-pulse">{statusMsg}</span>}
              {result && (
                <button onClick={() => setResult(null)} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {result?.isPreview ? (
                <iframe
                  srcDoc={result.previewHtml}
                  title="preview"
                  className="w-full h-full bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : result ? (
                <pre className={`p-4 text-sm font-mono whitespace-pre-wrap leading-relaxed ${result.isError ? 'text-red-400' : 'text-green-400'}`}>
                  {result.output}
                </pre>
              ) : (
                <div className="p-4 text-sm text-gray-600 font-mono">
                  {canRun ? "Click ▶ Run to execute your code" : (
                    lesson.expectedOutput
                      ? <><span className="text-gray-500 text-xs block mb-2">Expected output:</span><span className="text-green-400">{lesson.expectedOutput}</span></>
                      : <span>This language requires a local environment to run. See lesson for instructions.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
