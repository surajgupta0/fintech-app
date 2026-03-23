export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category: string;
  classifierLevel: number;
  confidence: number;
  createdAt: string;
}

export interface TransactionSummary {
  totalDebit: number;
  totalCredit: number;
  byCategory: CategoryBreakdown[];
  byMonth: MonthlyBreakdown[];
  topMerchants: MerchantBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyBreakdown {
  month: string;
  debit: number;
  credit: number;
}

export interface MerchantBreakdown {
  description: string;
  total: number;
  count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UploadResult {
  uploadId: string;
  totalRows: number;
  inserted: number;
  duplicates: number;
  errors: string[];
  skipped: number;
}

export interface UploadRecord {
  id: string;
  originalName: string;
  rowCount: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  createdAt: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'DEBIT' | 'CREDIT';
  page?: number;
  limit?: number;
}
