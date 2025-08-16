import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// PUT - Cập nhật course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)
    const body = await request.json()
    const { title, description, price, status } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Tên khóa học là bắt buộc' },
        { status: 400 }
      )
    }

    // Update course
    const updatedCourse = await sql`
      UPDATE courses 
      SET 
        title = ${title},
        description = ${description || null},
        price = ${price || 0},
        status = ${status || 'draft'},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${courseId}
      RETURNING *
    `

    if (updatedCourse.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khóa học' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật khóa học thành công',
      course: updatedCourse[0]
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật khóa học' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id)

    // Check if course exists
    const course = await sql`
      SELECT id, title FROM courses WHERE id = ${courseId}
    `

    if (course.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy khóa học' },
        { status: 404 }
      )
    }

    // Delete course (this will also delete related lessons, enrollments, and progress due to CASCADE)
    await sql`
      DELETE FROM courses WHERE id = ${courseId}
    `

    return NextResponse.json({
      success: true,
      message: `Đã xóa khóa học "${course[0].title}" thành công`
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa khóa học' },
      { status: 500 }
    )
  }
}
