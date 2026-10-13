import { apiClient } from './api';
import { StudentDashboardData, Course, PlaybackResponse } from '../types';

export const studentService = {
  async getDashboard(): Promise<StudentDashboardData> {
    const response = await apiClient.get<StudentDashboardData>('/student/dashboard/');
    return response.data;
  },

  async getEnrolledCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/student/courses/');
    return response.data;
  },

  async getCourseCurriculum(slug: string): Promise<{
    course: { id: number; title: string; slug: string; is_enrolled: boolean; teaching_language: string };
    modules: any[];
  }> {
    const response = await apiClient.get(`/student/courses/${slug}/curriculum/`);
    return response.data;
  },

  async updateLessonProgress(lessonId: number, data: { last_position_seconds?: number; completed?: boolean }): Promise<{
    lesson_id: number;
    completed: boolean;
    last_position_seconds: number;
    course_progress_percentage: number;
  }> {
    const response = await apiClient.post(`/student/lessons/${lessonId}/progress/`, data);
    return response.data;
  },

  async getLessonPlayback(lessonId: number): Promise<PlaybackResponse> {
    const response = await apiClient.post<PlaybackResponse>(`/lessons/${lessonId}/playback/`);
    return response.data;
  },
};
