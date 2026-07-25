import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '@/store/appStore';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(148,163,184,0.2)',
  background: 'rgba(15,23,42,0.92)',
  color: '#fff',
  fontSize: 12,
  padding: '8px 12px',
  boxShadow: '0 10px 30px -12px rgba(0,0,0,0.4)',
};

export function useChartTheme() {
  const { theme } = useApp();
  return {
    grid: theme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.18)',
    axis: theme === 'dark' ? '#64748b' : '#94a3b8',
    tooltipStyle,
  };
}

export function MiniArea({ data, dataKey = 'value', color = '#2563EB', height = 60 }: { data: any[]; dataKey?: string; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${dataKey}-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#g-${dataKey}-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend };
