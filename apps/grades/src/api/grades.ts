import client from './client'
import type { Rubric, RubricCriterion, RubricWithCriteria, GradeEntry } from '../types/grades'

export const getRubrics = () => client.get<Rubric[]>('/grades/rubrics').then(r => r.data)
export const getRubric = (id: number) => client.get<RubricWithCriteria>(`/grades/rubrics/${id}`).then(r => r.data)
export const createRubric = (data: Omit<Rubric, 'id' | 'created_at'>) =>
  client.post<Rubric>('/grades/rubrics', data).then(r => r.data)
export const updateRubric = (id: number, data: Partial<Rubric>) =>
  client.put<Rubric>(`/grades/rubrics/${id}`, data).then(r => r.data)
export const deleteRubric = (id: number) => client.delete(`/grades/rubrics/${id}`)

export const addCriterion = (data: Omit<RubricCriterion, 'id'>) =>
  client.post<RubricCriterion>('/grades/criteria', data).then(r => r.data)
export const updateCriterion = (id: number, data: Partial<RubricCriterion>) =>
  client.put<RubricCriterion>(`/grades/criteria/${id}`, data).then(r => r.data)
export const deleteCriterion = (id: number) => client.delete(`/grades/criteria/${id}`)

export const getGradeHistory = () => client.get<GradeEntry[]>('/grades/entries').then(r => r.data)
export const saveGradeEntry = (data: { rubric_id: number; label: string; scores: Record<string, number> }) =>
  client.post<GradeEntry>('/grades/entries', data).then(r => r.data)
export const deleteGradeEntry = (id: number) => client.delete(`/grades/entries/${id}`)
