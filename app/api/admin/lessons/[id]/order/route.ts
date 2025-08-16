import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// PUT - Cập nhật thứ tự lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id)
    const body = await request.json()
    const { order_index } = body

    // Validate required fields
    if (order_index === undefined || order_index < 1) {
      return NextResponse.json(
        { success: false, error: 'Thứ tự phải là số dương' },
        { status: 400 }
      )
    }

    // Get current lesson info
    const currentLesson = await sql`
      SELECT id, course_id, order_index FROM lessons WHERE id = ${lessonId}
    `

    if (currentLesson.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài học' },
        { status: 404 }
      )
    }

    const lesson = currentLesson[0]
    const oldOrder = lesson.order_index
    const newOrder = order_index

    if (oldOrder === newOrder) {
      return NextResponse.json({
        success: true,
        message: 'Thứ tự không thay đổi'
      })
    }

    // Update order indices for affected lessons
    if (newOrder > oldOrder) {
      // Moving down: decrease order of lessons between old and new position
      await sql`
        UPDATE lessons 
        SET order_index = order_index - 1
        WHERE course_id = ${lesson.course_id} 
        AND order_index > ${oldOrder} 
        AND order_index <= ${newOrder}
      `
    } else {
      // Moving up: increase order of lessons between new and old position
      await sql`
        UPDATE lessons 
        SET order_index = order_index + 1
        WHERE course_id = ${lesson.course_id} 
        AND order_index >= ${newOrder} 
        AND order_index < ${oldOrder}
      `
    }

    // Update the current lesson's order
    await sql`
      UPDATE lessons 
      SET order_index = ${newOrder}
      WHERE id = ${lessonId}
    `

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thứ tự thành công'
    })
  } catch (error) {
    console.error('Error updating lesson order:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật thứ tự bài học' },
      { status: 500 }
    )
  }
}
