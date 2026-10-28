import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CalendarDays,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Expense, CategoryConfig, DateFilterPreset } from '../../types/expense';
import { formatRupee, formatDate, formatDateWithDay, isToday, isYesterday, getMonthYearLabel } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface DateWiseViewProps {
  expenses: Expense[];
  categories: CategoryConfig[];
  onViewExpense: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onOpenAddExpense: () => void;
}

export const DateWiseView: React.FC<DateWiseViewProps> = ({
  expenses,
  categories,
  onViewExpense,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
}) => {
  const [filterPreset, setFilterPreset] = useState<DateFilterPreset>('this-month');
  const [specificDate, setSpecificDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [groupingMode, setGroupingMode] = useState<'day' | 'month'>('day');

  // Accordion state: set of open date strings
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Available years from expenses
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(new Date().getFullYear());
    expenses.forEach((ex) => {
      const y = parseInt(ex.date.split('-')[0], 10);
      if (!isNaN(y)) yearsSet.add(y);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [expenses]);

  // Filter expenses based on selected preset
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

    return expenses.filter((ex) => {
      const [year, month, day] = ex.date.split('-').map(Number);
      const exDate = new Date(year, month - 1, day);

      switch (filterPreset) {
        case 'today':
          return ex.date === todayStr;

        case 'yesterday':
          return ex.date === yestStr;

        case 'specific-date':
          return ex.date === specificDate;

        case 'this-week': {
          // Sunday to Saturday of current week
          const firstDay = new Date(now);
          firstDay.setDate(now.getDate() - now.getDay());
          firstDay.setHours(0, 0, 0, 0);
          const lastDay = new Date(firstDay);
          lastDay.setDate(firstDay.getDate() + 6);
          lastDay.setHours(23, 59, 59, 999);
          return exDate >= firstDay && exDate <= lastDay;
        }

        case 'this-month':
          return year === now.getFullYear() && month - 1 === now.getMonth();

        case 'prev-month': {
          const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return year === prevMonthDate.getFullYear() && month - 1 === prevMonthDate.getMonth();
        }

        case 'this-year':
          return year === selectedYear;

        case 'custom':
          return ex.date >= customStartDate && ex.date <= customEndDate;

        case 'all':
        default:
          return true;
      }
    });
  }, [expenses, filterPreset, specificDate, customStartDate, customEndDate, selectedYear]);

  // Total amount for filtered period
  const totalPeriodAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, ex) => sum + ex.amount, 0);
  }, [filteredExpenses]);

  // Group by day
  const dayGroups = useMemo(() => {
    const map: Record<string, { date: string; total: number; items: Expense[] }> = {};

    filteredExpenses.forEach((ex) => {
      if (!map[ex.date]) {
        map[ex.date] = { date: ex.date, total: 0, items: [] };
      }
      map[ex.date].total += ex.amount;
      map[ex.date].items.push(ex);
    });

    // Sort days descending
    return Object.values(map).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredExpenses]);

  // Group by month
  const monthGroups = useMemo(() => {
    const map: Record<string, { key: string; year: number; month: number; total: number; items: Expense[] }> = {};

    filteredExpenses.forEach((ex) => {
      const [year, month] = ex.date.split('-').map(Number);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!map[key]) {
        map[key] = { key, year, month: month - 1, total: 0, items: [] };
      }
      map[key].total += ex.amount;
      map[key].items.push(ex);
    });

    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredExpenses]);

  const toggleDateExpanded = (dateStr: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    dayGroups.forEach((g) => {
      all[g.date] = true;
    });
    setExpandedDates(all);
  };

  const collapseAll = () => {
    setExpandedDates({});
  };

  const getCategoryIconName = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.icon : 'Tag';
  };

  return (
    <div className="space-y-6">
      {/* Filters Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Date-Wise & Month-Wise Expenses</h2>
            <p className="text-xs text-slate-500">
              Inspect day-by-day logs, daily totals, calendar boundaries, and monthly summaries
            </p>
          </div>

          {/* Grouping switch */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setGroupingMode('day')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                groupingMode === 'day' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day-by-Day
            </button>
            <button
              onClick={() => setGroupingMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                groupingMode === 'month' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month-Wise
            </button>
          </div>
        </div>

        {/* Date Filter Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this-week', label: 'This Week' },
            { id: 'this-month', label: 'This Month' },
            { id: 'prev-month', label: 'Previous Month' },
            { id: 'specific-date', label: 'Specific Date' },
            { id: 'this-year', label: 'Year-Wise' },
            { id: 'custom', label: 'Custom Range' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterPreset(item.id as DateFilterPreset)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterPreset === item.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sub-inputs when specific-date, year-wise, or custom are active */}
        {filterPreset === 'specific-date' && (
          <div className="flex items-center gap-3 pt-2 text-xs border-t border-slate-100">
            <label className="font-semibold text-slate-700">Select Date:</label>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        )}

        {filterPreset === 'this-year' && (
          <div className="flex items-center gap-3 pt-2 text-xs border-t border-slate-100">
            <label className="font-semibold text-slate-700">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {filterPreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-700">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-700">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Selected Period Summary bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/60 p-3 rounded-xl">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Period Total:</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRupee(totalPeriodAmount)}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">{filteredExpenses.length} transactions</span>
          </div>

          {groupingMode === 'day' && dayGroups.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={expandAll}
                className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-white"
              >
                Expand All Days
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={collapseAll}
                className="text-slate-600 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-white"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content based on Grouping Mode */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarDays size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No Expenses for this Period</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your date range filter or record a new expense for this timeframe.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
          >
            Add Expense Now
          </button>
        </div>
      ) : groupingMode === 'day' ? (
        /* DAY-BY-DAY GROUPING ACCORDION */
        <div className="space-y-3">
          {dayGroups.map((group) => {
            const isExpanded = expandedDates[group.date] ?? true; // Default expanded for good UX
            const todayBadge = isToday(group.date);
            const yestBadge = isYesterday(group.date);

            return (
              <div
                key={group.date}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
              >
                {/* Day Header Accordion Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDateExpanded(group.date)}
                  className="w-full p-4.5 flex items-center justify-between text-left hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatDateWithDay(group.date)}
                        </span>
                        {todayBadge && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            TODAY
                          </span>
                        )}
                        {yestBadge && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            YESTERDAY
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {group.items.length} {group.items.length === 1 ? 'transaction' : 'transactions'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900 tabular-nums">
                      {formatRupee(group.total)}
                    </span>
                    <span className="block text-[11px] text-slate-400">Day's Total</span>
                  </div>
                </button>

                {/* Day Transactions List (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/30">
                    {group.items.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                            <CategoryIcon name={getCategoryIconName(ex.category)} size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{ex.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-medium text-slate-700">{ex.category}</span>
                              <span>·</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                {ex.payment}
                              </span>
                              {ex.notes && (
                                <>
                                  <span>·</span>
                                  <span className="text-slate-400 truncate max-w-xs">{ex.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-11 sm:pl-0">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            {formatRupee(ex.amount)}
                          </span>

                          <div className="flex items-center gap-1">
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* MONTH-WISE GROUPING */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthGroups.map((mGroup) => {
            const monthLabel = getMonthYearLabel(mGroup.year, mGroup.month);
            const daysInMonth = new Date(mGroup.year, mGroup.month + 1, 0).getDate();
            const avgDaily = Math.round(mGroup.total / daysInMonth);

            // Group by category for this month
            const catSummary: Record<string, number> = {};
            mGroup.items.forEach((item) => {
              catSummary[item.category] = (catSummary[item.category] || 0) + item.amount;
            });
            const topCategories = Object.entries(catSummary)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);

            return (
              <div key={mGroup.key} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{monthLabel}</h3>
                    <span className="text-xs text-slate-400">
                      {mGroup.items.length} transactions · {daysInMonth} days
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {formatRupee(mGroup.total)}
                    </span>
                    <span className="block text-[11px] text-slate-400">Month Total</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center text-slate-600">
                  <span>Daily Average:</span>
                  <span className="font-bold text-indigo-600 tabular-nums">{formatRupee(avgDaily)} / day</span>
                </div>

                {/* Top spending categories preview */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Top Spends in {monthLabel.split(' ')[0]}
                  </span>
                  {topCategories.map(([cat, amt]) => {
                    const pct = ((amt / mGroup.total) * 100).toFixed(0);
                    return (
                      <div key={cat} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-slate-700 truncate max-w-[180px]">{cat}</span>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="font-semibold text-slate-900">{formatRupee(amt)}</span>
                          <span className="text-slate-400 text-[11px]">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
