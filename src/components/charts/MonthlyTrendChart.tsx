import React, { useState } from 'react';
import { formatRupee } from '../../utils/formatters';

interface TrendDataPoint {
  label: string; // e.g. "May '26"
  fullLabel: string; // e.g. "May 2026"
  amount: number;
}

interface MonthlyTrendChartProps {
  data: TrendDataPoint[];
  height?: number;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data, height = 240 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-slate-400 text-sm">
        No expense data available for trend analysis.
      </div>
    );
  }

  const padding = { top: 25, right: 30, bottom: 40, left: 60 };
  const width = 640;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.amount), 5000);
  const roundedMax = Math.ceil(maxVal / 5000) * 5000;

  const points = data.map((d, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.amount / (roundedMax || 1)) * chartHeight;
    return { x, y, ...d };
  });

  // Generate smooth SVG curve path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${
    padding.top + chartHeight
  } Z`;

  // Y-axis grid ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: Math.round(roundedMax * pct),
    y: padding.top + chartHeight - pct * chartHeight,
  }));

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeDasharray={i === 0 ? '' : '3 3'}
              strokeWidth="1"
            />
            <text
              x={padding.left - 10}
              y={tick.y + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-400 font-mono tabular-nums"
            >
              {tick.val >= 1000 ? `₹${(tick.val / 1000).toFixed(tick.val % 1000 === 0 ? 0 : 1)}k` : `₹${tick.val}`}
            </text>
          </g>
        ))}

        {/* Shaded Area */}
        <path d={areaD} fill="url(#trendGradient)" />

        {/* Trend Line */}
        <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points & X Labels */}
        {points.map((pt, i) => (
          <g key={i}>
            {/* Vertical hover guide */}
            {hoveredIndex === i && (
              <line
                x1={pt.x}
                y1={padding.top}
                x2={pt.x}
                y2={padding.top + chartHeight}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}

            {/* X-axis label */}
            <text
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              className={`text-[11px] font-medium transition-colors ${
                hoveredIndex === i ? 'fill-indigo-600 font-semibold' : 'fill-slate-500'
              }`}
            >
              {pt.label}
            </text>

            {/* Interactive dot target */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === i ? 6 : 4}
              fill="#ffffff"
              stroke="#4f46e5"
              strokeWidth={hoveredIndex === i ? 3 : 2}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            <circle
              cx={pt.x}
              cy={pt.y}
              r={16}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs z-10"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 45}%`,
          }}
        >
          <p className="text-[10px] text-slate-300 font-medium">{points[hoveredIndex].fullLabel}</p>
          <p className="font-bold text-white tabular-nums">{formatRupee(points[hoveredIndex].amount)}</p>
        </div>
      )}
    </div>
  );
};
