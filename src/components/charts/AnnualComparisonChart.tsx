import React, { useState } from 'react';
import { formatRupee } from '../../utils/formatters';

interface MonthData {
  monthName: string;
  monthShort: string;
  amount: number;
  count: number;
}

interface AnnualComparisonChartProps {
  year: number;
  data: MonthData[];
}

export const AnnualComparisonChart: React.FC<AnnualComparisonChartProps> = ({ year, data }) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthData | null>(null);

  const maxVal = Math.max(...data.map((d) => d.amount), 10000);
  const roundedMax = Math.ceil(maxVal / 10000) * 10000;
  const totalYearSpent = data.reduce((sum, d) => sum + d.amount, 0);
  const activeMonths = data.filter((d) => d.amount > 0).length || 1;
  const avgMonthly = Math.round(totalYearSpent / activeMonths);

  const height = 220;
  const width = 640;
  const padding = { top: 20, right: 20, bottom: 35, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barSlotWidth = chartWidth / 12;
  const barWidth = Math.min(barSlotWidth * 0.65, 28);

  const avgY = padding.top + chartHeight - (avgMonthly / (roundedMax || 1)) * chartHeight;

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <div>
          Year <span className="font-bold text-slate-900">{year}</span> Total:{' '}
          <span className="font-bold text-indigo-600 tabular-nums">{formatRupee(totalYearSpent)}</span>
        </div>
        <div>
          Monthly Avg:{' '}
          <span className="font-semibold text-slate-800 tabular-nums">{formatRupee(avgMonthly)}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = padding.top + chartHeight - pct * chartHeight;
          const val = Math.round(roundedMax * pct);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray={i === 0 ? '' : '3 3'}
                strokeWidth="1"
              />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                {val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
              </text>
            </g>
          );
        })}

        {/* Average reference line */}
        {avgMonthly > 0 && (
          <g>
            <line
              x1={padding.left}
              y1={avgY}
              x2={width - padding.right}
              y2={avgY}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={width - padding.right} y={avgY - 4} textAnchor="end" className="text-[9px] fill-amber-600 font-medium">
              Avg ₹{(avgMonthly / 1000).toFixed(1)}k
            </text>
          </g>
        )}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = item.amount > 0 ? (item.amount / (roundedMax || 1)) * chartHeight : 2;
          const x = padding.left + index * barSlotWidth + (barSlotWidth - barWidth) / 2;
          const y = padding.top + chartHeight - barHeight;
          const isCurrentHover = hoveredMonth?.monthShort === item.monthShort;

          return (
            <g
              key={item.monthShort}
              onMouseEnter={() => setHoveredMonth(item)}
              onMouseLeave={() => setHoveredMonth(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={isCurrentHover ? '#4338ca' : item.amount > 0 ? '#6366f1' : '#e2e8f0'}
                className="transition-colors duration-150"
              />
              <text
                x={x + barWidth / 2}
                y={height - 12}
                textAnchor="middle"
                className={`text-[10px] transition-colors ${
                  isCurrentHover ? 'fill-indigo-600 font-bold' : 'fill-slate-500 font-medium'
                }`}
              >
                {item.monthShort}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredMonth && (
        <div className="absolute top-1 right-3 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg flex items-center gap-3">
          <span className="font-medium text-slate-300">{hoveredMonth.monthName}</span>
          <span className="font-bold text-white tabular-nums">{formatRupee(hoveredMonth.amount)}</span>
          <span className="text-[10px] text-slate-400">({hoveredMonth.count} entries)</span>
        </div>
      )}
    </div>
  );
};
