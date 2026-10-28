export type PaymentMethod = 'Cash' | 'UPI' | 'Debit Card' | 'Credit Card' | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  payment: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  budget: number;
  isCustom?: boolean;
}

export interface BudgetSettings {
  overallMonthlyBudget: number;
  monthlyIncome?: number;
  savingsTarget?: number;
}

export type DateFilterPreset =
  | 'today'
  | 'yesterday'
  | 'specific-date'
  | 'this-week'
  | 'this-month'
  | 'prev-month'
  | 'custom'
  | 'this-year'
  | 'all';

export type SortMode = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export type ActiveTab = 'dashboard' | 'transactions' | 'date-wise' | 'categories' | 'budgets' | 'reports';
