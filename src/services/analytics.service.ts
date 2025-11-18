import api from './api';
import { PurchaseTrend, CustomerAnalytics } from '@/types';

export const analyticsService = {
  async getPurchaseTrends(startDate: string, endDate: string, storeId?: string): Promise<PurchaseTrend[]> {
    const response = await api.get<PurchaseTrend[]>('/analytics/trends', {
      params: { startDate, endDate, storeId },
    });
    return response.data;
  },

  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    const response = await api.get<CustomerAnalytics>(`/analytics/customers/${customerId}`);
    return response.data;
  },

  async getTopSellingProducts(limit: number = 10, startDate?: string, endDate?: string, storeId?: string): Promise<Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>> {
    const response = await api.get('/analytics/products/top-selling', {
      params: { limit, startDate, endDate, storeId },
    });
    return response.data;
  },

  async getProductPerformance(productId: string, startDate: string, endDate: string): Promise<{
    productId: string;
    productName: string;
    totalSales: number;
    totalRevenue: number;
    averagePrice: number;
    salesTrend: Array<{ date: string; quantity: number; revenue: number }>;
  }> {
    const response = await api.get(`/analytics/products/${productId}/performance`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getCategoryAnalytics(startDate: string, endDate: string, storeId?: string): Promise<Array<{
    category: string;
    totalSales: number;
    totalRevenue: number;
    percentageOfTotal: number;
  }>> {
    const response = await api.get('/analytics/categories', {
      params: { startDate, endDate, storeId },
    });
    return response.data;
  },

  async getSalesHeatmap(startDate: string, endDate: string, storeId?: string): Promise<{
    hourly: Record<string, number>;
    daily: Record<string, number>;
    monthly: Record<string, number>;
  }> {
    const response = await api.get('/analytics/sales-heatmap', {
      params: { startDate, endDate, storeId },
    });
    return response.data;
  },

  async getCustomerSegmentation(): Promise<Array<{
    segment: string;
    customerCount: number;
    averageOrderValue: number;
    totalRevenue: number;
  }>> {
    const response = await api.get('/analytics/customer-segmentation');
    return response.data;
  },

  async getRevenueAnalytics(startDate: string, endDate: string, storeId?: string): Promise<{
    totalRevenue: number;
    averageDailyRevenue: number;
    revenueByPaymentMethod: Record<string, number>;
    revenueTrend: Array<{ date: string; revenue: number }>;
  }> {
    const response = await api.get('/analytics/revenue', {
      params: { startDate, endDate, storeId },
    });
    return response.data;
  },
};
