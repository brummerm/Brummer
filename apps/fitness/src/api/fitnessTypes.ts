export interface ExerciseSetCreate {
  exercise_name: string
  sets?: number | null
  reps?: string | null
  weight?: string | null
  notes?: string | null
  sort_order?: number
}

export interface RunEntryCreate {
  distance_miles?: number | null
  duration_minutes?: number | null
  notes?: string | null
}
