import { Expense } from '../types/expense';

/**
 * Format an amount in Indian Rupees (₹) with standard Indian numbering system
 * (e.g. ₹1,200, ₹95,000, ₹1,25,000)
 */
export function formatRupee(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format raw number with Indian commas without the symbol
 */
export function formatNumberIN(num: number): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format date string (YYYY-MM-DD) into readable format: "28 Oct 2026"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date with Day of the Week: "Tuesday, 28 Oct 2026"
 */
export function formatDateWithDay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Check if a date string is Today
 */
export function isToday(dateStr: string): boolean {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;
  return dateStr === todayStr;
}

/**
 * Check if a date string is Yesterday
 */
export function isYesterday(dateStr: string): boolean {
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(
    yest.getDate()
  ).padStart(2, '0')}`;
  return dateStr === yestStr;
}

/**
 * Get Month Name & Year, e.g. "October 2026"
 */
export function getMonthYearLabel(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/**
 * Export expenses list to Excel-ready CSV with UTF-8 BOM
 */
export function exportExpensesToCSV(expenses: Expense[], fileName: string = 'RupeeTrack_Expenses.csv'): void {
  const headers = ['Transaction ID', 'Title', 'Amount (INR)', 'Category', 'Date', 'Payment Method', 'Notes'];
  
  const rows = expenses.map((ex) => [
    ex.id,
    `"${(ex.title || '').replace(/"/g, '""')}"`,
    ex.amount,
    `"${(ex.category || '').replace(/"/g, '""')}"`,
    ex.date,
    ex.payment,
    `"${(ex.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
