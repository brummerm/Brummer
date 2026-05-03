import client from './client'

export interface IncomeItem {
  id: number
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

export interface MonthSnapshot {
  id: number
  month: string
  income: number
  total_expenses: number
  surplus: number
  savings_rate: number
  net_worth: number
  created_at: string
}

export interface ActualSpendingRow {
  id: number | null
  month: string
  category: string
  budgeted: number
  actual: number
}

export interface DebtAccount {
  id: number
  name: string
  account_type: string
  balance: number
  interest_rate: number
  minimum_payment: number
  extra_payment: number
  created_at: string
  updated_at: string
}

export interface BudgetSummary {
  total_income: number
  total_expenses: number
  surplus: number
  savings_rate: number
  expenses_by_category: Record<string, number>
  net_worth: number
}

// ── Income ────────────────────────────────────────────────────────────────────

export const getIncome = () =>
  client.get<IncomeItem[]>('/budget/income').then(r => r.data)
export const createIncome = (data: Omit<IncomeItem, 'id'>) =>
  client.post<IncomeItem>('/budget/income', data).then(r => r.data)
export const updateIncome = (id: number, data: Partial<Omit<IncomeItem, 'id'>>) =>
  client.put<IncomeItem>(`/budget/income/${id}`, data).then(r => r.data)
export const deleteIncome = (id: number) =>
  client.delete(`/budget/income/${id}`)

// ── Expenses ──────────────────────────────────────────────────────────────────

export const getExpenses = () =>
  client.get<ExpenseItem[]>('/budget/expenses').then(r => r.data)
export const createExpense = (data: Omit<ExpenseItem, 'id'>) =>
  client.post<ExpenseItem>('/budget/expenses', data).then(r => r.data)
export const updateExpense = (id: number, data: Partial<Omit<ExpenseItem, 'id'>>) =>
  client.put<ExpenseItem>(`/budget/expenses/${id}`, data).then(r => r.data)
export const deleteExpense = (id: number) =>
  client.delete(`/budget/expenses/${id}`)

// ── Surplus Allocations ───────────────────────────────────────────────────────

export const getAllocations = () =>
  client.get<SurplusAllocation[]>('/budget/allocations').then(r => r.data)
export const createAllocation = (data: Omit<SurplusAllocation, 'id'>) =>
  client.post<SurplusAllocation>('/budget/allocations', data).then(r => r.data)
export const updateAllocation = (id: number, data: Partial<Omit<SurplusAllocation, 'id'>>) =>
  client.put<SurplusAllocation>(`/budget/allocations/${id}`, data).then(r => r.data)
export const deleteAllocation = (id: number) =>
  client.delete(`/budget/allocations/${id}`)

// ── Retirement ────────────────────────────────────────────────────────────────

export const getRetirement = () =>
  client.get<RetirementEntry[]>('/budget/retirement').then(r => r.data)
export const createRetirement = (data: Omit<RetirementEntry, 'id' | 'created_at'>) =>
  client.post<RetirementEntry>('/budget/retirement', data).then(r => r.data)
export const deleteRetirement = (id: number) =>
  client.delete(`/budget/retirement/${id}`)

// ── Month Snapshots ───────────────────────────────────────────────────────────

export const getSnapshots = () =>
  client.get<MonthSnapshot[]>('/budget/snapshots').then(r => r.data)
export const saveSnapshot = (month: string) =>
  client.post<MonthSnapshot>(`/budget/snapshots/${month}`).then(r => r.data)
export const deleteSnapshot = (id: number) =>
  client.delete(`/budget/snapshots/${id}`)

// ── Actual Spending ───────────────────────────────────────────────────────────

export const getActuals = (month: string) =>
  client.get<ActualSpendingRow[]>(`/budget/actuals/${month}`).then(r => r.data)
export const saveActuals = (month: string, items: { category: string; budgeted: number; actual: number }[]) =>
  client.post('/budget/actuals', { month, items }).then(r => r.data)

// ── Debt Accounts ─────────────────────────────────────────────────────────────

export const getDebts = () =>
  client.get<DebtAccount[]>('/budget/debt').then(r => r.data)
export const createDebt = (data: Omit<DebtAccount, 'id' | 'created_at' | 'updated_at'>) =>
  client.post<DebtAccount>('/budget/debt', data).then(r => r.data)
export const updateDebt = (id: number, data: Partial<Omit<DebtAccount, 'id' | 'created_at' | 'updated_at'>>) =>
  client.put<DebtAccount>(`/budget/debt/${id}`, data).then(r => r.data)
export const deleteDebt = (id: number) =>
  client.delete(`/budget/debt/${id}`)

// ── Summary ───────────────────────────────────────────────────────────────────

export const getSummary = () =>
  client.get<BudgetSummary>('/budget/summary').then(r => r.data)
