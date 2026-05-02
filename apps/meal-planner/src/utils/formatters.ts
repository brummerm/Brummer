export function imageUrl(filename?: string | null): string {
  if (!filename) return ''
  return `/images/${filename}`
}

export function formatTime(mins?: number | null): string {
  if (!mins) return ''
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function totalTime(prep?: number | null, cook?: number | null): string {
  const total = (prep ?? 0) + (cook ?? 0)
  return formatTime(total)
}

export const SLOT_TYPE_LABELS: Record<string, string> = {
  recipe: 'Recipe',
  leftovers: 'Leftovers',
  going_out: 'Going Out',
  empty: 'Empty',
}

export const SLOT_TYPE_COLORS: Record<string, string> = {
  recipe: 'bg-brand-100 text-brand-800',
  leftovers: 'bg-blue-100 text-blue-800',
  going_out: 'bg-purple-100 text-purple-800',
  empty: 'bg-gray-100 text-gray-500',
}
