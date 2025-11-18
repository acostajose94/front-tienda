import api from './api';
import { Customer, CustomerAnalytics } from '@/types';

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const response = await api.get<Customer[]>('/customers');
    return response.data;
  },

  async getCustomerById(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const response = await api.get<Customer[]>('/customers/search', { params: { query } });
    return response.data;
  },

  async searchByDocument(documentType: string, documentNumber: string): Promise<Customer | null> {
    const response = await api.get<Customer>('/customers/search/document', {
      params: { documentType, documentNumber },
    });
    return response.data;
  },

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalPurchases'>): Promise<Customer> {
    const response = await api.post<Customer>('/customers', customer);
    return response.data;
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await api.put<Customer>(`/customers/${id}`, customer);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async getCustomerAnalytics(id: string): Promise<CustomerAnalytics> {
    const response = await api.get<CustomerAnalytics>(`/customers/${id}/analytics`);
    return response.data;
  },

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    const response = await api.get<Customer[]>('/customers/top', { params: { limit } });
    return response.data;
  },
};
