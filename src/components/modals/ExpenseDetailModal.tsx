import React from 'react';
import { X, Calendar, CreditCard, Tag, FileText, Trash2, Edit3 } from 'lucide-react';
import { Expense, CategoryConfig } from '../../types/expense';
import { formatRupee, formatDateWithDay } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  categoryConfig?: CategoryConfig;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  expense,
  categoryConfig,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Transaction Details
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Amount & Title */}
          <div className="text-center pb-4 border-b border-slate-100">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CategoryIcon name={categoryConfig?.icon || 'Tag'} size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatRupee(expense.amount)}
            </h2>
            <p className="text-sm font-semibold text-slate-800 mt-1">{expense.title}</p>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag size={14} className="text-slate-400" /> Category
              </span>
              <span className="font-medium text-slate-800 text-right max-w-[220px] truncate">
                {expense.category}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" /> Date
              </span>
              <span className="font-medium text-slate-800">{formatDateWithDay(expense.date)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CreditCard size={14} className="text-slate-400" /> Payment Method
              </span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {expense.payment}
              </span>
            </div>

            {expense.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                  <FileText size={14} className="text-slate-400" /> Notes
                </span>
                <p className="p-2.5 rounded-lg bg-slate-50 text-slate-700 text-xs leading-relaxed">
                  {expense.notes}
                </p>
              </div>
            )}

            <div className="text-[11px] text-slate-400 text-right pt-2">
              Ref ID: <span className="font-mono">{expense.id}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onDelete(expense.id);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Delete
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onEdit(expense);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 size={14} /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
