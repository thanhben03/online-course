import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyAdminAuth, createAdminAuthError } from '@/lib/middleware/adminAuth'

// GET - Lấy danh sách tất cả courses với thống kê
export async function GET(request: NextRequest) {
  // Kiểm tra quyền admin
  const adminUser = await verifyAdminAuth(request)
  if (!adminUser) {
    return createAdminAuthError()
  }
  try {
    const courses = await sql`
      SELECT 
        c.*,
        COUNT(DISTINCT l.id) as lesson_count,
        COUNT(DISTINCT e.id) as enrollment_count
      FROM courses c
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `
    
    return NextResponse.json({ 
      success: true, 
      courses: courses 
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách khóa học' },
      { status: 500 }
    )
  }
}

// POST - Tạo course mới
export async function POST(request: NextRequest) {
  // Kiểm tra quyền admin
  const adminUser = await verifyAdminAuth(request)
  if (!adminUser) {
    return createAdminAuthError()
  }
  try {
    const body = await request.json()
    const { title, description, price, status } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên khóa học' },
        { status: 400 }
      )
    }

    // Create course
    const newCourse = await sql`
      INSERT INTO courses (title, description, price, status)
      VALUES (${title}, ${description || null}, ${price || 0}, ${status || 'draft'})
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: 'Tạo khóa học thành công',
      course: newCourse[0]
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo khóa học' },
      { status: 500 }
    )
  }
}
