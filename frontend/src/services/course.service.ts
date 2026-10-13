import { apiClient } from './api';
import { Course, TeachingLanguage } from '../types';

export const courseService = {
  async getLanguages(): Promise<TeachingLanguage[]> {
    const response = await apiClient.get<TeachingLanguage[]>('/courses/languages/');
    return response.data;
  },

  async getCourses(params?: {
    language?: string;
    level?: string;
    search?: string;
    featured?: boolean;
    page?: number;
  }): Promise<{ results: Course[]; count: number }> {
    const response = await apiClient.get('/courses/', { params });
    // Handle both paginated results and direct array response
    if (Array.isArray(response.data)) {
      return { results: response.data, count: response.data.length };
    }
    return response.data;
  },

  async getCourseBySlug(slug: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${slug}/`);
    return response.data;
  },
};
