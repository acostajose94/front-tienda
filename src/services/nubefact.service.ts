import api from './api';
import {
  Invoice,
  NubefactInvoiceRequest,
  NubefactInvoiceResponse,
  NubefactConfig,
  InvoiceType,
  InvoiceStatus,
} from '@/types';

export const nubefactService = {
  // ============================================
  // CONFIGURACIÓN
  // ============================================
  async getConfig(): Promise<NubefactConfig> {
    const response = await api.get<NubefactConfig>('/nubefact/config');
    return response.data;
  },

  async updateConfig(config: Partial<NubefactConfig>): Promise<NubefactConfig> {
    const response = await api.put<NubefactConfig>('/nubefact/config', config);
    return response.data;
  },

  // ============================================
  // COMPROBANTES
  // ============================================
  async getInvoices(filters?: {
    startDate?: string;
    endDate?: string;
    type?: InvoiceType;
    status?: InvoiceStatus;
    customerDocument?: string;
  }): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>('/invoices', { params: filters });
    return response.data;
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  async getInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
    const response = await api.get<Invoice>(`/invoices/order/${orderId}`);
    return response.data;
  },

  // ============================================
  // GENERAR COMPROBANTES
  // ============================================
  async generateInvoice(
    orderId: string,
    data: {
      type: InvoiceType;
      customerDocumentType: string;
      customerDocumentNumber: string;
      customerName: string;
      customerAddress: string;
      customerEmail?: string;
      notes?: string;
    }
  ): Promise<Invoice> {
    const response = await api.post<Invoice>(`/invoices/generate/${orderId}`, data);
    return response.data;
  },

  async sendToSunat(invoiceId: string): Promise<NubefactInvoiceResponse> {
    const response = await api.post<NubefactInvoiceResponse>(
      `/invoices/${invoiceId}/send-to-sunat`
    );
    return response.data;
  },

  async sendToCustomer(invoiceId: string, email?: string): Promise<void> {
    await api.post(`/invoices/${invoiceId}/send-to-customer`, { email });
  },

  // ============================================
  // NOTAS DE CRÉDITO / DÉBITO
  // ============================================
  async generateCreditNote(
    invoiceId: string,
    data: {
      reason: string;
      items: {
        productId: string;
        quantity: number;
        price: number;
      }[];
      notes?: string;
    }
  ): Promise<Invoice> {
    const response = await api.post<Invoice>(
      `/invoices/${invoiceId}/credit-note`,
      data
    );
    return response.data;
  },

  async generateDebitNote(
    invoiceId: string,
    data: {
      reason: string;
      additionalAmount: number;
      description: string;
      notes?: string;
    }
  ): Promise<Invoice> {
    const response = await api.post<Invoice>(
      `/invoices/${invoiceId}/debit-note`,
      data
    );
    return response.data;
  },

  // ============================================
  // ANULAR COMPROBANTE
  // ============================================
  async cancelInvoice(invoiceId: string, reason: string): Promise<Invoice> {
    const response = await api.post<Invoice>(`/invoices/${invoiceId}/cancel`, {
      reason,
    });
    return response.data;
  },

  // ============================================
  // DESCARGAR ARCHIVOS
  // ============================================
  async downloadPDF(invoiceId: string): Promise<Blob> {
    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadXML(invoiceId: string): Promise<Blob> {
    const response = await api.get(`/invoices/${invoiceId}/xml`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadCDR(invoiceId: string): Promise<Blob> {
    const response = await api.get(`/invoices/${invoiceId}/cdr`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ============================================
  // CONSULTAS SUNAT
  // ============================================
  async consultSunatStatus(invoiceId: string): Promise<{
    accepted: boolean;
    description: string;
    note?: string;
  }> {
    const response = await api.get(`/invoices/${invoiceId}/sunat-status`);
    return response.data;
  },

  async getNextInvoiceNumber(type: InvoiceType): Promise<{
    serie: string;
    numero: string;
  }> {
    const response = await api.get(`/invoices/next-number/${type}`);
    return response.data;
  },

  // ============================================
  // REPORTES
  // ============================================
  async getInvoiceReport(filters: {
    startDate: string;
    endDate: string;
    type?: InvoiceType;
  }): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
    totalAmount: number;
    totalIGV: number;
    byType: Record<
      string,
      {
        count: number;
        amount: number;
      }
    >;
  }> {
    const response = await api.get('/invoices/report', { params: filters });
    return response.data;
  },

  async exportInvoiceReport(
    filters: {
      startDate: string;
      endDate: string;
      type?: InvoiceType;
    },
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<Blob> {
    const response = await api.get('/invoices/report/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },
};
