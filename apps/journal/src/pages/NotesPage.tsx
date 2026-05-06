import { useState, useEffect, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { getNotes, createNote, updateNote, deleteNote, getTags, createTag } from '../api/journal'
import type { Note, Tag } from '../types/journal'

function highlight(text: string, query: string): ReactNode {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">{part}</mark>
      : part
  )
}

type EditorTab = 'write' | 'preview'
type Draft = Partial<Note> & { tag_ids?: number[] }

export default function NotesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeTagId, setActiveTagId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editorTab, setEditorTab] = useState<EditorTab>('write')
  const [draft, setDraft] = useState<Draft>({})
  const [isDirty, setIsDirty] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', search, activeTagId],
    queryFn: () => getNotes(search || undefined, activeTagId || undefined),
  })

  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: getTags })

  const selectedNote = notes.find(n => n.id === selectedId) ?? null

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (selectedNote) {
      setDraft({ title: selectedNote.title, content: selectedNote.content, tag_ids: selectedNote.tags.map(t => t.id) })
      setIsDirty(false)
    }
  }, [selectedId, selectedNote?.updated_at])

  const createMut = useMutation({
    mutationFn: createNote,
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      setSelectedId(note.id)
      setEditorTab('write')
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<Note & { tag_ids: number[] }>) => updateNote(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); setIsDirty(false) },
  })

  const deleteMut = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); setSelectedId(null) },
  })

  const createTagMut = useMutation({
    mutationFn: createTag,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); setNewTagName(''); setShowTagInput(false) },
  })

  const autoSave = useCallback((data: Partial<Note & { tag_ids: number[] }>) => {
    if (!selectedId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateMut.mutate({ id: selectedId, ...data })
    }, 800)
  }, [selectedId])

  const onTitleChange = (title: string) => {
    setDraft(d => ({ ...d, title }))
    setIsDirty(true)
    autoSave({ title, content: draft.content })
  }

  const onContentChange = (content: string) => {
    setDraft(d => ({ ...d, content }))
    setIsDirty(true)
    autoSave({ title: draft.title, content })
  }

  const toggleTag = (tag: Tag) => {
    const current = draft.tag_ids ?? []
    const next = current.includes(tag.id) ? current.filter((id: number) => id !== tag.id) : [...current, tag.id]
    setDraft(d => ({ ...d, tag_ids: next }))
    setIsDirty(true)
    autoSave({ title: draft.title, content: draft.content, tag_ids: next })
  }

  const togglePin = () => {
    if (!selectedNote || !selectedId) return
    updateMut.mutate({ id: selectedId, pinned: !selectedNote.pinned })
  }

  return (
    <div className="flex flex-col sm:flex-row w-full h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Sidebar — hidden on mobile when a note is selected */}
      <div className={`${selectedNote ? 'hidden sm:flex' : 'flex'} w-full sm:w-72 flex-shrink-0 bg-white border-b sm:border-b-0 sm:border-r border-gray-200 flex-col overflow-hidden sm:h-full`}>
        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Search notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Tags</span>
            <button onClick={() => setShowTagInput(!showTagInput)} className="text-xs text-brand-500 hover:text-brand-600">+ Add</button>
          </div>
          {showTagInput && (
            <div className="flex gap-1 mb-2">
              <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
                placeholder="Tag name" value={newTagName} onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newTagName) createTagMut.mutate({ name: newTagName }) }} />
              <button onClick={() => newTagName && createTagMut.mutate({ name: newTagName })}
                className="text-xs bg-brand-500 text-white px-2 py-1 rounded">Add</button>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setActiveTagId(null)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!activeTagId ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              All
            </button>
            {tags.map(tag => (
              <button key={tag.id} onClick={() => setActiveTagId(tag.id === activeTagId ? null : tag.id)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${activeTagId === tag.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={activeTagId === tag.id ? { backgroundColor: tag.color } : {}}>
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* New note button */}
        <div className="px-3 py-2 border-b border-gray-100">
          <button onClick={() => createMut.mutate({ title: 'Untitled', content: '' })}
            className="w-full py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
            + New Note
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-center text-sm text-gray-400 mt-8">No notes found.</p>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedId === note.id ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {note.pinned && <span className="text-xs">📌</span>}
                  <p className="text-sm font-medium text-gray-900 truncate">{highlight(note.title || 'Untitled', search)}</p>
                </div>
                <p className="text-xs text-gray-400 truncate">{highlight(note.content.slice(0, 60), search)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-300">{format(new Date(note.updated_at), 'MMM d')}</span>
                  {note.tags.map(t => (
                    <span key={t.id} className="text-xs px-1.5 py-0 rounded-full text-white" style={{ backgroundColor: t.color }}>{t.name}</span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      {selectedNote ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white min-h-0">
          {/* Mobile back button */}
          <div className="sm:hidden px-4 py-2 border-b border-gray-100 flex-shrink-0">
            <button
              onClick={() => setSelectedId(null)}
              className="text-sm text-gray-500 hover:text-brand-600 flex items-center gap-1"
            >
              ← All Notes
            </button>
          </div>
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 flex-shrink-0 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 p-0.5 rounded-md">
                {(['write', 'preview'] as EditorTab[]).map(t => (
                  <button key={t} onClick={() => setEditorTab(t)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${editorTab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {isDirty && <span className="text-xs text-gray-400">Saving…</span>}
              {!isDirty && updateMut.isSuccess && <span className="text-xs text-green-500">Saved</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tag picker */}
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <button key={tag.id} onClick={() => toggleTag(tag)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors border ${(draft.tag_ids ?? []).includes(tag.id) ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                    style={(draft.tag_ids ?? []).includes(tag.id) ? { backgroundColor: tag.color, borderColor: tag.color } : {}}>
                    {tag.name}
                  </button>
                ))}
              </div>
              <button onClick={togglePin} title={selectedNote.pinned ? 'Unpin' : 'Pin'}
                className={`text-sm transition-colors ${selectedNote.pinned ? 'opacity-100' : 'opacity-30 hover:opacity-70'}`}>
                📌
              </button>
              <button onClick={() => { if (confirm('Delete this note?')) deleteMut.mutate(selectedNote.id) }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
            </div>
          </div>

          {/* Title */}
          <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-2 flex-shrink-0">
            <input
              className="w-full text-3xl font-display font-bold text-gray-900 focus:outline-none bg-transparent placeholder-gray-300"
              placeholder="Untitled"
              value={draft.title ?? ''}
              onChange={e => onTitleChange(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Last edited {format(new Date(selectedNote.updated_at), 'MMM d, yyyy · h:mm a')}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 sm:px-8 pb-8">
            {editorTab === 'write' ? (
              <textarea
                className="w-full h-full min-h-[400px] text-base text-gray-800 focus:outline-none bg-transparent resize-none leading-relaxed font-mono placeholder-gray-300"
                placeholder="Start writing… (Markdown supported)"
                value={draft.content ?? ''}
                onChange={e => onContentChange(e.target.value)}
              />
            ) : (
              <div className="prose prose-sm max-w-none pt-2">
                {draft.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center bg-gray-50 text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">📓</div>
            <p className="text-lg font-medium">Select a note or create a new one</p>
          </div>
        </div>
      )}
    </div>
  )
}
