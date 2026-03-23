import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryBreakdown } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

const COLORS = [
  '#5c7cfa', '#ff9800', '#4caf50', '#f44336', '#9c27b0',
  '#00bcd4', '#ff5722', '#607d8b', '#e91e63',
];

interface SpendingPieChartProps {
  data: CategoryBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-dark-200 font-medium">{data.category}</p>
        <p className="text-primary-400 font-mono text-sm">{formatCurrency(data.total)}</p>
        <p className="text-dark-500 text-xs">{data.count} transactions</p>
      </div>
    );
  }
  return null;
}

export function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6 flex items-center justify-center h-[350px]">
        <p className="text-dark-500">No spending data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);
  const chartData = data.map((d) => ({
    ...d,
    percentage: ((d.total / total) * 100).toFixed(1),
  }));

  return (
    <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6" id="spending-pie-chart">
      <h3 className="text-lg font-semibold text-dark-200 mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={2}
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => (
              <span className="text-dark-400 text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
