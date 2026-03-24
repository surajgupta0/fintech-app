import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { TransactionFilters, TransactionSummary, PaginatedResponse } from '../../types';
import { Prisma } from '@prisma/client';

export async function getTransactions(
  userId: string,
  filters: TransactionFilters
): Promise<PaginatedResponse<any>> {
  const { startDate, endDate, category, type, page, limit } = filters;

  const where: Prisma.TransactionWhereInput = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  if (category) where.category = category;
  if (type) where.type = type;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        date: true,
        description: true,
        amount: true,
        type: true,
        category: true,
        classifierLevel: true,
        confidence: true,
        createdAt: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTransactionSummary(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TransactionSummary> {
  const where: Prisma.TransactionWhereInput = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  // Get all matching transactions
  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      date: true,
      description: true,
      amount: true,
      type: true,
      category: true,
    },
  });

  // Calculate totals
  let totalDebit = 0;
  let totalCredit = 0;
  const categoryMap = new Map<string, { total: number; count: number }>();
  const monthMap = new Map<string, { debit: number; credit: number }>();
  const merchantMap = new Map<string, { total: number; count: number }>();

  for (const txn of transactions) {
    const amount = Number(txn.amount);

    if (txn.type === 'DEBIT') {
      totalDebit += amount;
    } else {
      totalCredit += amount;
    }

    // By category
    const catEntry = categoryMap.get(txn.category) || { total: 0, count: 0 };
    catEntry.total += amount;
    catEntry.count += 1;
    categoryMap.set(txn.category, catEntry);

    // By month
    const monthKey = `${txn.date.getFullYear()}-${String(txn.date.getMonth() + 1).padStart(2, '0')}`;
    const monthEntry = monthMap.get(monthKey) || { debit: 0, credit: 0 };
    if (txn.type === 'DEBIT') {
      monthEntry.debit += amount;
    } else {
      monthEntry.credit += amount;
    }
    monthMap.set(monthKey, monthEntry);

    // Top merchants (take first 50 chars of description as key)
    const merchantKey = txn.description.substring(0, 50).toLowerCase();
    const merchantEntry = merchantMap.get(merchantKey) || { total: 0, count: 0 };
    merchantEntry.total += amount;
    merchantEntry.count += 1;
    merchantMap.set(merchantKey, merchantEntry);
  }

  // Format results
  const byCategory = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total);

  const byMonth = Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topMerchants = Array.from(merchantMap.entries())
    .map(([description, data]) => ({ description, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    byCategory,
    byMonth,
    topMerchants,
  };
}

export async function getCategories(userId: string): Promise<string[]> {
  const results = await prisma.transaction.findMany({
    where: { userId },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return results.map((r) => r.category);
}

export async function updateCategory(
  transactionId: string,
  userId: string,
  category: string
): Promise<void> {
  const txn = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!txn) {
    throw new AppError('Transaction not found', 404);
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      category,
      classifierLevel: 0, // manual
      confidence: 1.0,
    },
  });
}

export async function deleteTransaction(
  transactionId: string,
  userId: string
): Promise<void> {
  const txn = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!txn) {
    throw new AppError('Transaction not found', 404);
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });
}
