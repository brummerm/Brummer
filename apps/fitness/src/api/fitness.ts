import client from './client'
import type { PlanConfig, PlanDay, WorkoutLog } from '../types/fitness'
import type { ExerciseSetCreate, RunEntryCreate } from './fitnessTypes'

export interface WorkoutLogPayload {
  plan_day_index: number
  logged_date: string
  notes?: string | null
  exercises: ExerciseSetCreate[]
  run?: RunEntryCreate | null
}

export async function getConfig(): Promise<PlanConfig> {
  const res = await client.get<PlanConfig>('/fitness/config')
  return res.data
}

export async function setConfig(start_date: string): Promise<PlanConfig> {
  const res = await client.post<PlanConfig>('/fitness/config', { start_date })
  return res.data
}

export async function getPlan(): Promise<PlanDay[]> {
  const res = await client.get<PlanDay[]>('/fitness/plan')
  return res.data
}

export async function getPlanDay(day_index: number): Promise<PlanDay> {
  const res = await client.get<PlanDay>(`/fitness/plan/${day_index}`)
  return res.data
}

export async function getLogs(): Promise<WorkoutLog[]> {
  const res = await client.get<WorkoutLog[]>('/fitness/logs')
  return res.data
}

export async function getLogByDay(day_index: number): Promise<WorkoutLog | null> {
  try {
    const res = await client.get<WorkoutLog>(`/fitness/logs/day/${day_index}`)
    return res.data
  } catch (err: unknown) {
    const e = err as { response?: { status?: number } }
    if (e?.response?.status === 404) return null
    throw err
  }
}

export async function createLog(data: WorkoutLogPayload): Promise<WorkoutLog> {
  const res = await client.post<WorkoutLog>('/fitness/logs', data)
  return res.data
}

export async function updateLog(id: number, data: WorkoutLogPayload): Promise<WorkoutLog> {
  const res = await client.put<WorkoutLog>(`/fitness/logs/${id}`, data)
  return res.data
}

export async function deleteLog(id: number): Promise<void> {
  await client.delete(`/fitness/logs/${id}`)
}
