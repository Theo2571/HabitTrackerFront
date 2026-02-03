import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { WeeklyStatsPoint } from '../../../shared/types';

const MOCK_WEEKLY: WeeklyStatsPoint[] = [
  { day: 'Mon', completion: 85 },
  { day: 'Tue', completion: 72 },
  { day: 'Wed', completion: 90 },
  { day: 'Thu', completion: 68 },
  { day: 'Fri', completion: 95 },
  { day: 'Sat', completion: 78 },
  { day: 'Sun', completion: 88 },
];

interface WeeklyChartProps {
  /** Данные с бэка; если не переданы — показывается mock */
  data?: WeeklyStatsPoint[] | null;
}

export const WeeklyChart = ({ data }: WeeklyChartProps) => {
  const chartData = (data && data.length > 0) ? data : MOCK_WEEKLY;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(18,24,32,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
          formatter={(value: number) => [`${value}%`, 'Completion']}
        />
        <Line
          type="monotone"
          dataKey="completion"
          stroke="url(#weeklyGradient)"
          strokeWidth={2}
          dot={{ fill: 'rgba(139,92,246,0.4)', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: 'var(--accent-cyan)', stroke: 'rgba(255,255,255,0.2)' }}
        />
        <defs>
          <linearGradient id="weeklyGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-violet)" />
            <stop offset="100%" stopColor="var(--accent-cyan)" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
};
