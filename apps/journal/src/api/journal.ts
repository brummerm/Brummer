import client from './client'
import type { Note, Tag } from '../types/journal'

export const getNotes = (search?: string, tagId?: number) => {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (tagId) params.tag_id = String(tagId)
  return client.get<Note[]>('/journal/notes', { params }).then(r => r.data)
}
export const getNote = (id: number) => client.get<Note>(`/journal/notes/${id}`).then(r => r.data)
export const createNote = (data: { title?: string; content?: string; tag_ids?: number[] }) =>
  client.post<Note>('/journal/notes', data).then(r => r.data)
export const updateNote = (id: number, data: Partial<Note & { tag_ids: number[] }>) =>
  client.put<Note>(`/journal/notes/${id}`, data).then(r => r.data)
export const deleteNote = (id: number) => client.delete(`/journal/notes/${id}`)

export const getTags = () => client.get<Tag[]>('/journal/tags').then(r => r.data)
export const createTag = (data: { name: string; color?: string }) =>
  client.post<Tag>('/journal/tags', data).then(r => r.data)
export const updateTag = (id: number, data: { name?: string; color?: string }) =>
  client.put<Tag>(`/journal/tags/${id}`, data).then(r => r.data)
export const deleteTag = (id: number) => client.delete(`/journal/tags/${id}`)
