import api from './api';
import { Discount } from '@/types';

export const discountService = {
  async getDiscounts(): Promise<Discount[]> {
    const response = await api.get<Discount[]>('/discounts');
    return response.data;
  },

  async getDiscountById(id: string): Promise<Discount> {
    const response = await api.get<Discount>(`/discounts/${id}`);
    return response.data;
  },

  async getDiscountByCode(code: string): Promise<Discount | null> {
    const response = await api.get<Discount>(`/discounts/code/${code}`);
    return response.data;
  },

  async createDiscount(discount: Omit<Discount, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Discount> {
    const response = await api.post<Discount>('/discounts', discount);
    return response.data;
  },

  async updateDiscount(id: string, discount: Partial<Discount>): Promise<Discount> {
    const response = await api.put<Discount>(`/discounts/${id}`, discount);
    return response.data;
  },

  async deleteDiscount(id: string): Promise<void> {
    await api.delete(`/discounts/${id}`);
  },

  async getActiveDiscounts(): Promise<Discount[]> {
    const response = await api.get<Discount[]>('/discounts/active');
    return response.data;
  },

  async validateDiscount(code: string, totalAmount: number): Promise<{ valid: boolean; discount?: Discount; message?: string }> {
    const response = await api.post<{ valid: boolean; discount?: Discount; message?: string }>('/discounts/validate', {
      code,
      totalAmount,
    });
    return response.data;
  },
};
