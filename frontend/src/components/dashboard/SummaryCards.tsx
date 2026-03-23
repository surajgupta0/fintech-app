import { formatCurrency } from '../../utils/formatCurrency';
import { TransactionSummary } from '../../types';
import { TrendingDown, TrendingUp, PieChart, Hash } from 'lucide-react';

interface SummaryCardsProps {
  summary: TransactionSummary | null;
  totalTransactions: number;
}

const cards = [
  {
    key: 'debit',
    label: 'Total Spent',
    icon: TrendingDown,
    color: 'from-danger-500 to-danger-600',
    iconBg: 'bg-danger-500/20',
    iconColor: 'text-danger-400',
  },
  {
    key: 'credit',
    label: 'Total Credited',
    icon: TrendingUp,
    color: 'from-success-500 to-success-600',
    iconBg: 'bg-success-500/20',
    iconColor: 'text-success-400',
  },
  {
    key: 'topCategory',
    label: 'Top Category',
    icon: PieChart,
    color: 'from-primary-500 to-primary-600',
    iconBg: 'bg-primary-500/20',
    iconColor: 'text-primary-400',
  },
  {
    key: 'count',
    label: 'Transactions',
    icon: Hash,
    color: 'from-accent-500 to-accent-600',
    iconBg: 'bg-accent-500/20',
    iconColor: 'text-accent-400',
  },
] as const;

export function SummaryCards({ summary, totalTransactions }: SummaryCardsProps) {
  const topCategory = summary?.byCategory?.[0];

  const getValue = (key: string) => {
    if (!summary) return '—';
    switch (key) {
      case 'debit': return formatCurrency(summary.totalDebit);
      case 'credit': return formatCurrency(summary.totalCredit);
      case 'topCategory': return topCategory?.category || 'N/A';
      case 'count': return totalTransactions.toLocaleString();
      default: return '—';
    }
  };

  const getSubtext = (key: string) => {
    if (!summary) return '';
    switch (key) {
      case 'topCategory': return topCategory ? formatCurrency(topCategory.total) : '';
      default: return '';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="summary-cards">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="relative overflow-hidden bg-dark-900/60 backdrop-blur-sm border border-dark-800 rounded-2xl p-5 hover:border-dark-600 transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full -translate-y-6 translate-x-6 group-hover:opacity-10 transition-opacity" />
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-dark-500 text-sm font-medium">{card.label}</p>
                <p className="text-xl font-bold text-dark-100">{getValue(card.key)}</p>
                {getSubtext(card.key) && (
                  <p className="text-xs text-dark-500">{getSubtext(card.key)}</p>
                )}
              </div>
              <div className={`${card.iconBg} p-2.5 rounded-xl`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
