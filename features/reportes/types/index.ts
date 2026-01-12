export interface BalanceData {
  current: number;
  totalIncome: number;
  totalExpense: number;
}

export interface AggregatedData {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ReportStatistics {
  totalMovements: number;
  incomeCount: number;
  expenseCount: number;
  averageIncome: number;
  averageExpense: number;
}

export interface GetReportsResponse {
  balance: BalanceData;
  aggregated: AggregatedData[];
  statistics: ReportStatistics;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
  userId?: string;
}
