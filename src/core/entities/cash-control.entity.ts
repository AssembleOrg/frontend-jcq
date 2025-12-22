export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO String
  categoryId: string;
  category?: ExpenseCategory; // Relación opcional 
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  date: string | Date; // Permite Date object del form o ISO string
  categoryId: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface CreateExpenseCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateExpenseCategoryDto extends Partial<CreateExpenseCategoryDto> {}

// --- Filtros (Query Params) ---

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  search?: string;      
  categoryId?: string;  
  dateFrom?: string;    
  dateTo?: string;
  minAmount?: number;   
  maxAmount?: number;
}

export interface ExpenseCategoryFilters {
  page?: number;
  limit?: number;
  search?: string; 
  name?: string;   
}