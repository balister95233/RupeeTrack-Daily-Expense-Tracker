import React, { useState, useMemo } from 'react';
import { Download, Printer, TrendingUp, Calendar, CreditCard, Award, ArrowDown, ArrowUp, BarChart2 } from 'lucide-react';
import { Expense, CategoryConfig, PaymentMethod } from '../../types/expense';
import { formatRupee, formatDate, exportExpensesToCSV, formatDateWithDay } from '../../utils/formatters';
import { MonthlyTrendChart } from '../charts/MonthlyTrendChart';
import { CategoryBreakdownChart, CATEGORY_PALETTE } from '../charts/CategoryBreakdownChart';
import { PaymentMethodChart } from '../charts/PaymentMethodChart';
import { AnnualComparisonChart } from '../charts/AnnualComparisonChart';
import { PAYMENT_METHODS } from '../../utils/constants';

interface ReportsViewProps {
  expenses: Expense[];
  categories: CategoryConfig[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ expenses, categories }) => {
  const [reportCadence, setReportCadence] = useState<'monthly' | 'annual' | 'all'>('monthly');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter expenses according to selected cadence
  const activeExpenses = useMemo(() => {
    return expenses.filter((ex) => {
      const [y, m] = ex.date.split('-').map(Number);
      if (reportCadence === 'monthly') {
        return y === currentYear && m - 1 === currentMonth;
      }
      if (reportCadence === 'annual') {
        return y === selectedYear;
      }
      return true;
    });
  }, [expenses, reportCadence, selectedYear, currentMonth, currentYear]);

  const totalSpent = useMemo(() => {
    return activeExpenses.reduce((sum, ex) => sum + ex.amount, 0);
  }, [activeExpenses]);

  // Daily expenditure breakdown & day stats
  const dayStats = useMemo(() => {
    const dayMap: Record<string, number> = {};
    activeExpenses.forEach((ex) => {
      dayMap[ex.date] = (dayMap[ex.date] || 0) + ex.amount;
    });

    const entries = Object.entries(dayMap);
    if (entries.length === 0) {
      return {
        highestDay: null as { date: string; amount: number } | null,
        lowestDay: null as { date: string; amount: number } | null,
        avgDaily: 0,
        activeDaysCount: 0,
      };
    }

    entries.sort((a, b) => b[1] - a[1]);
    const highestDay = { date: entries[0][0], amount: entries[0][1] };
    const lowestDay = { date: entries[entries.length - 1][0], amount: entries[entries.length - 1][1] };

    // If monthly, divide by elapsed days in month (or total days)
    const daysDivisor = reportCadence === 'monthly' ? Math.max(now.getDate(), 1) : Math.max(entries.length, 1);
    const avgDaily = Math.round(totalSpent / daysDivisor);

    return {
      highestDay,
      lowestDay,
      avgDaily,
      activeDaysCount: entries.length,
    };
  }, [activeExpenses, totalSpent, reportCadence, now]);

  // Payment method data
  const paymentMethodData = useMemo(() => {
    const map: Record<PaymentMethod, { amount: number; count: number }> = {
      UPI: { amount: 0, count: 0 },
      'Credit Card': { amount: 0, count: 0 },
      'Debit Card': { amount: 0, count: 0 },
      Cash: { amount: 0, count: 0 },
      Other: { amount: 0, count: 0 },
    };

    activeExpenses.forEach((ex) => {
      if (map[ex.payment]) {
        map[ex.payment].amount += ex.amount;
        map[ex.payment].count += 1;
      } else {
        map.Other.amount += ex.amount;
        map.Other.count += 1;
      }
    });

    return (Object.keys(map) as PaymentMethod[]).map((method) => ({
      method,
      amount: map[method].amount,
      count: map[method].count,
      percentage: totalSpent > 0 ? Number(((map[method].amount / totalSpent) * 100).toFixed(1)) : 0,
    }));
  }, [activeExpenses, totalSpent]);

  // Category summary
  const categorySummary = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    activeExpenses.forEach((ex) => {
      if (!map[ex.category]) map[ex.category] = { amount: 0, count: 0 };
      map[ex.category].amount += ex.amount;
      map[ex.category].count += 1;
    });

    return Object.entries(map)
      .map(([cat, val], idx) => ({
        category: cat,
        amount: val.amount,
        count: val.count,
        percentage: totalSpent > 0 ? Number(((val.amount / totalSpent) * 100).toFixed(1)) : 0,
        color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeExpenses, totalSpent]);

  // 12-month annual comparison data
  const annualMonthsData = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return monthNames.map((mName, i) => {
      const monthExpenses = expenses.filter((ex) => {
        const [y, m] = ex.date.split('-').map(Number);
        return y === selectedYear && m - 1 === i;
      });

      return {
        monthName: mName,
        monthShort: monthShorts[i],
        amount: monthExpenses.reduce((sum, ex) => sum + ex.amount, 0),
        count: monthExpenses.length,
      };
    });
  }, [expenses, selectedYear]);

  // 6-month trend data
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const ty = d.getFullYear();
      const tm = d.getMonth();
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      const fullLabel = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      const sum = expenses
        .filter((ex) => {
          const [y, m] = ex.date.split('-').map(Number);
          return y === ty && m - 1 === tm;
        })
        .reduce((acc, ex) => acc + ex.amount, 0);

      data.push({ label, fullLabel, amount: sum });
    }
    return data;
  }, [expenses, currentYear, currentMonth]);

  const handleExportCSV = () => {
    exportExpensesToCSV(
      activeExpenses,
      `RupeeTrack_Report_${reportCadence}_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and cadence controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Reports & Analytics</h2>
            <p className="text-xs text-slate-500">
              Deep-dive into your financial habits, payment channels, trends, and category comparisons
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              <Download size={14} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
            >
              <Printer size={14} />
              <span>Print / PDF Report</span>
            </button>
          </div>
        </div>

        {/* Cadence selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReportCadence('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                reportCadence === 'monthly'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setReportCadence('annual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                reportCadence === 'annual'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Annual ({selectedYear})
            </button>
            <button
              onClick={() => setReportCadence('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                reportCadence === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Time
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Active Scope: <strong className="text-slate-900 tabular-nums">{formatRupee(totalSpent)}</strong> across{' '}
            <strong className="text-slate-900">{activeExpenses.length}</strong> transactions
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print-only mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">RupeeTrack - Expense Summary Report</h1>
        <p className="text-sm text-slate-500 mt-1">
          Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards Row (Daily Average, Highest Day, Lowest Day, Transactions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Daily Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Daily Average Spend
          </span>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{formatRupee(dayStats.avgDaily)}</h3>
            <p className="text-xs text-slate-400 mt-1">Calculated for selected period</p>
          </div>
        </div>

        {/* Highest Spending Day */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Peak Spending Day
            </span>
            <ArrowUp size={16} className="text-rose-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-rose-600 tabular-nums">
              {dayStats.highestDay ? formatRupee(dayStats.highestDay.amount) : '₹0'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {dayStats.highestDay ? formatDate(dayStats.highestDay.date) : 'No data'}
            </p>
          </div>
        </div>

        {/* Lowest Spending Day */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lowest Spending Day
            </span>
            <ArrowDown size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-emerald-600 tabular-nums">
              {dayStats.lowestDay ? formatRupee(dayStats.lowestDay.amount) : '₹0'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {dayStats.lowestDay ? formatDate(dayStats.lowestDay.date) : 'No data'}
            </p>
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Transactions
          </span>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{activeExpenses.length}</h3>
            <p className="text-xs text-slate-400 mt-1">{dayStats.activeDaysCount} active transaction days</p>
          </div>
        </div>
      </div>

      {/* Row 1: Payment Method Breakdown & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Payment Method Distribution</h3>
              <p className="text-xs text-slate-500">Spending across Cash, UPI, Cards</p>
            </div>
            <CreditCard size={18} className="text-slate-400" />
          </div>
          <PaymentMethodChart data={paymentMethodData} total={totalSpent} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Category-Wise Breakdown</h3>
              <p className="text-xs text-slate-500">Expenditure share for selected period</p>
            </div>
          </div>
          <CategoryBreakdownChart items={categorySummary} totalAmount={totalSpent} />
        </div>
      </div>

      {/* Row 2: 12-Month Annual Bar Chart & 6-Month Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Annual Monthly Comparison ({selectedYear})</h3>
              <p className="text-xs text-slate-500">Total monthly expenditure through the year</p>
            </div>
            <BarChart2 size={18} className="text-slate-400" />
          </div>
          <AnnualComparisonChart year={selectedYear} data={annualMonthsData} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">6-Month Spending Trend</h3>
              <p className="text-xs text-slate-500">Continuous expenditure trajectory</p>
            </div>
            <TrendingUp size={18} className="text-slate-400" />
          </div>
          <MonthlyTrendChart data={trendData} height={220} />
        </div>
      </div>

      {/* Category Expenditure Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print-card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Category Spending Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive category-wise summary report</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md">
            {categorySummary.length} Active Categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5 text-center">Transactions</th>
                <th className="py-3 px-5 text-right">Avg per Txn</th>
                <th className="py-3 px-5 text-right">Share (%)</th>
                <th className="py-3 px-5 text-right">Total Expenditure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorySummary.map((item, index) => {
                const avgTxn = item.count > 0 ? Math.round(item.amount / item.count) : 0;
                return (
                  <tr key={item.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400">#{index + 1}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.category}
                    </td>
                    <td className="py-3.5 px-5 text-center text-slate-600 font-medium">{item.count}</td>
                    <td className="py-3.5 px-5 text-right text-slate-600 tabular-nums">{formatRupee(avgTxn)}</td>
                    <td className="py-3.5 px-5 text-right font-medium text-indigo-600 tabular-nums">
                      {item.percentage}%
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-slate-900 tabular-nums">
                      {formatRupee(item.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <td colSpan={2} className="py-3 px-5 text-left uppercase text-[11px] text-slate-500">
                  Total
                </td>
                <td className="py-3 px-5 text-center">{activeExpenses.length}</td>
                <td className="py-3 px-5 text-right tabular-nums">
                  {formatRupee(activeExpenses.length > 0 ? Math.round(totalSpent / activeExpenses.length) : 0)}
                </td>
                <td className="py-3 px-5 text-right">100%</td>
                <td className="py-3 px-5 text-right text-sm tabular-nums text-indigo-600">
                  {formatRupee(totalSpent)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
