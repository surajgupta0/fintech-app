import { SummaryCards } from './SummaryCards';
import { SpendingPieChart } from './SpendingPieChart';
import { MonthlyBarChart } from './MonthlyBarChart';
import { TransactionTable } from './TransactionTable';
import { DateRangeFilter } from './DateRangeFilter';
import { TransactionSummary, Transaction } from '../../types';

interface DashboardProps {
  summary: TransactionSummary | null;
  transactions: Transaction[];
  categories: string[];
  total: number;
  page: number;
  totalPages: number;
  selectedCategory: string;
  selectedPreset: string;
  onCategoryChange: (category: string) => void;
  onPresetChange: (preset: string) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
  onPageChange: (page: number) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onDelete: (id: string) => void;
}

export function Dashboard({
  summary,
  transactions,
  categories,
  total,
  page,
  totalPages,
  selectedCategory,
  selectedPreset,
  onCategoryChange,
  onPresetChange,
  onCustomDateChange,
  onPageChange,
  onUpdateCategory,
  onDelete,
}: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <SummaryCards summary={summary} totalTransactions={total} />

      {/* Filters */}
      <DateRangeFilter
        categories={categories}
        selectedCategory={selectedCategory}
        selectedPreset={selectedPreset}
        onCategoryChange={onCategoryChange}
        onPresetChange={onPresetChange}
        onCustomDateChange={onCustomDateChange}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingPieChart data={summary?.byCategory || []} />
        <MonthlyBarChart data={summary?.byMonth || []} />
      </div>

      {/* Transaction table */}
      <TransactionTable
        transactions={transactions}
        total={total}
        page={page}
        totalPages={totalPages}
        categories={categories}
        onPageChange={onPageChange}
        onUpdateCategory={onUpdateCategory}
        onDelete={onDelete}
      />
    </div>
  );
}
