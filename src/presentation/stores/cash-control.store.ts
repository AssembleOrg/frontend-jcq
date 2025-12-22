import { create } from 'zustand';
import type {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  CreateExpenseDto,
  UpdateExpenseDto,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  PaginationMeta,
  Paid,
} from '@/src/core/entities';
import { cashControlApi } from '@/src/infrastructure/api/cash-control.api';
import { paidsApi } from '@/src/infrastructure/api/paids.api'; // Para los ingresos

interface CashControlState {
  // Estado de Gastos
  expensesList: Expense[];
  selectedExpense: Expense | null;
  expensesMeta: PaginationMeta | null;
  
  // Estado de Categorías
  categoriesList: ExpenseCategory[];
  
  // Estado de Ingresos (Pagos de proyectos)
  incomesList: Paid[];
  
  // Balance General
  totalIncome: number;
  totalExpenses: number;

  // Estados de UI
  isLoading: boolean;
  error: string | null;
  lastFetchTimestamp: number;

  // Actions - Gastos
  fetchExpenses: (filters?: ExpenseFilters) => Promise<void>;
  fetchExpensesPaginated: (filters?: ExpenseFilters) => Promise<void>;
  createExpense: (data: CreateExpenseDto) => Promise<Expense>;
  updateExpense: (id: string, data: UpdateExpenseDto) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  setSelectedExpense: (expense: Expense | null) => void;

  // Actions - Categorías
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateExpenseCategoryDto) => Promise<ExpenseCategory>;
  updateCategory: (id: string, data: UpdateExpenseCategoryDto) => Promise<ExpenseCategory>;
  deleteCategory: (id: string) => Promise<void>;

  // Actions - Balance
  fetchBalanceData: () => Promise<void>; // Carga ingresos y gastos para el dashboard
  clearError: () => void;
}

export const useCashControlStore = create<CashControlState>((set, get) => ({
  expensesList: [],
  selectedExpense: null,
  expensesMeta: null,
  categoriesList: [],
  incomesList: [],
  totalIncome: 0,
  totalExpenses: 0,
  isLoading: false,
  error: null,
  lastFetchTimestamp: 0,

  // --- GASTOS ---

  fetchExpenses: async (filters?: ExpenseFilters) => {
    const currentTimestamp = Date.now();
    if (get().isLoading && currentTimestamp - get().lastFetchTimestamp < 60000) return;

    set({ isLoading: true, error: null });
    try {
      const expenses = await cashControlApi.getExpenses(filters);
      set({ 
        expensesList: expenses, 
        isLoading: false,
        lastFetchTimestamp: currentTimestamp
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar gastos',
      });
    }
  },

  fetchExpensesPaginated: async (filters?: ExpenseFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cashControlApi.getExpensesPaginated(filters);
      set({
        expensesList: response.data as unknown as Expense[], 
        expensesMeta: (response as any).meta || null, 
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar gastos paginados',
      });
    }
  },

  createExpense: async (data: CreateExpenseDto) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await cashControlApi.createExpense(data);
      set((state) => ({
        expensesList: [...state.expensesList, newExpense],
        totalExpenses: state.totalExpenses + Number(newExpense.amount),
        isLoading: false,
      }));
      return newExpense;
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al crear gasto',
      });
      throw error;
    }
  },

  updateExpense: async (id: string, data: UpdateExpenseDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedExpense = await cashControlApi.updateExpense(id, data);
      set((state) => {
        const oldExpense = state.expensesList.find(e => e.id === id);
        let newTotal = state.totalExpenses;
        if (oldExpense) {
            newTotal = state.totalExpenses - Number(oldExpense.amount) + Number(updatedExpense.amount);
        }

        return {
          expensesList: state.expensesList.map((e) => (e.id === id ? updatedExpense : e)),
          selectedExpense: state.selectedExpense?.id === id ? updatedExpense : state.selectedExpense,
          totalExpenses: newTotal,
          isLoading: false,
        };
      });
      return updatedExpense;
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar gasto',
      });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const expenseToDelete = get().expensesList.find(e => e.id === id);
      
      await cashControlApi.deleteExpense(id);
      
      set((state) => ({
        expensesList: state.expensesList.filter((e) => e.id !== id),
        selectedExpense: state.selectedExpense?.id === id ? null : state.selectedExpense,
        totalExpenses: expenseToDelete ? state.totalExpenses - Number(expenseToDelete.amount) : state.totalExpenses,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar gasto',
      });
      throw error;
    }
  },

  setSelectedExpense: (expense) => set({ selectedExpense: expense }),

  // --- CATEGORÍAS ---

  fetchCategories: async () => {
    set({ isLoading: true, error: null }); // Categorías suelen ser ligeras por ende se cargan siempre
    try {
      const categories = await cashControlApi.getCategories();
      set({ categoriesList: categories, isLoading: false });
    } catch (error: unknown) {
      console.error(error); // 
      set({ isLoading: false }); // No bloqueamos la UI global por fallo en categorías
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await cashControlApi.createCategory(data);
      set((state) => ({
        categoriesList: [...state.categoriesList, newCategory],
        isLoading: false
      }));
      return newCategory;
    } catch (error) {
      set({ isLoading: false, error: 'Error creando categoría' });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
     set({ isLoading: true });
     try {
        const updated = await cashControlApi.updateCategory(id, data);
        set(state => ({
            categoriesList: state.categoriesList.map(c => c.id === id ? updated : c),
            isLoading: false
        }));
        return updated;
     } catch (error) {
        set({ isLoading: false, error: 'Error actualizando categoría' });
        throw error;
     }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true });
    try {
        await cashControlApi.deleteCategory(id);
        set(state => ({
            categoriesList: state.categoriesList.filter(c => c.id !== id),
            isLoading: false
        }));
    } catch (error) {
        set({ isLoading: false, error: 'Error eliminando categoría' });
        throw error;
    }
  },

  // --- BALANCE GENERAL (Dashboard) ---

  fetchBalanceData: async () => {
    set({ isLoading: true, error: null });
    try {
        //Cargar Gastos (sin paginación para totales)
        const expenses = await cashControlApi.getExpenses();
        
        //Cargar Ingresos (Pagos de proyectos)
        const paids = await paidsApi.getAll({}); // Trae todos los pagos
        
        //Calcular Totales
        const totalExp = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalInc = (Array.isArray(paids) ? paids : []).reduce((acc, curr) => acc + Number(curr.amount), 0);

        set({
            expensesList: expenses,
            incomesList: Array.isArray(paids) ? paids : [],
            totalExpenses: totalExp,
            totalIncome: totalInc,
            isLoading: false
        });
    } catch (error: unknown) {
        set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error calculando balance de caja',
        });
    }
  },

  clearError: () => set({ error: null }),
}));