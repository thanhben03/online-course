import sql from '../db';

export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  instructor_id: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  thumbnail_url?: string;
  price?: number;
  instructor_id: number;
  status?: string;
}

export const courseService = {
  // Tạo khóa học mới
  async createCourse(data: CreateCourseData): Promise<Course> {
    const result = await sql`
      INSERT INTO courses (title, description, thumbnail_url, price, instructor_id, status)
      VALUES (${data.title}, ${data.description}, ${data.thumbnail_url}, ${data.price || 0}, ${data.instructor_id}, ${data.status || 'draft'})
      RETURNING *
    `;
    
    return result[0] as Course;
  },

  // Lấy tất cả khóa học
  async getAllCourses(): Promise<Course[]> {
    const result = await sql`
      SELECT c.*, u.name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.status = 'published'
      ORDER BY c.created_at DESC
    `;
    
    return result as Course[];
  },

  // Lấy khóa học theo ID
  async getCourseById(id: number): Promise<Course | null> {
    const result = await sql`
      SELECT c.*, u.name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ${id}
    `;
    
    return result[0] as Course || null;
  },

  // Cập nhật khóa học
  async updateCourse(id: number, data: Partial<CreateCourseData>): Promise<Course | null> {
    const result = await sql`
      UPDATE courses 
      SET 
        title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        thumbnail_url = COALESCE(${data.thumbnail_url}, thumbnail_url),
        price = COALESCE(${data.price}, price),
        status = COALESCE(${data.status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    return result[0] as Course || null;
  },

  // Xóa khóa học
  async deleteCourse(id: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM courses WHERE id = ${id}
    `;
    
    return result.length > 0;
  },

  // Lấy khóa học theo instructor
  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    const result = await sql`
      SELECT * FROM courses 
      WHERE instructor_id = ${instructorId}
      ORDER BY created_at DESC
    `;
    
    return result as Course[];
  }
}; 