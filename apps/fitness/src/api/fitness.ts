import axios from 'axios'
import { format } from 'date-fns'

const api = axios.create({
  baseURL: '/api/fitness',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) window.location.replace('/login/')
    return Promise.reject(err)
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────

export type WorkoutType = 'lift' | 'run' | 'rest' | 'hike' | 'custom'
export type WorkoutStatus = 'planned' | 'completed'

export interface WorkoutExercise {
  id?: number
  exercise_name: string
  sets: number | null
  reps: string | null
  weight: string | null
  notes: string | null
  sort_order: number
}

export interface WorkoutRun {
  id?: number
  distance_miles: number | null
  duration_minutes: number | null
  notes: string | null
}

export interface WorkoutEntry {
  id: number
  date: string
  workout_type: WorkoutType
  custom_type_label: string | null
  title: string | null
  status: WorkoutStatus
  notes: string | null
  exercises: WorkoutExercise[]
  run: WorkoutRun | null
}

export interface WorkoutTemplate {
  id: number
  name: string
  workout_type: WorkoutType
  custom_type_label: string | null
  notes: string | null
  exercises: WorkoutExercise[]
}

export interface BodyWeightEntry {
  id: number
  date: string
  weight_lbs: number
  notes: string | null
}

// ── Workouts ──────────────────────────────────────────────────────────────────

export const getWorkoutsInRange = (start: Date, end: Date) =>
  api.get<WorkoutEntry[]>('/workouts', {
    params: { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') }
  }).then(r => r.data)

export const getWorkoutByDate = (date: string) =>
  api.get<WorkoutEntry>(`/workouts/date/${date}`).then(r => r.data)

export const createWorkout = (data: Omit<WorkoutEntry, 'id'>) =>
  api.post<WorkoutEntry>('/workouts', data).then(r => r.data)

export const updateWorkout = (id: number, data: Partial<Omit<WorkoutEntry, 'id'>>) =>
  api.put<WorkoutEntry>(`/workouts/${id}`, data).then(r => r.data)

export const deleteWorkout = (id: number) => api.delete(`/workouts/${id}`)

export const clearPlannedWorkouts = () =>
  api.delete<{ deleted: number }>('/workouts/planned').then(r => r.data)

// ── Templates ─────────────────────────────────────────────────────────────────

export const getTemplates = () =>
  api.get<WorkoutTemplate[]>('/templates').then(r => r.data)

export const createTemplate = (data: Omit<WorkoutTemplate, 'id'>) =>
  api.post<WorkoutTemplate>('/templates', data).then(r => r.data)

export const updateTemplate = (id: number, data: Partial<Omit<WorkoutTemplate, 'id'>>) =>
  api.put<WorkoutTemplate>(`/templates/${id}`, data).then(r => r.data)

export const deleteTemplate = (id: number) => api.delete(`/templates/${id}`)

// ── Body Weight ───────────────────────────────────────────────────────────────

const bwApi = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})
bwApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) window.location.replace('/login/')
    return Promise.reject(err)
  }
)

export const getBodyWeights = () => bwApi.get<BodyWeightEntry[]>('/body-weight').then(r => r.data)
export const logBodyWeight = (data: { date: string; weight_lbs: number; notes?: string }) =>
  bwApi.post<BodyWeightEntry>('/body-weight', data).then(r => r.data)
export const deleteBodyWeight = (id: number) => bwApi.delete(`/body-weight/${id}`)
