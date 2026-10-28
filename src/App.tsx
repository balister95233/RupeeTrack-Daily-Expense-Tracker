import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  Expense,
  CategoryConfig,
  BudgetSettings,
} from './types/expense';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGET_SETTINGS,
  generateInitialSampleExpenses,
} from './utils/constants';
import { exportExpensesToCSV, formatRupee } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { DateWiseView } from './components/views/DateWiseView';
import { CategoriesView } from './components/views/CategoriesView';
import { BudgetsView } from './components/views/BudgetsView';
import { ReportsView } from './components/views/ReportsView';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { ExpenseDetailModal } from './components/modals/ExpenseDetailModal';
import { DeleteConfirmDialog } from './components/modals/DeleteConfirmDialog';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core State with LocalStorage Persistence
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem('rupeetrack_expenses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored expenses', e);
    }
    return generateInitialSampleExpenses();
  });

  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    try {
      const stored = localStorage.getItem('rupeetrack_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored categories', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(() => {
    try {
      const stored = localStorage.getItem('rupeetrack_budget_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.overallMonthlyBudget === 'number') return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored budget settings', e);
    }
    return DEFAULT_BUDGET_SETTINGS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('rupeetrack_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('rupeetrack_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('rupeetrack_budget_settings', JSON.stringify(budgetSettings));
  }, [budgetSettings]);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'warning' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Check budget limits and notify
  const checkBudgetThresholds = useCallback(
    (newExpenses: Expense[], addedOrEditedAmount?: number) => {
      const now = new Date();
      const currentMonthExpenses = newExpenses.filter((ex) => {
        const [y, m] = ex.date.split('-').map(Number);
        return y === now.getFullYear() && m - 1 === now.getMonth();
      });

      const currentMonthTotal = currentMonthExpenses.reduce((sum, ex) => sum + ex.amount, 0);
      const limit = budgetSettings.overallMonthlyBudget;

      if (limit > 0) {
        if (currentMonthTotal >= limit) {
          addToast(
            'warning',
            'Monthly Budget Exceeded!',
            `Current spending has reached ${formatRupee(currentMonthTotal)}, exceeding your limit of ${formatRupee(
              limit
            )}.`
          );
        } else if (currentMonthTotal >= limit * 0.8) {
          addToast(
            'warning',
            '80% Budget Warning',
            `You have utilized ${Math.round((currentMonthTotal / limit) * 100)}% of your monthly budget (${formatRupee(
              currentMonthTotal
            )} / ${formatRupee(limit)}).`
          );
        }
      }
    },
    [budgetSettings, addToast]
  );

  // Expense Handlers
  const handleSaveExpense = (data: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      // Edit
      setExpenses((prev) => {
        const next = prev.map((item) => (item.id === data.id ? { ...item, ...data } : item));
        checkBudgetThresholds(next, data.amount);
        return next;
      });
      addToast('success', 'Expense Updated', `Updated "${data.title}" for ${formatRupee(data.amount)}.`);
    } else {
      // Create new
      const newExpense: Expense = {
        ...data,
        id: 'tx-' + Date.now().toString(),
        createdAt: Date.now(),
      };
      setExpenses((prev) => {
        const next = [newExpense, ...prev];
        checkBudgetThresholds(next, data.amount);
        return next;
      });
      addToast('success', 'Expense Logged', `Recorded "${data.title}" for ${formatRupee(data.amount)}.`);
    }
  };

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleViewExpense = (expense: Expense) => {
    setViewingExpense(expense);
    setIsDetailModalOpen(true);
  };

  const handleDeleteExpenseClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!expenseToDelete) return;
    const title = expenseToDelete.title;
    const amount = expenseToDelete.amount;
    setExpenses((prev) => prev.filter((item) => item.id !== expenseToDelete.id));
    setExpenseToDelete(null);
    addToast('info', 'Expense Deleted', `Removed "${title}" (${formatRupee(amount)}).`);
  };

  const handleDeleteBatch = (ids: string[]) => {
    setExpenses((prev) => prev.filter((item) => !ids.includes(item.id)));
    addToast('info', 'Batch Deletion Complete', `Deleted ${ids.length} transactions from the ledger.`);
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: CategoryConfig) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (catData: { id?: string; name: string; icon: string; budget: number }) => {
    if (catData.id) {
      // Rename / update
      const oldCat = categories.find((c) => c.id === catData.id);
      setCategories((prev) =>
        prev.map((c) => (c.id === catData.id ? { ...c, ...catData } : c))
      );
      if (oldCat && oldCat.name !== catData.name) {
        // Update category name in existing transactions
        setExpenses((prev) =>
          prev.map((ex) => (ex.category === oldCat.name ? { ...ex, category: catData.name } : ex))
        );
      }
      addToast('success', 'Category Updated', `Updated "${catData.name}" settings.`);
    } else {
      // New custom category
      const newCat: CategoryConfig = {
        ...catData,
        id: 'cat-custom-' + Date.now().toString(),
        isCustom: true,
      };
      setCategories((prev) => [...prev, newCat]);
      addToast('success', 'Category Created', `Added new category "${catData.name}".`);
    }
  };

  const handleDeleteCategory = (cat: CategoryConfig) => {
    if (!cat.isCustom) {
      alert('Default categories cannot be deleted.');
      return;
    }
    if (confirm(`Delete custom category "${cat.name}"? Transactions in this category will remain.`)) {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      addToast('info', 'Category Removed', `Deleted category "${cat.name}".`);
    }
  };

  // Budget Handlers
  const handleSaveBudgetSettings = (newSettings: BudgetSettings) => {
    setBudgetSettings(newSettings);
    addToast(
      'success',
      'Monthly Budget Updated',
      `Overall monthly limit set to ${formatRupee(newSettings.overallMonthlyBudget)}.`
    );
  };

  const handleUpdateCategoryBudgets = (updatedMap: Record<string, number>) => {
    setCategories((prev) =>
      prev.map((c) => (updatedMap[c.id] !== undefined ? { ...c, budget: updatedMap[c.id] } : c))
    );
    addToast('success', 'Category Budgets Saved', 'Updated spending limits across categories.');
  };

  // Reset to default sample data
  const handleResetData = () => {
    if (confirm('Reset to initial sample data with 16 realistic transactions and default budgets?')) {
      const sample = generateInitialSampleExpenses();
      setExpenses(sample);
      setCategories(DEFAULT_CATEGORIES);
      setBudgetSettings(DEFAULT_BUDGET_SETTINGS);
      localStorage.removeItem('rupeetrack_expenses');
      localStorage.removeItem('rupeetrack_categories');
      localStorage.removeItem('rupeetrack_budget_settings');
      addToast('info', 'Data Reset', 'Restored initial sample data.');
    }
  };

  // Export full ledger CSV
  const handleExportFullCSV = () => {
    exportExpensesToCSV(expenses, `RupeeTrack_Full_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    addToast('success', 'Excel CSV Exported', `Saved ${expenses.length} records to spreadsheet.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddExpense={handleOpenAddExpense}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onResetData={handleResetData}
        onExportCSV={handleExportFullCSV}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            expenses={expenses}
            categories={categories}
            budgetSettings={budgetSettings}
            onOpenAddExpense={handleOpenAddExpense}
            onViewExpense={handleViewExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpenseClick}
            onNavigateToTransactions={() => setActiveTab('transactions')}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            expenses={expenses}
            categories={categories}
            onViewExpense={handleViewExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpenseClick}
            onDeleteBatch={handleDeleteBatch}
            onOpenAddExpense={handleOpenAddExpense}
          />
        )}

        {activeTab === 'date-wise' && (
          <DateWiseView
            expenses={expenses}
            categories={categories}
            onViewExpense={handleViewExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpenseClick}
            onOpenAddExpense={handleOpenAddExpense}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            expenses={expenses}
            onOpenAddCategory={handleOpenAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onViewCategoryTransactions={(catName) => {
              setActiveTab('transactions');
            }}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            categories={categories}
            expenses={expenses}
            budgetSettings={budgetSettings}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onEditCategoryBudget={handleEditCategory}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView expenses={expenses} categories={categories} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">RupeeTrack</span>
            <span>·</span>
            <span>Professional Daily Expense Tracker</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={handleResetData} className="hover:text-slate-900 transition underline">
              Reset Sample Data
            </button>
            <button onClick={handleExportFullCSV} className="hover:text-slate-900 transition underline">
              Download Full Ledger (.csv)
            </button>
            <span>Indian Rupee (₹) System</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        categories={categories}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        settings={budgetSettings}
        onSaveSettings={handleSaveBudgetSettings}
        categories={categories}
        onUpdateCategoryBudgets={handleUpdateCategoryBudgets}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        existingNames={categories.map((c) => c.name)}
      />

      <ExpenseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        expense={viewingExpense}
        categoryConfig={categories.find((c) => c.name === viewingExpense?.category)}
        onEdit={handleEditExpense}
        onDelete={(id: string) => {
          const ex = expenses.find((e) => e.id === id);
          if (ex) handleDeleteExpenseClick(ex);
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction?"
        description={`Are you sure you want to delete "${expenseToDelete?.title}"? This cannot be undone and will recalculate all category and monthly totals.`}
        amount={expenseToDelete?.amount}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
