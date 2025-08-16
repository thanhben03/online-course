import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy danh sách tất cả lessons với thông tin course
export async function GET() {
  try {
    const lessons = await sql`
      SELECT 
        l.*,
        c.title as course_title
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      ORDER BY c.title, l.order_index
    `
    
    return NextResponse.json({ 
      success: true, 
      lessons: lessons 
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách bài học' },
      { status: 500 }
    )
  }
}

// POST - Tạo lesson mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { course_id, title, description, video_url, duration, order_index } = body

    // Validate required fields
    if (!course_id || !title) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn khóa học và nhập tên bài học' },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await sql`
      SELECT id FROM courses WHERE id = ${course_id}
    `
    
    if (course.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Khóa học không tồn tại' },
        { status: 400 }
      )
    }

    // Create lesson
    const newLesson = await sql`
      INSERT INTO lessons (course_id, title, description, video_url, duration, order_index)
      VALUES (${course_id}, ${title}, ${description || null}, ${video_url || null}, ${duration || 0}, ${order_index || 1})
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: 'Tạo bài học thành công',
      lesson: newLesson[0]
    })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tạo bài học' },
      { status: 500 }
    )
  }
}
