import sql from '../db';

export interface Instructor {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar_url: string;
  courses_count: number;
  lessons_count: number;
  rating: number;
  expertise: string[];
  order_index: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInstructorData {
  name: string;
  title: string;
  company: string;
  avatar_url?: string;
  courses_count?: number;
  lessons_count?: number;
  rating?: number;
  expertise: string[];
  order_index?: number;
}

export interface UpdateInstructorData extends Partial<CreateInstructorData> {
  is_active?: boolean;
}

export const instructorService = {
  // Lấy tất cả instructors đang hoạt động
  async getAllActive(): Promise<Instructor[]> {
    try {
      const result = await sql`
        SELECT * FROM instructors 
        WHERE is_active = true 
        ORDER BY order_index ASC, name ASC
      `;
      return result as Instructor[];
    } catch (error) {
      console.error('Error fetching active instructors:', error);
      throw error;
    }
  },

  // Lấy tất cả instructors (bao gồm cả không hoạt động)
  async getAll(): Promise<Instructor[]> {
    try {
      const result = await sql`
        SELECT * FROM instructors 
        ORDER BY order_index ASC, name ASC
      `;
      return result as Instructor[];
    } catch (error) {
      console.error('Error fetching all instructors:', error);
      throw error;
    }
  },

  // Lấy instructor theo ID
  async getById(id: number): Promise<Instructor | null> {
    try {
      const result = await sql`
        SELECT * FROM instructors WHERE id = ${id}
      `;
      return (result[0] as Instructor) || null;
    } catch (error) {
      console.error('Error fetching instructor by ID:', error);
      throw error;
    }
  },

  // Tạo instructor mới
  async create(data: CreateInstructorData): Promise<Instructor> {
    try {
      const result = await sql`
        INSERT INTO instructors (
          name, title, company, avatar_url, courses_count, 
          lessons_count, rating, expertise, order_index
        ) VALUES (
          ${data.name}, ${data.title}, ${data.company}, 
          ${data.avatar_url || '/placeholder-user.jpg'}, 
          ${data.courses_count || 0}, 
          ${data.lessons_count || 0}, 
          ${data.rating || 5.0}, 
          ${data.expertise}, 
          ${data.order_index || 0}
        ) RETURNING *
      `;
      return result[0] as Instructor;
    } catch (error) {
      console.error('Error creating instructor:', error);
      throw error;
    }
  },

  // Cập nhật instructor
  async update(id: number, data: UpdateInstructorData): Promise<Instructor | null> {
    try {
      console.log('🔄 instructorService.update called with:', { id, data });
      
      // Kiểm tra nếu không có gì để cập nhật
      if (Object.keys(data).length === 0) {
        console.log('⚠️ No updates to perform, returning current instructor');
        return await this.getById(id);
      }

      // Kiểm tra xem instructor có tồn tại không
      const existingInstructor = await this.getById(id);
      if (!existingInstructor) {
        console.log('❌ Instructor not found with ID:', id);
        return null;
      }

      console.log('✅ Found existing instructor:', existingInstructor);

      // Xây dựng câu SQL động
      let updateQuery = 'UPDATE instructors SET ';
      const updateParts: string[] = [];
      
      // Helper function để escape string values
      const escapeString = (str: string) => str.replace(/'/g, "''");
      
      if (data.name !== undefined && typeof data.name === 'string' && data.name.trim()) {
        updateParts.push(`name = '${escapeString(data.name.trim())}'`);
      }
      if (data.title !== undefined && typeof data.title === 'string' && data.title.trim()) {
        updateParts.push(`title = '${escapeString(data.title.trim())}'`);
      }
      if (data.company !== undefined && typeof data.company === 'string' && data.company.trim()) {
        updateParts.push(`company = '${escapeString(data.company.trim())}'`);
      }
      if (data.avatar_url !== undefined && typeof data.avatar_url === 'string' && data.avatar_url.trim()) {
        updateParts.push(`avatar_url = '${escapeString(data.avatar_url.trim())}'`);
      }
      if (data.courses_count !== undefined && typeof data.courses_count === 'number' && data.courses_count >= 0) {
        updateParts.push(`courses_count = ${data.courses_count}`);
      }
      if (data.lessons_count !== undefined && typeof data.lessons_count === 'number' && data.lessons_count >= 0) {
        updateParts.push(`lessons_count = ${data.lessons_count}`);
      }
      if (data.rating !== undefined && typeof data.rating === 'number' && data.rating >= 1 && data.rating <= 5) {
        updateParts.push(`rating = ${data.rating}`);
      }
      if (data.expertise !== undefined && Array.isArray(data.expertise) && data.expertise.length > 0) {
        const escapedSkills = data.expertise
          .filter(skill => typeof skill === 'string' && skill.trim())
          .map(skill => `'${escapeString(skill.trim())}'`);
        if (escapedSkills.length > 0) {
          updateParts.push(`expertise = ARRAY[${escapedSkills.join(', ')}]`);
        }
      }
      if (data.order_index !== undefined && typeof data.order_index === 'number' && data.order_index >= 0) {
        updateParts.push(`order_index = ${data.order_index}`);
      }
      if (data.is_active !== undefined && typeof data.is_active === 'boolean') {
        updateParts.push(`is_active = ${data.is_active}`);
      }

      updateParts.push('updated_at = CURRENT_TIMESTAMP');
      
      if (updateParts.length === 0) {
        console.log('⚠️ No valid updates to perform, returning current instructor');
        return existingInstructor;
      }
      
      updateQuery += updateParts.join(', ') + ` WHERE id = ${id} RETURNING *`;
      
      console.log('📝 Final SQL query:', updateQuery);
      console.log('🔍 Number of updates:', updateParts.length);

      // Thử sử dụng sql template literal thay vì sql.unsafe
      try {
        const result = await sql`
          UPDATE instructors 
          SET ${sql.unsafe(updateParts.join(', '))}
          WHERE id = ${id} 
          RETURNING *
        `;
        
        console.log('✅ SQL result using template literal:', result);
        return (result as any)[0] || null;
      } catch (templateError) {
        console.log('⚠️ Template literal failed, trying sql.unsafe:', templateError);
        
        // Fallback to sql.unsafe
        const result = await sql.unsafe(updateQuery);
        console.log('✅ SQL result using sql.unsafe:', result);
        return (result as any)[0] || null;
      }
    } catch (error) {
      console.error('❌ Error updating instructor:', error);
      throw error;
    }
  },

  // Xóa instructor (soft delete)
  async delete(id: number): Promise<boolean> {
    try {
      const result = await sql`
        UPDATE instructors 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
      return (result as any).count > 0;
    } catch (error) {
      console.error('Error deleting instructor:', error);
      throw error;
    }
  },

  // Xóa hoàn toàn instructor
  async hardDelete(id: number): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM instructors WHERE id = ${id}
      `;
      return (result as any).count > 0;
    } catch (error) {
      console.error('Error hard deleting instructor:', error);
      throw error;
    }
  },

  // Cập nhật thứ tự instructors
  async updateOrder(orders: { id: number; order_index: number }[]): Promise<boolean> {
    try {
      for (const order of orders) {
        await sql`
          UPDATE instructors 
          SET order_index = ${order.order_index}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${order.id}
        `;
      }
      return true;
    } catch (error) {
      console.error('Error updating instructor order:', error);
      throw error;
    }
  }
};
