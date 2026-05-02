import { startOfWeek, addWeeks, subWeeks, format, addDays, endOfMonth, addMonths, subMonths, isSameMonth } from 'date-fns'

const WEEK_START_DAY = 1 // Monday

export function toWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: WEEK_START_DAY })
}

export function weekStartStr(date: Date): string {
  return format(toWeekStart(date), 'yyyy-MM-dd')
}

export function currentWeekStart(): string {
  return weekStartStr(new Date())
}

export function nextWeekStart(weekStart: string): string {
  return weekStartStr(addWeeks(new Date(weekStart + 'T00:00:00'), 1))
}

export function prevWeekStart(weekStart: string): string {
  return weekStartStr(subWeeks(new Date(weekStart + 'T00:00:00'), 1))
}

export function weekLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00')
  const end = addDays(start, 6)
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}

export function dayDate(weekStart: string, dayOfWeek: number): Date {
  return addDays(new Date(weekStart + 'T00:00:00'), dayOfWeek)
}

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Month utilities ──────────────────────────────────────────────────────────

/** Current month as "yyyy-MM" */
export function currentMonthStr(): string {
  return format(new Date(), 'yyyy-MM')
}

/** "yyyy-MM" → "February 2026" */
export function monthLabel(monthStr: string): string {
  return format(new Date(monthStr + '-01T00:00:00'), 'MMMM yyyy')
}

/** Advance one month */
export function nextMonthStr(monthStr: string): string {
  return format(addMonths(new Date(monthStr + '-01T00:00:00'), 1), 'yyyy-MM')
}

/** Go back one month */
export function prevMonthStr(monthStr: string): string {
  return format(subMonths(new Date(monthStr + '-01T00:00:00'), 1), 'yyyy-MM')
}

/**
 * Returns all Monday ISO date strings for weeks that overlap the given month.
 * e.g. "2026-02" → ["2026-01-26", "2026-02-02", ..., "2026-02-23"]
 */
export function getMonthWeekStarts(monthStr: string): string[] {
  const first = new Date(monthStr + '-01T00:00:00')
  const monthEnd = endOfMonth(first)
  const firstMonday = startOfWeek(first, { weekStartsOn: 1 })
  const result: string[] = []
  let cur = firstMonday
  while (cur <= monthEnd) {
    result.push(format(cur, 'yyyy-MM-dd'))
    cur = addWeeks(cur, 1)
  }
  return result
}

/**
 * Returns all Date objects needed to fill a Mon–Sun calendar grid for the month.
 * Includes leading/trailing days from adjacent months to complete the rows.
 */
export function getMonthCalendarDays(monthStr: string): Date[] {
  const first = new Date(monthStr + '-01T00:00:00')
  const gridStart = startOfWeek(first, { weekStartsOn: 1 })
  // Always render 6 rows (42 cells) for a stable grid height
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i))
  }
  return days
}

/** True if the date is in the given "yyyy-MM" month */
export function isInMonth(date: Date, monthStr: string): boolean {
  return isSameMonth(date, new Date(monthStr + '-01T00:00:00'))
}

/** Derive "yyyy-MM" from a week start ISO date */
export function monthStrFromWeekStart(weekStart: string): string {
  // Use the Thursday of that week to determine the month (avoids edge-week ambiguity)
  const thursday = addDays(new Date(weekStart + 'T00:00:00'), 3)
  return format(thursday, 'yyyy-MM')
}
