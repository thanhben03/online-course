import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// PUT - Cập nhật lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id)
    const body = await request.json()
    const { title, description, video_url, duration, order_index } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Tên bài học là bắt buộc' },
        { status: 400 }
      )
    }

    // Update lesson
    const updatedLesson = await sql`
      UPDATE lessons 
      SET 
        title = ${title},
        description = ${description || null},
        video_url = ${video_url || null},
        duration = ${duration || 0},
        order_index = ${order_index || 1},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${lessonId}
      RETURNING *
    `

    if (updatedLesson.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài học' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài học thành công',
      lesson: updatedLesson[0]
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật bài học' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id)

    // Check if lesson exists
    const lesson = await sql`
      SELECT id, title FROM lessons WHERE id = ${lessonId}
    `

    if (lesson.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài học' },
        { status: 404 }
      )
    }

    // Delete lesson (this will also delete related progress due to CASCADE)
    await sql`
      DELETE FROM lessons WHERE id = ${lessonId}
    `

    return NextResponse.json({
      success: true,
      message: `Đã xóa bài học "${lesson[0].title}" thành công`
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa bài học' },
      { status: 500 }
    )
  }
}
