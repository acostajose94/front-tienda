import api from './api';
import {
  ProfitReport,
  TaxReport,
  PayrollReport,
  ExpenseReport,
  CashFlowReport,
  ProductProfitabilityReport,
  Employee,
  Expense,
} from '@/types';

export interface FinancialReportFilters {
  startDate: string;
  endDate: string;
  storeId?: string;
  categoryId?: string;
}

export const financialReportService = {
  // ============================================
  // REPORTES DE GANANCIAS
  // ============================================
  async getProfitReport(filters: FinancialReportFilters): Promise<ProfitReport> {
    const response = await api.get<ProfitReport>('/reports/financial/profit', {
      params: filters,
    });
    return response.data;
  },

  // ============================================
  // REPORTES DE IMPUESTOS
  // ============================================
  async getTaxReport(filters: FinancialReportFilters): Promise<TaxReport> {
    const response = await api.get<TaxReport>('/reports/financial/tax', {
      params: filters,
    });
    return response.data;
  },

  async exportTaxDeclaration(filters: FinancialReportFilters, format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await api.get('/reports/financial/tax/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  // ============================================
  // REPORTES DE NÓMINA
  // ============================================
  async getPayrollReport(filters: FinancialReportFilters): Promise<PayrollReport> {
    const response = await api.get<PayrollReport>('/reports/financial/payroll', {
      params: filters,
    });
    return response.data;
  },

  async exportPayrollReport(filters: FinancialReportFilters, format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await api.get('/reports/financial/payroll/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  // ============================================
  // REPORTES DE GASTOS
  // ============================================
  async getExpenseReport(filters: FinancialReportFilters): Promise<ExpenseReport> {
    const response = await api.get<ExpenseReport>('/reports/financial/expenses', {
      params: filters,
    });
    return response.data;
  },

  // ============================================
  // REPORTES DE FLUJO DE CAJA
  // ============================================
  async getCashFlowReport(filters: FinancialReportFilters): Promise<CashFlowReport> {
    const response = await api.get<CashFlowReport>('/reports/financial/cash-flow', {
      params: filters,
    });
    return response.data;
  },

  // ============================================
  // REPORTES DE RENTABILIDAD POR PRODUCTO
  // ============================================
  async getProductProfitabilityReport(filters: FinancialReportFilters): Promise<ProductProfitabilityReport[]> {
    const response = await api.get<ProductProfitabilityReport[]>('/reports/financial/product-profitability', {
      params: filters,
    });
    return response.data;
  },

  // ============================================
  // EXPORTAR REPORTES
  // ============================================
  async exportFinancialReport(
    type: string,
    filters: FinancialReportFilters,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<Blob> {
    const response = await api.get(`/reports/financial/${type}/export`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  // ============================================
  // GESTIÓN DE EMPLEADOS
  // ============================================
  async getEmployees(): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees');
    return response.data;
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const response = await api.post<Employee>('/employees', employee);
    return response.data;
  },

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    const response = await api.put<Employee>(`/employees/${id}`, employee);
    return response.data;
  },

  async deleteEmployee(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  // ============================================
  // GESTIÓN DE GASTOS
  // ============================================
  async getExpenses(filters?: { startDate?: string; endDate?: string; category?: string }): Promise<Expense[]> {
    const response = await api.get<Expense[]>('/expenses', { params: filters });
    return response.data;
  },

  async getExpenseById(id: string): Promise<Expense> {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const response = await api.post<Expense>('/expenses', expense);
    return response.data;
  },

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const response = await api.put<Expense>(`/expenses/${id}`, expense);
    return response.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
