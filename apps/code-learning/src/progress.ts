const KEY = 'code-learning-progress'

type Progress = Record<string, string[]>  // { languageId: lessonId[] }

function load(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Progress
  } catch {
    return {}
  }
}

export function isCompleted(languageId: string, lessonId: string): boolean {
  return load()[languageId]?.includes(lessonId) ?? false
}

export function markComplete(languageId: string, lessonId: string): void {
  const p = load()
  if (!p[languageId]) p[languageId] = []
  if (!p[languageId].includes(lessonId)) p[languageId].push(lessonId)
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function getCompletedCount(languageId: string): number {
  return load()[languageId]?.length ?? 0
}

export function resetLanguage(languageId: string): void {
  const p = load()
  delete p[languageId]
  localStorage.setItem(KEY, JSON.stringify(p))
}
