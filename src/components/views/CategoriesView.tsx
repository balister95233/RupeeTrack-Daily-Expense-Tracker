import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { Expense, CategoryConfig, DateFilterPreset } from '../../types/expense';
import { formatRupee } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface CategoriesViewProps {
  categories: CategoryConfig[];
  expenses: Expense[];
  onOpenAddCategory: () => void;
  onEditCategory: (category: CategoryConfig) => void;
  onDeleteCategory: (category: CategoryConfig) => void;
  onViewCategoryTransactions: (categoryName: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  expenses,
  onOpenAddCategory,
  onEditCategory,
  onDeleteCategory,
  onViewCategoryTransactions,
}) => {
  const [periodPreset, setPeriodPreset] = useState<'this-month' | 'prev-month' | 'this-year' | 'all'>('this-month');

  // Filter expenses by period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((ex) => {
      const [year, month] = ex.date.split('-').map(Number);
      if (periodPreset === 'this-month') {
        return year === now.getFullYear() && month - 1 === now.getMonth();
      }
      if (periodPreset === 'prev-month') {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return year === prev.getFullYear() && month - 1 === prev.getMonth();
      }
      if (periodPreset === 'this-year') {
        return year === now.getFullYear();
      }
      return true;
    });
  }, [expenses, periodPreset]);

  // Overall total for the selected period
  const totalPeriodAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, ex) => sum + ex.amount, 0);
  }, [filteredExpenses]);

  // Calculate per-category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number; percentage: number }> = {};

    categories.forEach((cat) => {
      stats[cat.name] = { total: 0, count: 0, percentage: 0 };
    });

    filteredExpenses.forEach((ex) => {
      if (!stats[ex.category]) {
        stats[ex.category] = { total: 0, count: 0, percentage: 0 };
      }
      stats[ex.category].total += ex.amount;
      stats[ex.category].count += 1;
    });

    // Compute percentages
    Object.keys(stats).forEach((name) => {
      stats[name].percentage =
        totalPeriodAmount > 0 ? Number(((stats[name].total / totalPeriodAmount) * 100).toFixed(1)) : 0;
    });

    return stats;
  }, [categories, filteredExpenses, totalPeriodAmount]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Categories & Spending Distribution</h2>
            <p className="text-xs text-slate-500">
              Track total expenditure, transaction counts, and budget utilization per category
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddCategory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
            >
              <Plus size={15} />
              <span>Add Custom Category</span>
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'this-month', label: 'This Month' },
              { id: 'prev-month', label: 'Previous Month' },
              { id: 'this-year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodPreset(p.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  periodPreset === p.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>Overall Selected Total:</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              {formatRupee(totalPeriodAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Categories Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, index) => {
          const stats = categoryStats[cat.name] || { total: 0, count: 0, percentage: 0 };
          const budget = cat.budget || 0;
          const budgetUsage = budget > 0 ? Math.round((stats.total / budget) * 100) : 0;
          const isOverBudget = budget > 0 && stats.total > budget;
          const isNearBudget = budget > 0 && stats.total >= budget * 0.8 && !isOverBudget;

          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all group"
            >
              <div>
                {/* Header with icon & actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <CategoryIcon name={cat.icon} size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        #{index + 1} {cat.isCustom ? '· Custom' : ''}
                      </span>
                      <h3
                        onClick={() => onViewCategoryTransactions(cat.name)}
                        className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition line-clamp-1"
                        title={cat.name}
                      >
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onEditCategory(cat)}
                      title="Edit Category or Budget"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit2 size={13} />
                    </button>
                    {cat.isCustom && (
                      <button
                        onClick={() => onDeleteCategory(cat)}
                        title="Delete Custom Category"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expenditure metrics */}
                <div className="flex items-baseline justify-between mt-4">
                  <div>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {formatRupee(stats.total)}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {stats.count} {stats.count === 1 ? 'transaction' : 'transactions'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tabular-nums">
                      {stats.percentage}% of total
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget Bar and Indicators */}
              <div className="pt-4 mt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Monthly Cap: {budget > 0 ? formatRupee(budget) : 'Not set'}
                  </span>
                  {budget > 0 && (
                    <span
                      className={`font-semibold tabular-nums text-[11px] ${
                        isOverBudget
                          ? 'text-rose-600 font-bold'
                          : isNearBudget
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {budgetUsage}% used
                    </span>
                  )}
                </div>

                {budget > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isOverBudget ? 'bg-rose-500' : isNearBudget ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
