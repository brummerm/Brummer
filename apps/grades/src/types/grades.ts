export interface Rubric {
  id: number
  name: string
  subject: string
  description: string
  created_at: string
}

export interface RubricCriterion {
  id: number
  rubric_id: number
  name: string
  description: string
  max_points: number
  sort_order: number
}

export interface RubricWithCriteria extends Rubric {
  criteria: RubricCriterion[]
}

export interface GradeEntry {
  id: number
  rubric_id: number
  rubric_name: string
  label: string
  scores_json: string
  total_earned: number
  total_possible: number
  percentage: number
  letter_grade: string
  created_at: string
}
