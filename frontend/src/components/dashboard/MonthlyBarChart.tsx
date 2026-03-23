import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonthlyBreakdown } from '../../types';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatCurrency';
import { formatMonth } from '../../utils/dateHelpers';

interface MonthlyBarChartProps {
  data: MonthlyBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-dark-200 font-medium mb-2">{label ? formatMonth(label) : ''}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6 flex items-center justify-center h-[350px]">
        <p className="text-dark-500">No monthly data available</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    name: formatMonth(d.month),
  }));

  return (
    <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6" id="monthly-bar-chart">
      <h3 className="text-lg font-semibold text-dark-200 mb-4">Monthly Debit vs Credit</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#343a40" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#868e96', fontSize: 12 }}
            axisLine={{ stroke: '#343a40' }}
            tickFormatter={(v) => formatMonth(v)}
          />
          <YAxis
            tick={{ fill: '#868e96', fontSize: 12 }}
            axisLine={{ stroke: '#343a40' }}
            tickFormatter={(v) => formatCompactCurrency(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => (
              <span className="text-dark-400 text-sm">{value}</span>
            )}
          />
          <Bar
            dataKey="debit"
            name="Debit"
            fill="#f44336"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
          <Bar
            dataKey="credit"
            name="Credit"
            fill="#4caf50"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationBegin={200}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
