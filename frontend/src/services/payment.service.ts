import { apiClient } from './api';
import { OrderRecord } from '../types';

export interface CheckoutOrderData {
  order_reference: string;
  gateway_order_id: string;
  amount: number;
  amount_paise: number;
  currency: string;
  key_id: string;
  course: {
    id: number;
    title: string;
    teaching_language: string;
  };
  student: {
    name: string;
    email: string;
    phone: string;
  };
  is_mock_sandbox: boolean;
}

export interface VerifyPaymentPayload {
  order_reference: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentService = {
  async createPaymentOrder(courseId?: number, courseSlug?: string): Promise<CheckoutOrderData> {
    const response = await apiClient.post<CheckoutOrderData>('/payments/create-order/', {
      course_id: courseId,
      course_slug: courseSlug,
    });
    return response.data;
  },

  async verifyPayment(payload: VerifyPaymentPayload): Promise<{
    message: string;
    order_reference: string;
    course_slug: string;
    enrollment_id: number;
  }> {
    const response = await apiClient.post('/payments/verify/', payload);
    return response.data;
  },

  async getOrderHistory(): Promise<OrderRecord[]> {
    const response = await apiClient.get<OrderRecord[]>('/payments/history/');
    return response.data;
  },

  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};
