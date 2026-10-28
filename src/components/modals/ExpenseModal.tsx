import React, { useState, useEffect } from 'react';
import { X, Calendar, IndianRupee } from 'lucide-react';
import { Expense, CategoryConfig, PaymentMethod } from '../../types/expense';
import { PAYMENT_METHODS, getRelativeDateString } from '../../utils/constants';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => void;
  editingExpense?: Expense | null;
  categories: CategoryConfig[];
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getRelativeDateString(0));
  const [payment, setPayment] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setPayment(editingExpense.payment);
      setNotes(editingExpense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory(categories[0]?.name || 'Grocery and household shopping');
      setDate(getRelativeDateString(0));
      setPayment('UPI');
      setNotes('');
    }
    setErrorMessage('');
  }, [editingExpense, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedTitle = title.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedTitle) {
      setErrorMessage('Please provide an expense title or description.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Amount must be a valid number greater than zero (₹).');
      return;
    }

    if (!category) {
      setErrorMessage('Please select a valid expense category.');
      return;
    }

    if (!date) {
      setErrorMessage('Please choose a valid transaction date.');
      return;
    }

    onSave({
      id: editingExpense ? editingExpense.id : undefined,
      title: trimmedTitle,
      amount: Math.round(parsedAmount * 100) / 100,
      category,
      date,
      payment,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const setShortcutDate = (offset: number) => {
    setDate(getRelativeDateString(offset));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingExpense ? 'Update details of this transaction' : 'Log your daily spending date-wise in Indian Rupees (₹)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Expense Title / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Groceries, Petrol Refill, Swiggy Dinner"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
              autoFocus
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee size={16} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none tabular-nums transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Date <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShortcutDate(0)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-50"
                  >
                    Today
                  </button>
                  <span className="text-slate-300 text-[10px]">·</span>
                  <button
                    type="button"
                    onClick={() => setShortcutDate(-1)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-50"
                  >
                    Yesterday
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={payment}
                onChange={(e) => setPayment(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Optional Notes / Bill Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Store location, invoice number, item details, or remarks..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
            />
          </div>

          {/* Footer Actions */}
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
              {editingExpense ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
