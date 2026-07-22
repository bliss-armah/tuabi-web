export interface DebtHistory {
  id: number;
  debtorId: number;
  debtorName: string;
  type: "DEBT_ADDED" | "PAYMENT_RECEIVED";
  amount: number;
  previousBalance: number;
  newBalance: number;
  note?: string;
  createdAt: string;
}

export interface Debtor {
  id: number;
  name: string;
  amountOwed: number;
  description?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentTransactionsActivity {
  id: number;
  debtorName: string;
  action: string;
  amountChanged: number;
  createdAt: string;
  updatedAt: string;
}

export interface DebtorResponse {
  success: boolean;
  message: string;
  data: Debtor;
}

export interface DebtorsListResponse {
  success: boolean;
  message: string;
  data: Debtor[];
  total: number;
  hasMore: boolean;
}

export interface DashboardSummary {
  totalDebtors: number;
  totalAmountOwed: number;
  overdueDebtors: number;
  overdueAmount: number;
  recentPayments: number;
  averageDebtAmount: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: DashboardSummary;
    recentActivities: RecentTransactionsActivity[];
    trends: {
      averageDebtPerDebtor: number;
    };
  };
}

export interface DebtHistoryResponse {
  success: boolean;
  data: DebtHistory[];
}

export interface CreateDebtorRequest {
  name: string;
  amountOwed: number;
  description?: string;
  phoneNumber?: string;
}

export interface UpdateDebtorRequest {
  name?: string;
  amountOwed?: number;
  description?: string;
  phoneNumber?: string;
}

export interface DebtorAmountUpdateRequest {
  amount: number;
  note?: string;
}

export interface DebtorQueryParams {
  search?: string;
  sortBy?: "name" | "amountOwed" | "createdAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
