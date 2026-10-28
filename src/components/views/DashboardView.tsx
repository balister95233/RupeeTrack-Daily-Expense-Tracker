import React from 'react';
import {
  Calendar,
  CalendarDays,
  Flame,
  ArrowRight,
  Plus,
  AlertTriangle,
  Receipt,
  TrendingUp,
  CreditCard,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Expense, CategoryConfig, BudgetSettings } from '../../types/expense';
import { formatRupee, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { MonthlyTrendChart } from '../charts/MonthlyTrendChart';
import { CategoryBreakdownChart, CATEGORY_PALETTE } from '../charts/CategoryBreakdownChart';

interface DashboardViewProps {
  expenses: Expense[];
  categories: CategoryConfig[];
  budgetSettings: BudgetSettings;
  onOpenAddExpense: () => void;
  onViewExpense: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onNavigateToTransactions: () => void;
  onOpenBudgetModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  categories,
  budgetSettings,
  onOpenAddExpense,
  onViewExpense,
  onEditExpense,
  onDeleteExpense,
  onNavigateToTransactions,
  onOpenBudgetModal,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
    2,
    '0'
  )}`;

  // Calculations
  let todayTotal = 0;
  let monthTotal = 0;
  let yearTotal = 0;
  const currentMonthCategoryTotals: Record<string, { amount: number; count: number }> = {};

  expenses.forEach((ex) => {
    const [y, m] = ex.date.split('-').map(Number);
    const exYear = y;
    const exMonth = m - 1;

    if (ex.date === todayStr) {
      todayTotal += ex.amount;
    }

    if (exYear === currentYear && exMonth === currentMonth) {
      monthTotal += ex.amount;
      if (!currentMonthCategoryTotals[ex.category]) {
        currentMonthCategoryTotals[ex.category] = { amount: 0, count: 0 };
      }
      currentMonthCategoryTotals[ex.category].amount += ex.amount;
      currentMonthCategoryTotals[ex.category].count += 1;
    }

    if (exYear === currentYear) {
      yearTotal += ex.amount;
    }
  });

  // Top Category this month
  let topCategoryName = 'None';
  let topCategoryAmount = 0;
  Object.entries(currentMonthCategoryTotals).forEach(([cat, data]) => {
    if (data.amount > topCategoryAmount) {
      topCategoryAmount = data.amount;
      topCategoryName = cat;
    }
  });

  const topCategoryShare =
    monthTotal > 0 ? ((topCategoryAmount / monthTotal) * 100).toFixed(1) : '0';

  // Budget calculations
  const monthlyLimit = budgetSettings.overallMonthlyBudget || 1;
  const budgetPercentage = Math.round((monthTotal / monthlyLimit) * 100);
  const remainingBudget = monthlyLimit - monthTotal;

  // Monthly trend chart data (last 6 months)
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const targetY = d.getFullYear();
    const targetM = d.getMonth();
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    const fullLabel = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const total = expenses
      .filter((ex) => {
        const [y, m] = ex.date.split('-').map(Number);
        return y === targetY && m - 1 === targetM;
      })
      .reduce((acc, ex) => acc + ex.amount, 0);

    trendData.push({ label, fullLabel, amount: total });
  }

  // Category breakdown data
  const categoryBreakdownList = Object.entries(currentMonthCategoryTotals)
    .map(([cat, data], idx) => ({
      category: cat,
      amount: data.amount,
      count: data.count,
      percentage: Number(((data.amount / (monthTotal || 1)) * 100).toFixed(1)),
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  // Recent transactions (last 5 sorted by date/creation)
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, 5);

  const getCategoryIconName = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.icon : 'Tag';
  };

  return (
    <div className="space-y-6">
      {/* Budget Status Alert / Banner */}
      {budgetPercentage >= 80 && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            budgetPercentage >= 100
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                budgetPercentage >= 100 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {budgetPercentage >= 100
                  ? `Monthly Budget Exceeded (${budgetPercentage}% used)`
                  : `Monthly Budget Warning (${budgetPercentage}% used)`}
              </h4>
              <p className="text-xs opacity-90 mt-0.5">
                {budgetPercentage >= 100
                  ? `You have spent ${formatRupee(monthTotal)}, which is ${formatRupee(
                      monthTotal - monthlyLimit
                    )} above your monthly limit of ${formatRupee(monthlyLimit)}.`
                  : `You have spent ${formatRupee(monthTotal)} of your ${formatRupee(
                      monthlyLimit
                    )} budget limit. Remaining: ${formatRupee(remainingBudget)}.`}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-current shadow-xs hover:bg-slate-50 transition shrink-0"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* Top Summary Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Expense</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{formatRupee(todayTotal)}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{formatDate(todayStr)}</span>
            </p>
          </div>
        </div>

        {/* Current Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarDays size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{formatRupee(monthTotal)}</h3>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>Budget: {formatRupee(monthlyLimit)}</span>
              <span className={`font-semibold tabular-nums ${budgetPercentage >= 100 ? 'text-rose-600' : 'text-slate-700'}`}>
                {budgetPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Current Year */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year {currentYear}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{formatRupee(yearTotal)}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Total Recorded: <span className="text-slate-700 font-semibold">{expenses.length} txns</span>
            </p>
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Category</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900 truncate" title={topCategoryName}>
              {topCategoryName}
            </h3>
            <p className="text-xs text-rose-600 font-semibold mt-1 tabular-nums">
              {formatRupee(topCategoryAmount)}{' '}
              <span className="text-slate-400 font-normal">({topCategoryShare}% this month)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend (2 Cols) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Spending Trend</h3>
              <p className="text-xs text-slate-500">Expenditure trend over the past 6 months</p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Current Year
            </span>
          </div>
          <MonthlyTrendChart data={trendData} height={230} />
        </div>

        {/* Category Breakdown (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Category Breakdown</h3>
              <p className="text-xs text-slate-500">Spending split for this month</p>
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <CategoryBreakdownChart items={categoryBreakdownList} totalAmount={monthTotal} />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your latest logged expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition shadow-xs"
            >
              <Plus size={14} /> Quick Add
            </button>
            <button
              onClick={onNavigateToTransactions}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No transactions found. Click "Add Expense" to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-5">Title & Notes</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Payment</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-900 max-w-[240px]">
                      <div className="truncate font-semibold">{ex.title}</div>
                      {ex.notes && <div className="text-[11px] text-slate-400 font-normal truncate">{ex.notes}</div>}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <CategoryIcon name={getCategoryIconName(ex.category)} size={13} />
                        </div>
                        <span className="text-slate-700 font-medium truncate max-w-[160px]">{ex.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">{formatDate(ex.date)}</td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {ex.payment}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatRupee(ex.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewExpense(ex)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onEditExpense(ex)}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(ex)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
