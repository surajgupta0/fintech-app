import client from './client';
import { PaginatedResponse, Transaction, TransactionSummary, TransactionFilters } from '../types';

export async function getTransactions(filters: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.category) params.append('category', filters.category);
  if (filters.type) params.append('type', filters.type);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const { data } = await client.get(`/transactions?${params.toString()}`);
  return data;
}

export async function getTransactionSummary(startDate?: string, endDate?: string): Promise<TransactionSummary> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const { data } = await client.get(`/transactions/summary?${params.toString()}`);
  return data.data;
}

export async function getCategories(): Promise<string[]> {
  const { data } = await client.get('/transactions/categories');
  return data.data;
}

export async function updateTransactionCategory(id: string, category: string): Promise<void> {
  await client.patch(`/transactions/${id}/category`, { category });
}

export async function deleteTransaction(id: string): Promise<void> {
  await client.delete(`/transactions/${id}`);
}
