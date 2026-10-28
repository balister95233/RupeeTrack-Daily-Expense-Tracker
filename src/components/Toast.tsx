import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
    info: <Info size={16} className="text-indigo-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-slate-900',
    warning: 'border-amber-200 bg-white text-slate-900',
    info: 'border-indigo-200 bg-white text-slate-900',
  };

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2 ${
        borders[toast.type]
      }`}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900">{toast.title}</p>
        {toast.message && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{toast.message}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
      >
        <X size={14} />
      </button>
    </div>
  );
};
