import React from 'react';
import { Wallet, AlertTriangle, CheckCircle2, TrendingUp, PiggyBank, Edit3, ArrowRight } from 'lucide-react';
import { CategoryConfig, Expense, BudgetSettings } from '../../types/expense';
import { formatRupee } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface BudgetsViewProps {
  categories: CategoryConfig[];
  expenses: Expense[];
  budgetSettings: BudgetSettings;
  onOpenBudgetModal: () => void;
  onEditCategoryBudget: (category: CategoryConfig) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  expenses,
  budgetSettings,
  onOpenBudgetModal,
  onEditCategoryBudget,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Current month expenses
  const currentMonthExpenses = expenses.filter((ex) => {
    const [y, m] = ex.date.split('-').map(Number);
    return y === currentYear && m - 1 === currentMonth;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, ex) => sum + ex.amount, 0);
  const overallLimit = budgetSettings.overallMonthlyBudget || 1;
  const overallUsagePct = Math.round((totalSpent / overallLimit) * 100);
  const remainingBudget = overallLimit - totalSpent;

  // Category spending this month
  const categorySpentMap: Record<string, number> = {};
  currentMonthExpenses.forEach((ex) => {
    categorySpentMap[ex.category] = (categorySpentMap[ex.category] || 0) + ex.amount;
  });

  const isOverBudget = totalSpent > overallLimit;
  const isNearBudget = totalSpent >= overallLimit * 0.8 && !isOverBudget;

  const income = budgetSettings.monthlyIncome || 0;
  const savingsTarget = budgetSettings.savingsTarget || 0;
  const currentEstimatedSavings = income > 0 ? Math.max(0, income - totalSpent) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Budget & Target Management</h2>
          <p className="text-xs text-slate-500">
            Set and monitor overall monthly spending caps, category limits, and savings goals
          </p>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
        >
          <Edit3 size={14} />
          <span>Edit Budgets & Targets</span>
        </button>
      </div>

      {/* Main Budget Dashboard Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isOverBudget
                  ? 'bg-rose-50 text-rose-600'
                  : isNearBudget
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Wallet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monthly Overall Budget
                </span>
                {isOverBudget ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle size={12} /> EXCEEDED
                  </span>
                ) : isNearBudget ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle size={12} /> 80% WARNING
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 size={12} /> ON TRACK
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {formatRupee(totalSpent)}{' '}
                <span className="text-base font-normal text-slate-400">
                  / {formatRupee(overallLimit)}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 text-right md:border-l md:border-slate-100 md:pl-6">
            <div>
              <span className="text-xs text-slate-400 block">Remaining Balance</span>
              <span
                className={`text-xl font-bold tabular-nums ${
                  remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {remainingBudget < 0 ? `-${formatRupee(Math.abs(remainingBudget))}` : formatRupee(remainingBudget)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Budget Used</span>
              <span
                className={`text-xl font-bold tabular-nums ${
                  isOverBudget ? 'text-rose-600' : isNearBudget ? 'text-amber-600' : 'text-indigo-600'
                }`}
              >
                {overallUsagePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-rose-600' : isNearBudget ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(overallUsagePct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>₹0 spent</span>
            <span className="text-amber-500">80% threshold ({formatRupee(overallLimit * 0.8)})</span>
            <span>100% cap ({formatRupee(overallLimit)})</span>
          </div>
        </div>

        {/* Savings & Income Metric row */}
        {income > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3.5 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium">Monthly Income</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">{formatRupee(income)}</h4>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium">Savings Target</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatRupee(savingsTarget)}
              </h4>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <span className="text-[11px] text-emerald-800 font-medium">Current Projected Savings</span>
              <h4 className="text-base font-bold text-emerald-700 mt-0.5 tabular-nums">
                {formatRupee(currentEstimatedSavings)}
              </h4>
            </div>
          </div>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Category Budget Allocations</h3>
          <span className="text-xs text-slate-400">{categories.length} categories tracked</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const spent = categorySpentMap[cat.name] || 0;
            const cap = cat.budget || 0;
            const pct = cap > 0 ? Math.round((spent / cap) * 100) : 0;
            const isCatOver = cap > 0 && spent > cap;
            const isCatNear = cap > 0 && spent >= cap * 0.8 && !isCatOver;

            return (
              <div
                key={cat.id}
                className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <CategoryIcon name={cat.icon} size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={cat.name}>
                        {cat.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Cap: <strong className="text-slate-700">{cap > 0 ? formatRupee(cap) : 'Not configured'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{formatRupee(spent)}</span>
                    {cap > 0 && (
                      <span
                        className={`block text-[11px] font-semibold tabular-nums ${
                          isCatOver ? 'text-rose-600' : isCatNear ? 'text-amber-600' : 'text-slate-500'
                        }`}
                      >
                        {pct}% used
                      </span>
                    )}
                  </div>
                </div>

                {cap > 0 && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isCatOver ? 'bg-rose-500' : isCatNear ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Remaining: {formatRupee(Math.max(0, cap - spent))}</span>
                      {isCatOver && <span className="text-rose-600 font-bold">Exceeded by {formatRupee(spent - cap)}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
