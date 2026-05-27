export interface HiscoresSkill {
  name: string
  rank: number
  level: number
  xp: number
}

export interface HiscoresData {
  username: string
  skills: HiscoresSkill[]
}

export type ClickIntensity = 'ultra-low' | 'low' | 'medium' | 'high'
export type Phase = 1 | 2 | 3 | 4 | 5 | 6

export interface TrainingMethod {
  label: string
  xpPerHour: number
  clickIntensity: ClickIntensity
  notes: string
}

export interface SkillGuide {
  skill: string           // matches HiscoresSkill.name
  icon: string
  phase: Phase
  alreadyMaxed: boolean
  estimatedHoursTotal: number
  gpNet: number           // GP in thousands (negative = cost, positive = profit)
  methods: TrainingMethod[]
  tips: string
}

export interface DailyTask {
  id: string
  label: string
  category: 'morning' | 'evening' | 'weekly'
  detail: string
  xpGain?: string
}

export interface PhaseData {
  phase: Phase
  title: string
  subtitle: string
  skills: string[]
  estimatedHours: number
  gpDelta: number   // thousands GP, net
  notes: string
}
