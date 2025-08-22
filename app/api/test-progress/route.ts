import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// POST - Test API để tạo dữ liệu progress mẫu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, lessonId } = body

    console.log('Creating test progress for:', { userId, courseId, lessonId })

    // Tạo enrollment nếu chưa có
    const enrollment = await sql`
      INSERT INTO enrollments (user_id, course_id, progress, enrolled_at)
      VALUES (${userId}, ${courseId}, 0, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET enrolled_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    console.log('Enrollment created/updated:', enrollment[0])

    // Tạo progress cho bài học nếu có lessonId
    let lessonProgress = null
    if (lessonId) {
      lessonProgress = await sql`
        INSERT INTO progress (user_id, lesson_id, completed, watched_duration, last_watched_at)
        VALUES (${userId}, ${lessonId}, true, 300, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET 
          completed = true,
          watched_duration = 300,
          last_watched_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      console.log('Lesson progress created/updated:', lessonProgress[0])

      // Cập nhật progress tổng thể
      const progressStats = await sql`
        SELECT 
          COUNT(*) as total_lessons,
          COUNT(CASE WHEN p.completed = true THEN 1 END) as completed_lessons
        FROM lessons l
        LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ${userId}
        WHERE l.course_id = ${courseId}
      `

      const { total_lessons, completed_lessons } = progressStats[0]
      const progressPercentage = total_lessons > 0 ? Math.round((completed_lessons / total_lessons) * 100) : 0

      await sql`
        UPDATE enrollments 
        SET progress = ${progressPercentage}
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `
      console.log('Updated enrollment progress to:', progressPercentage)
    }

    return NextResponse.json({
      success: true,
      message: 'Test progress created successfully',
      data: {
        enrollment: enrollment[0],
        lessonProgress: lessonProgress?.[0] || null
      }
    })
  } catch (error) {
    console.error('Error creating test progress:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET - Kiểm tra dữ liệu progress hiện tại
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'userId and courseId are required' },
        { status: 400 }
      )
    }

    // Lấy enrollment
    const enrollment = await sql`
      SELECT * FROM enrollments 
      WHERE user_id = ${parseInt(userId)} AND course_id = ${parseInt(courseId)}
    `

    // Lấy progress bài học
    const lessonProgress = await sql`
      SELECT 
        l.id,
        l.title,
        l.duration,
        l.order_index,
        COALESCE(p.completed, false) as completed,
        COALESCE(p.watched_duration, 0) as watched_duration,
        p.last_watched_at
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ${parseInt(userId)}
      WHERE l.course_id = ${parseInt(courseId)}
      ORDER BY l.order_index
    `

    // Tính stats
    const totalLessons = lessonProgress.length
    const completedLessons = lessonProgress.filter(lesson => lesson.completed).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        enrollment: enrollment[0] || null,
        progress: {
          percentage: progressPercentage,
          completedLessons,
          totalLessons,
          totalWatchedDuration: lessonProgress.reduce((sum, lesson) => sum + lesson.watched_duration, 0),
          totalCourseDuration: lessonProgress.reduce((sum, lesson) => sum + lesson.duration, 0)
        },
        lessonProgress
      }
    })
  } catch (error) {
    console.error('Error fetching test progress:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

