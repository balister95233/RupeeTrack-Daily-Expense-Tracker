import React, { useState } from 'react';
import { Plus, Menu, X, Wallet, Download, RefreshCw } from 'lucide-react';
import { ActiveTab } from '../types/expense';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
  onOpenBudgetModal: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  onOpenBudgetModal,
  onResetData,
  onExportCSV,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'date-wise', label: 'Date-Wise' },
    { id: 'categories', label: 'Categories' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              ₹
            </div>
            <button
              onClick={() => onTabChange('dashboard')}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-indigo-600 transition"
            >
              RupeeTrack
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBudgetModal}
              title="Set Monthly Budgets"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              <Wallet size={14} className="text-indigo-600" />
              <span>Budgets</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Add Expense</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top duration-150 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-between ${
                activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {activeTab === item.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenBudgetModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Wallet size={14} className="text-indigo-600" /> Manage Budget
            </button>
            <button
              onClick={() => {
                onExportCSV();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Download size={14} className="text-emerald-600" /> Export Excel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
