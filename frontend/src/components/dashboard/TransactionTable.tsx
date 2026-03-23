import { useState } from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
  onPageChange: (page: number) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onDelete: (id: string) => void;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  let color = 'bg-danger-500/20 text-danger-400';
  let label = 'Low';
  if (confidence >= 0.8) {
    color = 'bg-success-500/20 text-success-400';
    label = 'High';
  } else if (confidence >= 0.5) {
    color = 'bg-accent-500/20 text-accent-400';
    label = 'Med';
  }

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: 'DEBIT' | 'CREDIT' }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
        type === 'DEBIT'
          ? 'bg-danger-500/20 text-danger-400'
          : 'bg-success-500/20 text-success-400'
      }`}
    >
      {type}
    </span>
  );
}

export function TransactionTable({
  transactions,
  total,
  page,
  totalPages,
  categories,
  onPageChange,
  onUpdateCategory,
  onDelete,
}: TransactionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-12 text-center">
        <p className="text-dark-500 text-lg">No transactions found</p>
        <p className="text-dark-600 text-sm mt-2">Upload a CSV to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-900/60 border border-dark-800 rounded-2xl overflow-hidden" id="transaction-table">
      <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-200">Transactions</h3>
        <p className="text-sm text-dark-500">{total.toLocaleString()} total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-900/80">
              <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Description</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Amount</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Category</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Confidence</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-dark-800/50 transition-colors">
                <td className="px-6 py-3 text-sm text-dark-300 whitespace-nowrap font-mono">
                  {formatDate(txn.date)}
                </td>
                <td className="px-6 py-3 text-sm text-dark-200 max-w-[250px] truncate" title={txn.description}>
                  {txn.description}
                </td>
                <td className="px-6 py-3 text-sm text-right font-mono font-medium whitespace-nowrap">
                  <span className={txn.type === 'DEBIT' ? 'text-danger-400' : 'text-success-400'}>
                    {txn.type === 'DEBIT' ? '-' : '+'}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <TypeBadge type={txn.type} />
                </td>
                <td className="px-6 py-3">
                  {editingId === txn.id ? (
                    <select
                      value={txn.category}
                      onChange={(e) => {
                        onUpdateCategory(txn.id, e.target.value);
                        setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="bg-dark-800 border border-dark-600 text-dark-200 text-sm rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="Uncategorized">Uncategorized</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingId(txn.id)}
                      className="text-sm text-dark-300 hover:text-primary-400 transition-colors cursor-pointer"
                      title="Click to edit category"
                    >
                      {txn.category}
                    </button>
                  )}
                </td>
                <td className="px-6 py-3 text-center">
                  <ConfidenceBadge confidence={txn.confidence} />
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => onDelete(txn.id)}
                    className="text-dark-500 hover:text-danger-400 transition-colors p-1 rounded-lg hover:bg-danger-500/10"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-dark-800 flex items-center justify-between">
          <p className="text-sm text-dark-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-400 hover:text-dark-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
