import type { Project } from "./project.entity";

export interface Paid {
  id: string;
  amount: number;
  date: string;
  bill: string;
  projectId: string;
  number: string;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaidDto {
  amount: number;
  date: string;
  bill?: string;
  projectId: string;
}

export interface UpdatePaidDto {
  amount?: number;
  date?: string;
  bill?: string;
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
