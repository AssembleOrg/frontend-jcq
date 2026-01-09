import type { Project } from "./project.entity";

export interface Paid {
  id: string;
  amount: number;
  date: string;
  bill: string;
  projectId: string;
  number: string;
  project?: Project;
  hasUSD: boolean;
  usdValue?: number;
  amountUSD?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaidDto {
  amount: number;
  date: string;
  bill?: string;
  projectId: string;
  hasUSD?: boolean;
  usdValue?: number;
  amountUSD?: number;
}

export interface UpdatePaidDto {
  amount?: number;
  date?: string;
  bill?: string;
  hasUSD?: boolean;
  usdValue?: number;
  amountUSD?: number;
}

export interface PaidFilters {
  page?: number;
  limit?: number;
  projectId?: string;
  bill?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
}
