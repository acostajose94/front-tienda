import api from './api';
import { Store } from '@/types';

export const storeService = {
  async getStores(): Promise<Store[]> {
    const response = await api.get<Store[]>('/stores');
    return response.data;
  },

  async getStoreById(id: string): Promise<Store> {
    const response = await api.get<Store>(`/stores/${id}`);
    return response.data;
  },

  async createStore(store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> {
    const response = await api.post<Store>('/stores', store);
    return response.data;
  },

  async updateStore(id: string, store: Partial<Store>): Promise<Store> {
    const response = await api.put<Store>(`/stores/${id}`, store);
    return response.data;
  },

  async deleteStore(id: string): Promise<void> {
    await api.delete(`/stores/${id}`);
  },

  async activateStore(id: string): Promise<Store> {
    const response = await api.patch<Store>(`/stores/${id}/activate`);
    return response.data;
  },

  async deactivateStore(id: string): Promise<Store> {
    const response = await api.patch<Store>(`/stores/${id}/deactivate`);
    return response.data;
  },
};
