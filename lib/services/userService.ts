import sql from '../db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  phone?: string;
  school?: string;
  city?: string;
  grade?: string;
  category?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export const userService = {
  // Tạo user mới
  async createUser(data: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const result = await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (${data.email}, ${data.name}, ${hashedPassword}, ${data.role || 'student'})
      RETURNING id, email, name, avatar_url, role, created_at, updated_at
    `;
    
    return result[0] as User;
  },

  // Tìm user theo email
  async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const result = await sql`
      SELECT id, email, name, password_hash, avatar_url, role, phone, school, city, grade, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `;
    
    return result[0] as User & { password_hash: string } || null;
  },

  // Tìm user theo ID
  async findById(id: number): Promise<User | null> {
    const result = await sql`
      SELECT id, email, name, avatar_url, role, phone, school, city, grade, created_at, updated_at
      FROM users 
      WHERE id = ${id}
    `;
    
    return result[0] as User || null;
  },

  // Cập nhật thông tin user
  async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    const result = await sql`
      UPDATE users 
      SET 
        name = COALESCE(${data.name}, name),
        avatar_url = COALESCE(${data.avatar_url}, avatar_url),
        role = COALESCE(${data.role}, role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, email, name, avatar_url, role, created_at, updated_at
    `;
    
    return result[0] as User || null;
  },

  // Xác thực password
  async verifyPassword(user: User & { password_hash: string }, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }
}; 