import api from './api';
import { Product, ProductCategory } from '@/types';

export const productService = {
  // Productos
  async getProducts(storeId?: string): Promise<Product[]> {
    const params = storeId ? { storeId } : {};
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async searchProducts(query: string, storeId?: string): Promise<Product[]> {
    const params = { query, storeId };
    const response = await api.get<Product[]>('/products/search', { params });
    return response.data;
  },

  // Categorías
  async getCategories(): Promise<ProductCategory[]> {
    const response = await api.get<ProductCategory[]>('/products/categories');
    return response.data;
  },

  async createCategory(category: Omit<ProductCategory, 'id'>): Promise<ProductCategory> {
    const response = await api.post<ProductCategory>('/products/categories', category);
    return response.data;
  },

  async updateCategory(id: string, category: Partial<ProductCategory>): Promise<ProductCategory> {
    const response = await api.put<ProductCategory>(`/products/categories/${id}`, category);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/products/categories/${id}`);
  },
};
