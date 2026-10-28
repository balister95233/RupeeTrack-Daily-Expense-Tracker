import React from 'react';
import { formatRupee } from '../../utils/formatters';
import { PaymentMethod } from '../../types/expense';

interface PaymentData {
  method: PaymentMethod;
  amount: number;
  count: number;
  percentage: number;
}

interface PaymentMethodChartProps {
  data: PaymentData[];
  total: number;
}

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  UPI: '#4f46e5', // indigo
  'Credit Card': '#0ea5e9', // sky
  'Debit Card': '#10b981', // emerald
  Cash: '#f59e0b', // amber
  Other: '#64748b', // slate
};

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data, total }) => {
  if (!data || data.length === 0 || total === 0) {
    return <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No payment data</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="space-y-3.5">
      {data.map((item) => {
        const barWidth = Math.max((item.amount / maxVal) * 100, 3);
        const color = PAYMENT_METHOD_COLORS[item.method] || '#6366f1';

        return (
          <div key={item.method} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {item.method}
                <span className="text-[11px] text-slate-400 font-normal">({item.count} txns)</span>
              </span>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span className="font-semibold text-slate-900">{formatRupee(item.amount)}</span>
                <span className="text-slate-400 text-[11px] w-9 text-right">{item.percentage}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${barWidth}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
