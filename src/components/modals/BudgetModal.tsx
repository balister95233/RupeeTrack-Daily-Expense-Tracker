import React, { useState } from 'react';
import { X, IndianRupee, Wallet } from 'lucide-react';
import { BudgetSettings, CategoryConfig } from '../../types/expense';
import { formatRupee } from '../../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BudgetSettings;
  onSaveSettings: (settings: BudgetSettings) => void;
  categories: CategoryConfig[];
  onUpdateCategoryBudgets: (updatedBudgets: Record<string, number>) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  categories,
  onUpdateCategoryBudgets,
}) => {
  const [overallBudget, setOverallBudget] = useState(settings.overallMonthlyBudget.toString());
  const [income, setIncome] = useState((settings.monthlyIncome || '').toString());
  const [savingsTarget, setSavingsTarget] = useState((settings.savingsTarget || '').toString());
  const [activeTab, setActiveTab] = useState<'overall' | 'categories'>('overall');

  // Category budgets state
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    categories.forEach((c) => {
      initial[c.id] = (c.budget || 0).toString();
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleOverallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(overallBudget);
    const parsedIncome = parseFloat(income);
    const parsedSavings = parseFloat(savingsTarget);

    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      alert('Please enter a valid monthly budget amount greater than 0.');
      return;
    }

    onSaveSettings({
      overallMonthlyBudget: parsedBudget,
      monthlyIncome: isNaN(parsedIncome) ? undefined : parsedIncome,
      savingsTarget: isNaN(parsedSavings) ? undefined : parsedSavings,
    });

    onClose();
  };

  const handleCategoryBudgetsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Record<string, number> = {};
    Object.entries(categoryBudgets).forEach(([id, val]) => {
      const num = parseFloat(val);
      updated[id] = isNaN(num) || num < 0 ? 0 : num;
    });
    onUpdateCategoryBudgets(updated);
    onClose();
  };

  const totalAllocated = Object.values(categoryBudgets).reduce((sum, val) => {
    const n = parseFloat(val);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Budget & Target Settings</h3>
              <p className="text-xs text-slate-500">Configure overall and category-level spending limits</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch between Overall and Categories */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 bg-white flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overall')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'overall' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overall Monthly Budget
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'categories' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Category Budgets ({categories.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'overall' ? (
            <form onSubmit={handleOverallSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Monthly Overall Spending Limit (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee size={16} />
                  </div>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    required
                    value={overallBudget}
                    onChange={(e) => setOverallBudget(e.target.value)}
                    placeholder="50000"
                    className="w-full pl-9 pr-3.5 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none tabular-nums"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  You will receive an automated warning when spending crosses 80% and an alert when exceeded.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Monthly Expected Income (₹) <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <IndianRupee size={15} />
                    </div>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="85000"
                      className="w-full pl-9 pr-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Monthly Savings Target (₹) <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <IndianRupee size={15} />
                    </div>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={savingsTarget}
                      onChange={(e) => setSavingsTarget(e.target.value)}
                      placeholder="25000"
                      className="w-full pl-9 pr-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Planned Budget:</span>
                  <span className="font-semibold text-slate-900">{formatRupee(parseFloat(overallBudget) || 0)}</span>
                </div>
                {parseFloat(income) > 0 && (
                  <div className="flex justify-between">
                    <span>Est. Savings Potential:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatRupee(Math.max(0, (parseFloat(income) || 0) - (parseFloat(overallBudget) || 0)))}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
                >
                  Save Budget Settings
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCategoryBudgetsSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Configure target monthly caps per category</span>
                <span>
                  Total Category Allocation:{' '}
                  <strong className="text-slate-900 font-mono">{formatRupee(totalAllocated)}</strong>
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <span className="text-xs font-medium text-slate-800 truncate flex-1">{cat.name}</span>
                    <div className="relative w-36 shrink-0">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={categoryBudgets[cat.id] ?? ''}
                        onChange={(e) =>
                          setCategoryBudgets((prev) => ({
                            ...prev,
                            [cat.id]: e.target.value,
                          }))
                        }
                        className="w-full pl-6 pr-2.5 py-1 text-xs font-semibold text-right text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none tabular-nums"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
                >
                  Save Category Budgets
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
