import api from './api';
import { InventoryPrediction } from '@/types';

export const inventoryPredictionService = {
  async getPredictions(storeId?: string): Promise<InventoryPrediction[]> {
    const params = storeId ? { storeId } : {};
    const response = await api.get<InventoryPrediction[]>('/inventory/predictions', { params });
    return response.data;
  },

  async getPredictionForProduct(productId: string): Promise<InventoryPrediction> {
    const response = await api.get<InventoryPrediction>(`/inventory/predictions/${productId}`);
    return response.data;
  },

  async getLowStockAlerts(threshold?: number, storeId?: string): Promise<Array<{
    productId: string;
    productName: string;
    currentStock: number;
    minStock: number;
    daysUntilStockout: number;
  }>> {
    const response = await api.get('/inventory/low-stock-alerts', {
      params: { threshold, storeId },
    });
    return response.data;
  },

  async getReorderSuggestions(storeId?: string): Promise<Array<{
    productId: string;
    productName: string;
    currentStock: number;
    recommendedQuantity: number;
    estimatedCost: number;
    priority: 'high' | 'medium' | 'low';
  }>> {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/inventory/reorder-suggestions', { params });
    return response.data;
  },

  async getSeasonalTrends(productId: string): Promise<{
    productId: string;
    productName: string;
    monthlyAverageSales: Record<string, number>;
    seasonalityFactor: Record<string, number>;
  }> {
    const response = await api.get(`/inventory/seasonal-trends/${productId}`);
    return response.data;
  },

  async getDemandForecast(productId: string, days: number = 30): Promise<{
    productId: string;
    productName: string;
    forecast: Array<{ date: string; predictedDemand: number; confidence: number }>;
  }> {
    const response = await api.get(`/inventory/demand-forecast/${productId}`, {
      params: { days },
    });
    return response.data;
  },

  async generatePredictions(storeId?: string): Promise<{ message: string; predictionsGenerated: number }> {
    const response = await api.post('/inventory/generate-predictions', { storeId });
    return response.data;
  },
};
