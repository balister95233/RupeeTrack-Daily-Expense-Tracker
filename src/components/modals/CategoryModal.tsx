import React, { useState, useEffect } from 'react';
import { X, Tag, IndianRupee } from 'lucide-react';
import { CategoryConfig } from '../../types/expense';
import { AVAILABLE_ICONS, CategoryIcon } from '../CategoryIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { id?: string; name: string; icon: string; budget: number }) => void;
  editingCategory?: CategoryConfig | null;
  existingNames: string[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory,
  existingNames,
}) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('3000');
  const [icon, setIcon] = useState('Tag');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setBudget(editingCategory.budget.toString());
      setIcon(editingCategory.icon || 'Tag');
    } else {
      setName('');
      setBudget('3000');
      setIcon('Tag');
    }
    setError('');
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a category name.');
      return;
    }

    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase() && (!editingCategory || editingCategory.name.toLowerCase() !== trimmed.toLowerCase())
    );

    if (isDuplicate) {
      setError('A category with this name already exists.');
      return;
    }

    const parsedBudget = parseFloat(budget);

    onSave({
      id: editingCategory?.id,
      name: trimmed,
      icon,
      budget: isNaN(parsedBudget) || parsedBudget < 0 ? 0 : parsedBudget,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingCategory ? 'Modify category name, icon or budget cap' : 'Add a new expense category to RupeeTrack'}
              </p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscriptions, Pet Care, Freelance Tools"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Monthly Budget Limit (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IndianRupee size={15} />
              </div>
              <input
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none tabular-nums transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Icon</label>
            <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/40">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-1'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title={ic}
                >
                  <CategoryIcon name={ic} size={16} className={icon === ic ? 'text-white' : 'text-slate-700'} />
                </button>
              ))}
            </div>
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
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
