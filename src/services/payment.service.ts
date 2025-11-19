import api from './api';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe Configuration
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
let stripePromise: Promise<Stripe | null> | null = null;

// Culqi Configuration
const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY || '';

declare global {
  interface Window {
    Culqi: any;
  }
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  CULQI = 'CULQI',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface CulqiToken {
  id: string;
  type: string;
  email: string;
  creation_date: number;
}

export const paymentService = {
  // Stripe Methods
  async loadStripe(): Promise<Stripe | null> {
    if (!stripePromise && STRIPE_PUBLIC_KEY) {
      stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
    }
    return stripePromise;
  },

  async createStripePaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    const response = await api.post<PaymentIntent>('/payments/stripe/create-intent', {
      amount,
      currency,
    });
    return response.data;
  },

  async confirmStripePayment(paymentIntentId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/payments/stripe/confirm', {
      paymentIntentId,
    });
    return response.data;
  },

  async createStripeCheckoutSession(orderId: string, amount: number): Promise<{ sessionId: string; url: string }> {
    const response = await api.post('/payments/stripe/create-checkout-session', {
      orderId,
      amount,
    });
    return response.data;
  },

  // Culqi Methods
  loadCulqiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Culqi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.culqi.com/js/v4';
      script.onload = () => {
        if (window.Culqi) {
          window.Culqi.publicKey = CULQI_PUBLIC_KEY;
          resolve();
        } else {
          reject(new Error('Culqi not loaded'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Culqi'));
      document.head.appendChild(script);
    });
  },

  async configureCulqi(options: {
    title: string;
    currency: string;
    amount: number;
    onSuccess: (token: CulqiToken) => void;
    onError: (error: any) => void;
  }): Promise<void> {
    await this.loadCulqiScript();

    if (window.Culqi) {
      window.Culqi.settings({
        title: options.title,
        currency: options.currency,
        amount: options.amount,
      });

      window.Culqi.options({
        lang: 'es',
        installments: false,
        style: {
          logo: '',
          maincolor: '#3b82f6',
          buttontext: '#ffffff',
          maintext: '#4a5568',
          desctext: '#718096',
        },
      });
    }
  },

  openCulqiCheckout(): void {
    if (window.Culqi) {
      window.Culqi.open();
    }
  },

  async createCulqiCharge(token: string, amount: number, email: string): Promise<{ id: string; success: boolean }> {
    const response = await api.post('/payments/culqi/create-charge', {
      token,
      amount,
      email,
    });
    return response.data;
  },

  async validateCulqiToken(token: string): Promise<{ valid: boolean }> {
    const response = await api.post('/payments/culqi/validate-token', {
      token,
    });
    return response.data;
  },

  // Generic Payment Methods
  async processPayment(provider: PaymentProvider, data: any): Promise<{ success: boolean; transactionId?: string; message: string }> {
    const response = await api.post('/payments/process', {
      provider,
      ...data,
    });
    return response.data;
  },

  async getPaymentMethods(): Promise<Array<{
    id: string;
    name: string;
    provider: PaymentProvider;
    isActive: boolean;
    logo?: string;
  }>> {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  async getPaymentStatus(transactionId: string): Promise<{
    id: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount: number;
    provider: PaymentProvider;
  }> {
    const response = await api.get(`/payments/status/${transactionId}`);
    return response.data;
  },

  // Cash and Transfer Methods
  async registerCashPayment(orderId: string, amount: number): Promise<{ success: boolean; receiptId: string }> {
    const response = await api.post('/payments/cash', {
      orderId,
      amount,
    });
    return response.data;
  },

  async registerTransferPayment(orderId: string, amount: number, referenceNumber: string): Promise<{ success: boolean; receiptId: string }> {
    const response = await api.post('/payments/transfer', {
      orderId,
      amount,
      referenceNumber,
    });
    return response.data;
  },

  // Refunds
  async requestRefund(transactionId: string, amount?: number, reason?: string): Promise<{ success: boolean; refundId: string }> {
    const response = await api.post('/payments/refund', {
      transactionId,
      amount,
      reason,
    });
    return response.data;
  },
};
