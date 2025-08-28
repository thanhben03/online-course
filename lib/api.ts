const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Có lỗi xảy ra',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Lỗi kết nối mạng',
      };
    }
  }

  // Auth APIs
  async login(email: string, password: string) {
    return this.request<{ user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Course APIs
  async getCourses() {
    return this.request<{ courses: any[] }>('/api/courses');
  }

  async getCourse(id: number) {
    return this.request<{ course: any }>(`/api/courses/${id}`);
  }

  async createCourse(courseData: {
    title: string;
    description?: string;
    thumbnail_url?: string;
    price?: number;
    instructor_id: number;
    status?: string;
  }) {
    return this.request('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: number, courseData: Partial<{
    title: string;
    description: string;
    thumbnail_url: string;
    price: number;
    status: string;
  }>) {
    return this.request(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: number) {
    return this.request(`/api/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Database initialization
  async initializeDatabase() {
    return this.request('/api/init-db', {
      method: 'POST',
    });
  }

  // Seed data
  async seedData() {
    return this.request<{ coursesCreated: number; lessonsCreated: number; courseIds: number[] }>('/api/seed-data', {
      method: 'POST',
    });
  }

  // Lesson APIs
  async getLessonsByCourse(courseId: number) {
    return this.request<{ lessons: any[] }>(`/api/courses/${courseId}/lessons`);
  }

  async createLesson(courseId: number, lessonData: {
    title: string;
    description?: string;
    video_url?: string;
    duration?: number;
    order_index?: number;
  }) {
    return this.request<{ lesson: any }>(`/api/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  // Progress APIs
  async getLessonProgress(lessonId: number, userId: number) {
    return this.request<{ progress: any }>(`/api/progress/${lessonId}?userId=${userId}`);
  }

  async updateLessonProgress(lessonId: number, progressData: {
    userId: number;
    watchedDuration?: number;
    completed?: boolean;
    totalDuration?: number;
    forceComplete?: boolean;
  }) {
    return this.request<{ progress: any }>(`/api/progress/${lessonId}`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  }

  async getCourseProgress(courseId: number, userId: number) {
    return this.request<{ data: any }>(`/api/progress/course/${courseId}?userId=${userId}`);
  }

  async enrollInCourse(courseId: number, userId: number) {
    return this.request<{ enrollment: any }>(`/api/progress/course/${courseId}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

// Headers helper cho các gọi API admin (dựa trên localStorage)
export function getAdminHeaders(): Record<string, string> {
  try {
    if (typeof window === 'undefined') return {}
    const raw = localStorage.getItem('userInfo')
    if (!raw) return {}
    const user = JSON.parse(raw)
    if (!user?.id || !user?.email) return {}
    return {
      'X-Admin-ID': String(user.id),
      'X-Admin-Email': String(user.email),
    }
  } catch {
    return {}
  }
}

export const apiClient = new ApiClient(); 