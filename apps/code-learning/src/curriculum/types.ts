export type RuntimeType = 'javascript' | 'html' | 'python' | 'static'

export interface Lesson {
  id: string
  title: string
  content: string   // HTML string
  starterCode: string
  expectedOutput?: string
  hint?: string
}

export interface Language {
  id: string
  name: string
  icon: string
  color: string       // Tailwind bg class
  textColor: string   // Tailwind text class
  runtime: RuntimeType
  description: string
  lessons: Lesson[]
}
