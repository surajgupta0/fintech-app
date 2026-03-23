import { create } from 'zustand';
import { Transaction, TransactionSummary, TransactionFilters } from '../types';

interface TransactionStore {
  transactions: Transaction[];
  summary: TransactionSummary | null;
  categories: string[];
  filters: TransactionFilters;
  totalPages: number;
  total: number;
  isLoading: boolean;
  setTransactions: (transactions: Transaction[], total: number, totalPages: number) => void;
  setSummary: (summary: TransactionSummary) => void;
  setCategories: (categories: string[]) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  setLoading: (loading: boolean) => void;
  updateTransactionCategory: (id: string, category: string) => void;
  removeTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  summary: null,
  categories: [],
  filters: { page: 1, limit: 50 },
  totalPages: 0,
  total: 0,
  isLoading: false,
  setTransactions: (transactions, total, totalPages) =>
    set({ transactions, total, totalPages }),
  setSummary: (summary) => set({ summary }),
  setCategories: (categories) => set({ categories }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  updateTransactionCategory: (id, category) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, category, classifierLevel: 0, confidence: 1.0 } : t
      ),
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      total: state.total - 1,
    })),
}));
