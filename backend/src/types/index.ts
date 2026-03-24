import { TransactionType, UploadStatus } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: TransactionType;
  page: number;
  limit: number;
}

export interface TransactionSummary {
  totalDebit: number;
  totalCredit: number;
  byCategory: { category: string; total: number; count: number }[];
  byMonth: { month: string; debit: number; credit: number }[];
  topMerchants: { description: string; total: number; count: number }[];
}

export interface UploadResult {
  uploadId: string;
  totalRows: number;
  inserted: number;
  duplicates: number;
  errors: string[];
  skipped: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export { TransactionType, UploadStatus };
