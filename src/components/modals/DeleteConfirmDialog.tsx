import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatRupee } from '../../utils/formatters';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  amount?: number;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  amount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
            {amount !== undefined && (
              <p className="mt-2 text-sm font-bold text-slate-800 tabular-nums">
                Amount: <span className="text-rose-600">{formatRupee(amount)}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 size={14} /> Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
