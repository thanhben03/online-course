import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { createAdminAuthError, verifyAdminAuth } from '@/lib/middleware/adminAuth'
import { userService } from '@/lib/services/userService'

// GET - Lấy danh sách tất cả users
export async function GET(request: NextRequest) {
  try {
    // Lấy thông tin admin từ headers
    const adminUserId = request.headers.get('X-Admin-ID')
    const adminEmail = request.headers.get('X-Admin-Email')
    
    if (!adminUserId || !adminEmail) {
      return createAdminAuthError()
    }

    // Verify admin user
    const adminUser = await userService.findById(parseInt(adminUserId))
    if (!adminUser  || adminUser.role !== 'admin') {
      return createAdminAuthError()
    }
  } catch (error) {
    return createAdminAuthError()
  }
  try {
    const users = await sql`
      SELECT 
        id, name, email, phone, school, city, grade, role, created_at, updated_at
      FROM users 
      WHERE role = 'student'
      ORDER BY created_at DESC
    `
    
    return NextResponse.json({ 
      success: true, 
      users: users 
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách người dùng 3' },
      { status: 500 }
    )
  }
}

// POST - Tạo user mới
export async function POST(request: NextRequest) {
  // Kiểm tra quyền admin
  const adminUser = await verifyAdminAuth(request)
  if (!adminUser) {
    return createAdminAuthError()
  }
  try {
    const body = await request.json()
    const { name, email, phone, school, city, grade, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email đã tồn tại trong hệ thống' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, phone, school, city, grade, password_hash, role)
      VALUES (${name}, ${email}, ${phone || null}, ${school || null}, ${city || null}, ${grade || null}, ${passwordHash}, 'student')
      RETURNING id, name, email, phone, school, city, grade, role, created_at
    `

    return NextResponse.json({
      success: true,
      message: 'Tạo tài khoản thành công',
      user: newUser[0]
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo tài khoản' },
      { status: 500 }
    )
  }
}
