import type {
  ApiResponse,
  Expense,
  ExpenseCategory,
  CreateExpenseDto,
  UpdateExpenseDto,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  ExpenseFilters,
  ExpenseCategoryFilters,
} from '@/src/core/entities'; 
import apiClient from './client';

export const cashControlApi = {
  // --- GASTOS (Expenses) ---

  async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    const { data } = await apiClient.get<ApiResponse<Expense[]>>('/cashControl/expenses', {
      params: filters,
    });
    return data.data;
  },

  async getExpensesPaginated(filters?: ExpenseFilters): Promise<ApiResponse<Expense[]>> {
    const { data } = await apiClient.get<ApiResponse<Expense[]>>('/cashControl/expenses/pagination', {
      params: filters,
    });
    return data; 
  },

  async createExpense(expenseData: CreateExpenseDto): Promise<Expense> {
    const { data } = await apiClient.post<ApiResponse<Expense>>('/cashControl/expenses', expenseData);
    return data.data;
  },

  async updateExpense(id: string, expenseData: UpdateExpenseDto): Promise<Expense> {
    const { data } = await apiClient.patch<ApiResponse<Expense>>(`/cashControl/expenses/${id}`, expenseData);
    return data.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/cashControl/expenses/${id}`);
  },

  // --- CATEGORÍAS (Categories) ---

  async getCategories(filters?: ExpenseCategoryFilters): Promise<ExpenseCategory[]> {
    const { data } = await apiClient.get<ApiResponse<ExpenseCategory[]>>('/cashControl/categories', {
      params: filters,
    });
    return data.data;
  },

  async createCategory(categoryData: CreateExpenseCategoryDto): Promise<ExpenseCategory> {
    const { data } = await apiClient.post<ApiResponse<ExpenseCategory>>('/cashControl/categories', categoryData);
    return data.data;
  },

  async updateCategory(id: string, categoryData: UpdateExpenseCategoryDto): Promise<ExpenseCategory> {
    const { data } = await apiClient.patch<ApiResponse<ExpenseCategory>>(`/cashControl/categories/${id}`, categoryData);
    return data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/cashControl/categories/${id}`);
  },
};