export interface PlanDay {
  day_index: number
  week: number
  day_of_week: string
  label: string
  focus: string
  day_type: 'lift' | 'run' | 'rest' | 'test'
  strength: string
  run: string
  mental_recovery: string
}

export interface ExerciseSet {
  id: number
  exercise_name: string
  sets: number | null
  reps: string | null
  weight: string | null
  notes: string | null
  sort_order: number
}

export interface RunEntry {
  id: number
  distance_miles: number | null
  duration_minutes: number | null
  notes: string | null
}

export interface WorkoutLog {
  id: number
  plan_day_index: number
  logged_date: string
  notes: string | null
  exercises: ExerciseSet[]
  run: RunEntry | null
  created_at: string
}

export interface PlanConfig {
  id: number
  start_date: string
}
