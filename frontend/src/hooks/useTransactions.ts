import { useCallback, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import * as transactionsApi from '../api/transactions';
import toast from 'react-hot-toast';

export function useTransactions() {
  const {
    transactions, summary, categories, filters, totalPages, total,
    isLoading, setTransactions, setSummary, setCategories, setFilters, setLoading,
    updateTransactionCategory: updateLocal, removeTransaction: removeLocal,
  } = useTransactionStore();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await transactionsApi.getTransactions(filters);
      setTransactions(result.data, result.total, result.totalPages);
    } catch (err: any) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, setTransactions, setLoading]);

  const fetchSummary = useCallback(async () => {
    try {
      const result = await transactionsApi.getTransactionSummary(
        filters.startDate,
        filters.endDate
      );
      setSummary(result);
    } catch (err: any) {
      toast.error('Failed to fetch summary');
    }
  }, [filters.startDate, filters.endDate, setSummary]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await transactionsApi.getCategories();
      setCategories(result);
    } catch {
      // Silent fail for categories
    }
  }, [setCategories]);

  const updateCategory = useCallback(async (id: string, category: string) => {
    try {
      await transactionsApi.updateTransactionCategory(id, category);
      updateLocal(id, category);
      toast.success('Category updated');
    } catch {
      toast.error('Failed to update category');
    }
  }, [updateLocal]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionsApi.deleteTransaction(id);
      removeLocal(id);
      toast.success('Transaction deleted');
    } catch {
      toast.error('Failed to delete transaction');
    }
  }, [removeLocal]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions, summary, categories, filters, totalPages, total,
    isLoading, setFilters, fetchTransactions, fetchSummary, fetchCategories,
    updateCategory, deleteTransaction,
  };
}
