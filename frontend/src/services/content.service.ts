import { apiClient } from './api';
import { Trainer, Testimonial, FAQ, BusinessConfig } from '../types';

export interface EnquiryPayload {
  name: string;
  email?: string;
  phone: string;
  mother_tongue_interest?: string;
  subject?: string;
  message: string;
  website_hp?: string;
}

export const contentService = {
  async getBusinessConfig(): Promise<BusinessConfig> {
    const response = await apiClient.get<BusinessConfig>('/config/');
    return response.data;
  },

  async getTrainers(): Promise<Trainer[]> {
    const response = await apiClient.get<Trainer[]>('/content/trainers/');
    return response.data;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const response = await apiClient.get<Testimonial[]>('/content/testimonials/');
    return response.data;
  },

  async getFAQs(category?: string): Promise<FAQ[]> {
    const response = await apiClient.get<FAQ[]>('/content/faqs/', {
      params: category ? { category } : undefined,
    });
    return response.data;
  },

  async submitEnquiry(data: EnquiryPayload): Promise<{ message: string; status: string }> {
    const response = await apiClient.post('/enquiries/', data);
    return response.data;
  },
};
