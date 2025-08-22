import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy tiến trình học tổng thể của một khóa học
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    // Lấy thông tin enrollment
    const enrollment = await sql`
      SELECT * FROM enrollments 
      WHERE user_id = ${parseInt(userId)} AND course_id = ${courseId}
    `

    // Lấy chi tiết tiến trình từng bài học
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
      WHERE l.course_id = ${courseId}
      ORDER BY l.order_index
    `

    // Tính thống kê
    const totalLessons = lessonProgress.length
    const completedLessons = lessonProgress.filter(lesson => lesson.completed).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Tính tổng thời gian đã xem
    const totalWatchedDuration = lessonProgress.reduce((sum, lesson) => sum + lesson.watched_duration, 0)
    const totalCourseDuration = lessonProgress.reduce((sum, lesson) => sum + lesson.duration, 0)

    return NextResponse.json({
      success: true,
      data: {
        enrollment: enrollment[0] || null,
        progress: {
          percentage: progressPercentage,
          completedLessons,
          totalLessons,
          totalWatchedDuration,
          totalCourseDuration
        },
        lessonProgress
      }
    })
  } catch (error) {
    console.error('Error fetching course progress:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy tiến trình khóa học' },
      { status: 500 }
    )
  }
}

// POST - Đăng ký khóa học (tạo enrollment)
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId)
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    // Kiểm tra khóa học có tồn tại không
    const course = await sql`
      SELECT id FROM courses WHERE id = ${courseId}
    `

    if (course.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Khóa học không tồn tại' },
        { status: 404 }
      )
    }

    // Tạo hoặc cập nhật enrollment
    const enrollment = await sql`
      INSERT INTO enrollments (user_id, course_id, progress, enrolled_at)
      VALUES (${userId}, ${courseId}, 0, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET enrolled_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: 'Đăng ký khóa học thành công',
      enrollment: enrollment[0]
    })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi đăng ký khóa học' },
      { status: 500 }
    )
  }
}

