import api from './api';
import { Charge } from '@/types';

export const chargeService = {
  async getCharges(): Promise<Charge[]> {
    const response = await api.get<Charge[]>('/charges');
    return response.data;
  },

  async getChargeById(id: string): Promise<Charge> {
    const response = await api.get<Charge>(`/charges/${id}`);
    return response.data;
  },

  async createCharge(charge: Omit<Charge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Charge> {
    const response = await api.post<Charge>('/charges', charge);
    return response.data;
  },

  async updateCharge(id: string, charge: Partial<Charge>): Promise<Charge> {
    const response = await api.put<Charge>(`/charges/${id}`, charge);
    return response.data;
  },

  async deleteCharge(id: string): Promise<void> {
    await api.delete(`/charges/${id}`);
  },

  async getActiveCharges(): Promise<Charge[]> {
    const response = await api.get<Charge[]>('/charges/active');
    return response.data;
  },
};
