export interface Tag {
  id: number
  name: string
  color: string
}

export interface Note {
  id: number
  title: string
  content: string
  pinned: boolean
  color: string
  tags: Tag[]
  created_at: string
  updated_at: string
}
