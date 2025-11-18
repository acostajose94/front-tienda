import api from './api';
import { Order, OrderStatus, CashRegister } from '@/types';

export const orderService = {
  // Órdenes
  async getOrders(filters?: {
    storeId?: string;
    cashRegisterId?: string;
    cashierId?: string;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders', { params: filters });
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response = await api.post<Order>('/orders', order);
    return response.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  async refundOrder(id: string, reason?: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/refund`, { reason });
    return response.data;
  },

  // Cajas registradoras
  async getCashRegisters(storeId?: string): Promise<CashRegister[]> {
    const params = storeId ? { storeId } : {};
    const response = await api.get<CashRegister[]>('/cash-registers', { params });
    return response.data;
  },

  async getCashRegisterById(id: string): Promise<CashRegister> {
    const response = await api.get<CashRegister>(`/cash-registers/${id}`);
    return response.data;
  },

  async createCashRegister(data: Omit<CashRegister, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance' | 'openedAt' | 'closedAt' | 'openedBy' | 'closedBy'>): Promise<CashRegister> {
    const response = await api.post<CashRegister>('/cash-registers', data);
    return response.data;
  },

  async openCashRegister(id: string, openingBalance: number): Promise<CashRegister> {
    const response = await api.post<CashRegister>(`/cash-registers/${id}/open`, { openingBalance });
    return response.data;
  },

  async closeCashRegister(id: string, closingBalance: number): Promise<CashRegister> {
    const response = await api.post<CashRegister>(`/cash-registers/${id}/close`, { closingBalance });
    return response.data;
  },

  async getCashRegisterSummary(id: string, startDate?: string, endDate?: string): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    paymentMethodBreakdown: Record<string, number>;
  }> {
    const response = await api.get(`/cash-registers/${id}/summary`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
