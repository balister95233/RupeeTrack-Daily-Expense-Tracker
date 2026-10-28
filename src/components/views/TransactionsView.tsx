import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  Plus,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';
import { Expense, CategoryConfig, PaymentMethod, SortMode, DateFilterPreset } from '../../types/expense';
import { formatRupee, formatDate, exportExpensesToCSV } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { PAYMENT_METHODS } from '../../utils/constants';

interface TransactionsViewProps {
  expenses: Expense[];
  categories: CategoryConfig[];
  onViewExpense: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onDeleteBatch: (ids: string[]) => void;
  onOpenAddExpense: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  expenses,
  categories,
  onViewExpense,
  onEditExpense,
  onDeleteExpense,
  onDeleteBatch,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilterPreset, setDateFilterPreset] = useState<DateFilterPreset>('all');
  const [sortMode, setSortMode] = useState<SortMode>('date-desc');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(
      yest.getDate()
    ).padStart(2, '0')}`;

    const searchLower = searchTerm.toLowerCase().trim();

    return expenses
      .filter((ex) => {
        // Search
        if (searchLower) {
          const matchTitle = ex.title.toLowerCase().includes(searchLower);
          const matchNotes = ex.notes ? ex.notes.toLowerCase().includes(searchLower) : false;
          const matchCat = ex.category.toLowerCase().includes(searchLower);
          if (!matchTitle && !matchNotes && !matchCat) return false;
        }

        // Category filter
        if (categoryFilter && ex.category !== categoryFilter) return false;

        // Payment method filter
        if (paymentFilter && ex.payment !== paymentFilter) return false;

        // Date preset filter
        if (dateFilterPreset === 'today' && ex.date !== todayStr) return false;
        if (dateFilterPreset === 'yesterday' && ex.date !== yestStr) return false;

        const [y, m] = ex.date.split('-').map(Number);
        if (dateFilterPreset === 'this-month') {
          if (y !== now.getFullYear() || m - 1 !== now.getMonth()) return false;
        }
        if (dateFilterPreset === 'prev-month') {
          const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (y !== prevMonth.getFullYear() || m - 1 !== prevMonth.getMonth()) return false;
        }
        if (dateFilterPreset === 'this-year') {
          if (y !== now.getFullYear()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortMode === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortMode === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortMode === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortMode === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, searchTerm, categoryFilter, paymentFilter, dateFilterPreset, sortMode]);

  // Total amount of matching transactions
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, ex) => sum + ex.amount, 0);
  }, [filteredExpenses]);

  // Selection handlers
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const isAllSelected = filteredExpenses.length > 0 && selectedCount === filteredExpenses.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds({});
    } else {
      const all: Record<string, boolean> = {};
      filteredExpenses.forEach((ex) => {
        all[ex.id] = true;
      });
      setSelectedIds(all);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExportSelectedOrAll = () => {
    const listToExport =
      selectedCount > 0 ? filteredExpenses.filter((ex) => selectedIds[ex.id]) : filteredExpenses;
    exportExpensesToCSV(listToExport, `RupeeTrack_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDeleteSelected = () => {
    const idsToDelete = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    if (idsToDelete.length === 0) return;
    if (confirm(`Are you sure you want to delete ${idsToDelete.length} selected transaction(s)?`)) {
      onDeleteBatch(idsToDelete);
      setSelectedIds({});
    }
  };

  const getCategoryIconName = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.icon : 'Tag';
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Transaction Ledger</h2>
            <p className="text-xs text-slate-500">
              Search, filter by category or payment, and manage all your expense records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportSelectedOrAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Download Excel-compatible CSV"
            >
              <Download size={14} className="text-emerald-600" />
              <span>{selectedCount > 0 ? `Export (${selectedCount})` : 'Export CSV'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition no-print"
              title="Print transaction sheet"
            >
              <Printer size={14} className="text-indigo-600" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
            >
              <Plus size={15} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, notes, category..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none transition"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none transition"
            >
              <option value="">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Date Presets */}
          <div>
            <select
              value={dateFilterPreset}
              onChange={(e) => setDateFilterPreset(e.target.value as DateFilterPreset)}
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none transition"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="yesterday">Yesterday</option>
              <option value="this-month">This Month</option>
              <option value="prev-month">Previous Month</option>
              <option value="this-year">This Year</option>
            </select>
          </div>

          {/* Sort Mode */}
          <div>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none transition"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Status Strip & Batch Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Showing <strong className="text-slate-800">{filteredExpenses.length}</strong> of{' '}
              <strong className="text-slate-800">{expenses.length}</strong> entries
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Filtered Total:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">{formatRupee(totalAmount)}</strong>
            </span>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">{selectedCount} selected</span>
              <button
                onClick={handleDeleteSelected}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <p className="font-semibold text-slate-700">No matching transactions found.</p>
            <p>Try clearing your search query or reset filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-indigo-600 transition"
                    >
                      {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="py-3 px-4">Title / Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((ex) => {
                  const isChecked = !!selectedIds[ex.id];
                  return (
                    <tr
                      key={ex.id}
                      className={`hover:bg-slate-50/70 transition-colors ${isChecked ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelect(ex.id)}
                          className="text-slate-400 hover:text-indigo-600 transition"
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-indigo-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[260px]">
                        <div className="truncate font-semibold text-slate-800">{ex.title}</div>
                        {ex.notes && (
                          <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">{ex.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <CategoryIcon name={getCategoryIconName(ex.category)} size={13} />
                          </div>
                          <span className="text-slate-700 font-medium truncate max-w-[170px]">{ex.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(ex.date)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {ex.payment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatRupee(ex.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
