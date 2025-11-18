import api from './api';
import { SalesReport, ReportPeriod } from '@/types';

export interface ReportFilters {
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  storeId?: string;
  cashierId?: string;
  cashRegisterId?: string;
}

export const reportService = {
  async getSalesReport(filters: ReportFilters): Promise<SalesReport> {
    const response = await api.get<SalesReport>('/reports/sales', { params: filters });
    return response.data;
  },

  async getDailySalesReport(date: string, storeId?: string): Promise<SalesReport> {
    const response = await api.get<SalesReport>('/reports/sales/daily', {
      params: { date, storeId },
    });
    return response.data;
  },

  async getWeeklySalesReport(startDate: string, storeId?: string): Promise<SalesReport> {
    const response = await api.get<SalesReport>('/reports/sales/weekly', {
      params: { startDate, storeId },
    });
    return response.data;
  },

  async getMonthlySalesReport(year: number, month: number, storeId?: string): Promise<SalesReport> {
    const response = await api.get<SalesReport>('/reports/sales/monthly', {
      params: { year, month, storeId },
    });
    return response.data;
  },

  async getCashierReport(cashierId: string, startDate: string, endDate: string): Promise<{
    cashierId: string;
    cashierName: string;
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    ordersPerDay: Record<string, number>;
  }> {
    const response = await api.get(`/reports/cashier/${cashierId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getCashRegisterReport(registerId: string, startDate: string, endDate: string): Promise<{
    registerId: string;
    registerName: string;
    totalSales: number;
    totalOrders: number;
    paymentMethodBreakdown: Record<string, number>;
    hourlyDistribution: Record<string, number>;
  }> {
    const response = await api.get(`/reports/cash-register/${registerId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getStoreReport(storeId: string, startDate: string, endDate: string): Promise<{
    storeId: string;
    storeName: string;
    totalSales: number;
    totalOrders: number;
    topProducts: Array<{ productName: string; quantity: number; revenue: number }>;
    topCashiers: Array<{ cashierName: string; sales: number }>;
  }> {
    const response = await api.get(`/reports/store/${storeId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async exportReport(filters: ReportFilters, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await api.get('/reports/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },
};
