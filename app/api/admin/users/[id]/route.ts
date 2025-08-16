import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// PUT - Cập nhật thông tin user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    const body = await request.json()
    const { name, email, phone, school, city, grade } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Tên và email là bắt buộc' },
        { status: 400 }
      )
    }

    // Check if email exists for other users
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng bởi tài khoản khác' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await sql`
      UPDATE users 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        school = ${school || null},
        city = ${city || null},
        grade = ${grade || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId} AND role = 'student'
      RETURNING id, name, email, phone, school, city, grade, role, created_at, updated_at
    `

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tài khoản hoặc không có quyền cập nhật' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedUser[0]
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật thông tin' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)

    // Check if user exists and is a student
    const user = await sql`
      SELECT id, name FROM users WHERE id = ${userId} AND role = 'student'
    `

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tài khoản hoặc không có quyền xóa' },
        { status: 404 }
      )
    }

    // Delete user (this will also delete related enrollments and progress due to CASCADE)
    await sql`
      DELETE FROM users WHERE id = ${userId} AND role = 'student'
    `

    return NextResponse.json({
      success: true,
      message: `Đã xóa tài khoản ${user[0].name} thành công`
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa tài khoản' },
      { status: 500 }
    )
  }
}
