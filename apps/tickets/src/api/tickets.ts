import axios from 'axios'

const api = axios.create({
  baseURL: '/api/tickets',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login/'
    }
    return Promise.reject(err)
  },
)

// ─── Types ────────────────────────────────────────────────────────────────────

export type Status = 'backlog' | 'todo' | 'in_progress' | 'waiting' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Assignee = 'me' | 'partner' | 'shared' | null

export interface Label {
  id: number
  name: string
  color: string
}

export interface Space {
  id: number
  name: string
  description: string | null
  icon: string
  color: string
  is_archived: boolean
  is_completed_archive: boolean
  sort_order: number
  ticket_count: number
  created_at: string
}

export interface ChecklistItem {
  id: number
  ticket_id: number
  content: string
  is_done: boolean
  sort_order: number
  created_at: string
}

export interface Comment {
  id: number
  ticket_id: number
  author: string
  content: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: number
  ticket_id: number
  actor: string
  action: string
  field: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
}

export interface TicketListItem {
  id: number
  space_id: number
  title: string
  status: Status
  priority: Priority
  assignee: Assignee
  due_date: string | null
  recurrence_json: string | null
  labels: Label[]
  checklist_count: number
  comment_count: number
  created_at: string
  updated_at: string
  effort: string | null
}

export interface Ticket extends TicketListItem {
  description: string | null
  reporter: string
  completed_at: string | null
  checklist: ChecklistItem[]
  comments: Comment[]
  activity: ActivityLog[]
}

export interface HouseholdSettings {
  id: number
  member1_name: string
  member2_name: string
  member1_email: string | null
  member2_email: string | null
  notifications_enabled: boolean
}

export interface SavedView {
  id: number
  name: string
  filters_json: string
  created_at: string
}

export interface DashboardStats {
  due_today: TicketListItem[]
  overdue: TicketListItem[]
  my_tasks: TicketListItem[]
  unassigned: TicketListItem[]
  completed_this_week: number
}

export interface TicketFilters {
  space_id?: number
  status?: Status
  priority?: Priority
  assignee?: Assignee | ''
  search?: string
  limit?: number
  offset?: number
}

export interface CreateTicketPayload {
  space_id: number
  title: string
  description?: string
  status?: Status
  priority?: Priority
  assignee?: Assignee
  due_date?: string | null
  effort?: string | null
  recurrence_json?: string | null
  label_ids?: number[]
}

export interface UpdateTicketPayload {
  title?: string
  description?: string | null
  status?: Status
  priority?: Priority
  assignee?: Assignee
  due_date?: string | null
  effort?: string | null
  recurrence_json?: string | null
  label_ids?: number[]
}

export interface CreateSpacePayload {
  name: string
  description?: string | null
  icon?: string
  color?: string
}

export interface UpdateSpacePayload extends Partial<CreateSpacePayload> {
  is_archived?: boolean
  sort_order?: number
}

// ─── Spaces ───────────────────────────────────────────────────────────────────

export async function getSpaces(includeArchived = false): Promise<Space[]> {
  const { data } = await api.get('/spaces', { params: { include_archived: includeArchived } })
  return data
}

export async function createSpace(payload: CreateSpacePayload): Promise<Space> {
  const { data } = await api.post('/spaces', payload)
  return data
}

export async function updateSpace(id: number, payload: UpdateSpacePayload): Promise<Space> {
  const { data } = await api.patch(`/spaces/${id}`, payload)
  return data
}

export async function deleteSpace(id: number): Promise<void> {
  await api.delete(`/spaces/${id}`)
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export async function getLabels(): Promise<Label[]> {
  const { data } = await api.get('/labels')
  return data
}

export async function createLabel(name: string, color: string): Promise<Label> {
  const { data } = await api.post('/labels', { name, color })
  return data
}

export async function deleteLabel(id: number): Promise<void> {
  await api.delete(`/labels/${id}`)
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function getTickets(params: TicketFilters = {}): Promise<TicketListItem[]> {
  const { data } = await api.get('/tickets', { params })
  return data
}

export async function getTicket(id: number): Promise<Ticket> {
  const { data } = await api.get(`/tickets/${id}`)
  return data
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const { data } = await api.post('/tickets', payload)
  return data
}

export async function updateTicket(id: number, payload: UpdateTicketPayload): Promise<Ticket> {
  const { data } = await api.patch(`/tickets/${id}`, payload)
  return data
}

export async function deleteTicket(id: number): Promise<void> {
  await api.delete(`/tickets/${id}`)
}

export async function completeTicket(id: number): Promise<Ticket> {
  const { data } = await api.post(`/tickets/${id}/complete`)
  return data
}

export async function reorderTickets(spaceId: number, orderedIds: number[]): Promise<void> {
  await api.post(`/tickets/reorder`, { space_id: spaceId, ordered_ids: orderedIds })
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export async function addChecklistItem(
  ticketId: number,
  content: string,
): Promise<ChecklistItem> {
  const { data } = await api.post(`/tickets/${ticketId}/checklist`, { content })
  return data
}

export async function updateChecklistItem(
  ticketId: number,
  itemId: number,
  payload: { content?: string; is_done?: boolean },
): Promise<ChecklistItem> {
  const { data } = await api.patch(`/tickets/${ticketId}/checklist/${itemId}`, payload)
  return data
}

export async function deleteChecklistItem(ticketId: number, itemId: number): Promise<void> {
  await api.delete(`/tickets/${ticketId}/checklist/${itemId}`)
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addComment(
  ticketId: number,
  content: string,
  author: string,
): Promise<Comment> {
  const { data } = await api.post(`/tickets/${ticketId}/comments`, { content, author })
  return data
}

export async function deleteComment(ticketId: number, commentId: number): Promise<void> {
  await api.delete(`/tickets/${ticketId}/comments/${commentId}`)
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard(member: 'me' | 'partner'): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard', { params: { member } })
  return data
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<HouseholdSettings> {
  const { data } = await api.get('/settings')
  return data
}

export async function updateSettings(
  payload: Partial<Pick<HouseholdSettings, 'member1_name' | 'member2_name' | 'member1_email' | 'member2_email' | 'notifications_enabled'>>,
): Promise<HouseholdSettings> {
  const { data } = await api.patch('/settings', payload)
  return data
}

// ─── Saved Views ──────────────────────────────────────────────────────────────

export async function getSavedViews(): Promise<SavedView[]> {
  const { data } = await api.get('/saved-views')
  return data
}

export async function createSavedView(name: string, filters_json: string): Promise<SavedView> {
  const { data } = await api.post('/saved-views', { name, filters_json })
  return data
}

export async function deleteSavedView(id: number): Promise<void> {
  await api.delete(`/saved-views/${id}`)
}
