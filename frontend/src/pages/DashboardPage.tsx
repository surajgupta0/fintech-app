import { useEffect, useState } from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { ExportButtons } from '../components/export/ExportButtons';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../hooks/useAuth';
import { getDateRangePreset } from '../utils/dateHelpers';
import { Link } from 'react-router-dom';
import { Upload, LogOut, BarChart3, Loader2 } from 'lucide-react';

export function DashboardPage() {
  const {
    transactions, summary, categories, total, totalPages, isLoading,
    setFilters, fetchSummary, fetchCategories, updateCategory, deleteTransaction, filters,
  } = useTransactions();
  const { logout, user } = useAuth();

  const [selectedPreset, setSelectedPreset] = useState('last-3-months');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Initialize with last 3 months
  useEffect(() => {
    const { startDate, endDate } = getDateRangePreset('last-3-months');
    setFilters({ startDate, endDate, page: 1 });
  }, [setFilters]);

  // Fetch summary and categories when component mounts
  useEffect(() => {
    fetchSummary();
    fetchCategories();
  }, [fetchSummary, fetchCategories]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters({ category: category || undefined, page: 1 });
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
  };

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setFilters({ startDate, endDate, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-400 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                FinTrack
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ExportButtons
                startDate={filters.startDate}
                endDate={filters.endDate}
                category={filters.category}
              />
              <Link
                to="/upload"
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-xl text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-dark-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-dark-200">{user?.name}</p>
                  <p className="text-xs text-dark-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-dark-500 hover:text-danger-400 rounded-lg hover:bg-danger-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && transactions.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 text-primary-400 mx-auto animate-spin" />
              <p className="text-dark-500">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <Dashboard
            summary={summary}
            transactions={transactions}
            categories={categories}
            total={total}
            page={filters.page || 1}
            totalPages={totalPages}
            selectedCategory={selectedCategory}
            selectedPreset={selectedPreset}
            onCategoryChange={handleCategoryChange}
            onPresetChange={handlePresetChange}
            onCustomDateChange={handleCustomDateChange}
            onPageChange={handlePageChange}
            onUpdateCategory={updateCategory}
            onDelete={deleteTransaction}
          />
        )}
      </main>
    </div>
  );
}
