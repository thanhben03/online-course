import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

// POST - Tạo tài khoản admin đầu tiên (chỉ khi chưa có admin nào)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password, secretKey } = body

    // Kiểm tra secret key để bảo mật (nên được set trong env)
    const ADMIN_CREATION_SECRET = process.env.ADMIN_CREATION_SECRET || 'admin-secret-2024'
    if (secretKey !== ADMIN_CREATION_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Secret key không hợp lệ' },
        { status: 403 }
      )
    }

    // Kiểm tra xem đã có admin nào chưa
    const existingAdmins = await sql`
      SELECT COUNT(*) as count FROM users WHERE role = 'admin'
    `
    
    if (existingAdmins[0]?.count > 0) {
      return NextResponse.json(
        { success: false, error: 'Đã có tài khoản admin. Không thể tạo thêm.' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, tên và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Tạo user với role admin
    const newAdmin = await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (${email}, ${name}, ${hashedPassword}, 'admin')
      RETURNING id, email, name, role, created_at
    `

    return NextResponse.json({
      success: true,
      message: 'Tài khoản admin đã được tạo thành công',
      admin: {
        id: newAdmin[0].id,
        email: newAdmin[0].email,
        name: newAdmin[0].name,
        role: newAdmin[0].role,
        created_at: newAdmin[0].created_at
      }
    })

  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi tạo tài khoản admin' },
      { status: 500 }
    )
  }
}
