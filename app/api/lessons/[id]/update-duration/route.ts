import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// POST - Cập nhật duration của lesson từ video metadata
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id)
    const body = await request.json()
    const { duration } = body

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { success: false, error: 'Duration must be a positive number' },
        { status: 400 }
      )
    }

    // Check if lesson exists and get current duration
    const currentLesson = await sql`
      SELECT id, duration FROM lessons WHERE id = ${lessonId}
    `

    if (currentLesson.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const currentDuration = currentLesson[0].duration

    // Only update if current duration is 0 or significantly different (more than 10% difference)
    const shouldUpdate = currentDuration === 0 || 
      Math.abs(currentDuration - duration) > (currentDuration * 0.1)

    if (shouldUpdate) {
      const updatedLesson = await sql`
        UPDATE lessons 
        SET 
          duration = ${duration},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${lessonId}
        RETURNING *
      `

      console.log(`Updated lesson ${lessonId} duration from ${currentDuration} to ${duration}`)

      return NextResponse.json({
        success: true,
        message: 'Lesson duration updated successfully',
        lesson: updatedLesson[0],
        updated: true
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Lesson duration already up to date',
        updated: false
      })
    }
  } catch (error) {
    console.error('Error updating lesson duration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update lesson duration' },
      { status: 500 }
    )
  }
}

