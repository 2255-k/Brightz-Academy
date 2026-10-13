// TypeScript interfaces for Bright Mindz Academy LMS

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
  preferred_language: string;
  role: 'student' | 'admin' | 'staff';
  is_verified: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface TeachingLanguage {
  id: number;
  name: string;
  native_name: string;
  code: string;
  is_active: boolean;
  display_order: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  position: number;
  duration_seconds: number;
  formatted_duration: string;
  is_preview: boolean;
  progress?: {
    completed: boolean;
    last_position_seconds: number;
  };
}

export interface Module {
  id: number;
  title: string;
  description: string;
  position: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  description?: string;
  learning_objectives?: string[];
  target_audience?: string;
  proficiency_level: 'foundation' | 'beginner' | 'intermediate' | 'advanced';
  teaching_language: TeachingLanguage;
  price: number;
  discount_price?: number | null;
  effective_price: number;
  estimated_duration_hours: number;
  access_duration_days: number;
  thumbnail_url?: string;
  trainer_name: string;
  trainer_title: string;
  is_featured: boolean;
  total_lessons_count: number;
  total_duration_minutes: number;
  modules?: Module[];
  is_enrolled?: boolean;
  progress_percentage?: number;
  next_lesson?: {
    id: number;
    title: string;
    module_title: string;
  } | null;
}

export interface PlaybackResponse {
  is_authorized: boolean;
  is_preview: boolean;
  lesson: {
    id: number;
    title: string;
    description: string;
    duration_seconds: number;
    module_id: number;
    module_title: string;
    course_id: number;
    course_title: string;
    course_slug: string;
  };
  last_position_seconds: number;
  playback: {
    provider: string;
    video_id: string;
    signed_token?: string;
    stream_url?: string;
    iframe_url?: string;
    expires_at: number;
    is_mock_stream?: boolean;
    note?: string;
  };
  error?: string;
}

export interface StudentDashboardData {
  student: {
    id: number;
    full_name: string;
    email: string;
    preferred_language: string;
  };
  enrolled_courses: Course[];
  continue_learning?: {
    lesson_id: number;
    lesson_title: string;
    module_title: string;
    course_title: string;
    course_slug: string;
    last_position_seconds: number;
    completed: boolean;
  } | null;
  stats: {
    total_enrolled: number;
    total_orders: number;
  };
}

export interface OrderRecord {
  order_reference: string;
  course_title: string;
  course_slug: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface Trainer {
  id: number;
  name: string;
  title: string;
  bio: string;
  languages_spoken: string;
  experience_years: number;
  photo_url?: string;
  display_order: number;
}

export interface Testimonial {
  id: number;
  student_name: string;
  role_or_location: string;
  mother_tongue: string;
  course_name: string;
  quote: string;
  rating: number;
  is_demo: boolean;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'courses' | 'payments' | 'technical';
  category_display: string;
  display_order: number;
}

export interface BusinessConfig {
  academy_name: string;
  academy_domain: string;
  academy_location: string;
  whatsapp_phone_number: string;
  whatsapp_default_message: string;
  support_email: string;
  razorpay_key_id: string;
  currency: string;
}
