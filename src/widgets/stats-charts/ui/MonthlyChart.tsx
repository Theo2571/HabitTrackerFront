import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { MonthlyStatsPoint } from '../../../shared/types';

const MOCK_MONTHLY: MonthlyStatsPoint[] = [
  { week: 'W1', count: 24 },
  { week: 'W2', count: 31 },
  { week: 'W3', count: 28 },
  { week: 'W4', count: 19 },
];

interface MonthlyChartProps {
  /** Данные с бэка; если не переданы — показывается mock */
  data?: MonthlyStatsPoint[] | null;
}

export const MonthlyChart = ({ data }: MonthlyChartProps) => {
  const chartData = (data && data.length > 0) ? data : MOCK_MONTHLY;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(18,24,32,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
          formatter={(value: number) => [value, 'Completed']}
        />
        <Bar
          dataKey="count"
          fill="url(#monthlyGradient)"
          radius={[4, 4, 0, 0]}
        />
        <defs>
          <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};
