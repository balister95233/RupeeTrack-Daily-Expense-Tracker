import React, { useState } from 'react';
import { formatRupee } from '../../utils/formatters';

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

interface CategoryBreakdownChartProps {
  items: CategoryBreakdownItem[];
  totalAmount: number;
}

export const CATEGORY_PALETTE = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // violet
  '#84cc16', // lime
  '#0284c7', // sky
  '#d946ef', // fuchsia
  '#64748b', // slate
];

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ items, totalAmount }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!items || items.length === 0 || totalAmount === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>No category expenses recorded for this period.</p>
      </div>
    );
  }

  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const topItems = items.slice(0, 5);
  const otherItems = items.slice(5);
  const otherAmount = otherItems.reduce((acc, it) => acc + it.amount, 0);

  const displayList = [...topItems];
  if (otherAmount > 0) {
    displayList.push({
      category: 'Other categories',
      amount: otherAmount,
      count: otherItems.reduce((acc, it) => acc + it.count, 0),
      percentage: Number(((otherAmount / totalAmount) * 100).toFixed(1)),
      color: '#94a3b8',
    });
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Donut graphic */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {items.map((item, i) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;
            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={item.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {hoveredIdx !== null ? items[hoveredIdx].category : 'Total Spent'}
          </span>
          <span className="text-base font-bold text-slate-900 tabular-nums">
            {hoveredIdx !== null ? formatRupee(items[hoveredIdx].amount) : formatRupee(totalAmount)}
          </span>
          <span className="text-[11px] font-medium text-indigo-600 tabular-nums">
            {hoveredIdx !== null ? `${items[hoveredIdx].percentage}%` : `${items.length} categories`}
          </span>
        </div>
      </div>

      {/* Ranked Category Legend / List */}
      <div className="flex-1 w-full space-y-2">
        {displayList.map((item, idx) => {
          const originalIdx = items.findIndex((it) => it.category === item.category);
          const isHovered = hoveredIdx === (originalIdx !== -1 ? originalIdx : null);

          return (
            <div
              key={item.category}
              onMouseEnter={() => originalIdx !== -1 && setHoveredIdx(originalIdx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between text-xs ${
                isHovered ? 'bg-indigo-50/80 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate max-w-[200px] sm:max-w-[240px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-medium truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 tabular-nums text-right">
                <span className="font-bold text-slate-900">{formatRupee(item.amount)}</span>
                <span className="text-slate-400 w-11 text-right">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
