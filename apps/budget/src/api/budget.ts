import client from './client'

export interface IncomeItem {
  id: number
  person: string
  label: string
  amount: number
  sort_order: number
}

export interface ExpenseItem {
  id: number
  category: string
  label: string
  amount: number
  sort_order: number
}

export interface SurplusAllocation {
  id: number
  label: string
  percentage: number
  sort_order: number
}

export interface RetirementEntry {
  id: number
  account_name: string
  balance: number
  recorded_date: string
  created_at: string
}

export interface BudgetSummary {
  matthew_income: number
  alyssa_income: number
  combined_income: number
  shared_expenses: number
  matthew_expenses: number
  alyssa_expenses: number
  total_expenses: number
  surplus: number
  savings_rate: number
}

// ── Income ────────────────────────────────────────────────────────────────────

export const getIncome = () =>
  client.get<IncomeItem[]>('/budget/income').then((r) => r.data)

export const createIncome = (data: Omit<IncomeItem, 'id'>) =>
  client.post<IncomeItem>('/budget/income', data).then((r) => r.data)

export const updateIncome = (id: number, data: Partial<Omit<IncomeItem, 'id'>>) =>
  client.put<IncomeItem>(`/budget/income/${id}`, data).then((r) => r.data)

export const deleteIncome = (id: number) =>
  client.delete(`/budget/income/${id}`)

// ── Expenses ──────────────────────────────────────────────────────────────────

export const getExpenses = () =>
  client.get<ExpenseItem[]>('/budget/expenses').then((r) => r.data)

export const createExpense = (data: Omit<ExpenseItem, 'id'>) =>
  client.post<ExpenseItem>('/budget/expenses', data).then((r) => r.data)

export const updateExpense = (id: number, data: Partial<Omit<ExpenseItem, 'id'>>) =>
  client.put<ExpenseItem>(`/budget/expenses/${id}`, data).then((r) => r.data)

export const deleteExpense = (id: number) =>
  client.delete(`/budget/expenses/${id}`)

// ── Surplus Allocations ───────────────────────────────────────────────────────

export const getAllocations = () =>
  client.get<SurplusAllocation[]>('/budget/allocations').then((r) => r.data)

export const updateAllocation = (id: number, data: Partial<Omit<SurplusAllocation, 'id'>>) =>
  client.put<SurplusAllocation>(`/budget/allocations/${id}`, data).then((r) => r.data)

// ── Retirement ────────────────────────────────────────────────────────────────

export const getRetirement = () =>
  client.get<RetirementEntry[]>('/budget/retirement').then((r) => r.data)

export const createRetirement = (data: Omit<RetirementEntry, 'id' | 'created_at'>) =>
  client.post<RetirementEntry>('/budget/retirement', data).then((r) => r.data)

export const deleteRetirement = (id: number) =>
  client.delete(`/budget/retirement/${id}`)

// ── Summary ───────────────────────────────────────────────────────────────────

export const getSummary = () =>
  client.get<BudgetSummary>('/budget/summary').then((r) => r.data)
