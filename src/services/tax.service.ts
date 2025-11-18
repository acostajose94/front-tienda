import api from './api';
import { Tax } from '@/types';

export const taxService = {
  async getTaxes(): Promise<Tax[]> {
    const response = await api.get<Tax[]>('/taxes');
    return response.data;
  },

  async getTaxById(id: string): Promise<Tax> {
    const response = await api.get<Tax>(`/taxes/${id}`);
    return response.data;
  },

  async createTax(tax: Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tax> {
    const response = await api.post<Tax>('/taxes', tax);
    return response.data;
  },

  async updateTax(id: string, tax: Partial<Tax>): Promise<Tax> {
    const response = await api.put<Tax>(`/taxes/${id}`, tax);
    return response.data;
  },

  async deleteTax(id: string): Promise<void> {
    await api.delete(`/taxes/${id}`);
  },

  async getActiveTaxes(): Promise<Tax[]> {
    const response = await api.get<Tax[]>('/taxes/active');
    return response.data;
  },
};
