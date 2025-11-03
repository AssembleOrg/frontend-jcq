export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UserFilters extends PaginationParams {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export interface ClientFilters extends PaginationParams {
  fullname?: string;
  phone?: string;
  cuit?: string;
  dni?: string;
}

export interface ProjectFilters extends PaginationParams {
  clientId?: string;
  status?: string;
  locationAddress?: string;
  workersMin?: number;
  workersMax?: number;
  dateInitFrom?: string;
  dateInitTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface PaidFilters extends PaginationParams {
  projectId?: string;
  bill?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

