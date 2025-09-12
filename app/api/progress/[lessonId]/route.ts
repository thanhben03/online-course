import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy tiến trình học của một bài học cụ thể
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lessonId = parseInt(params.lessonId)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    const progress = await sql`
      SELECT 
        p.*,
        l.duration,
        l.title as lesson_title,
        CASE 
          WHEN l.duration > 0 THEN ROUND(COALESCE(p.watched_duration, 0) * 100.0 / NULLIF(l.duration, 0))
          ELSE 0
        END AS watched_percentage
      FROM progress p
      JOIN lessons l ON p.lesson_id = l.id
      WHERE p.lesson_id = ${lessonId} AND p.user_id = ${parseInt(userId)}
    `

    if (progress.length === 0) {
      // Also fetch duration to compute percentage
      const lesson = await sql`
        SELECT duration FROM lessons WHERE id = ${lessonId}
      `
      const duration = lesson.length > 0 ? lesson[0].duration : 0
      const watched_percentage = duration > 0 ? 0 : 0
      return NextResponse.json({
        success: true,
        progress: {
          lesson_id: lessonId,
          user_id: parseInt(userId),
          completed: false,
          watched_duration: 0,
          last_watched_at: null,
          duration,
          watched_percentage
        }
      })
    }

    return NextResponse.json({
      success: true,
      progress: progress[0]
    })
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lấy tiến trình bài học' },
      { status: 500 }
    )
  }
}

// POST - Cập nhật tiến trình học của một bài học
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lessonId = parseInt(params.lessonId)
    const body = await request.json()
    const { userId, watchedDuration, completed, forceComplete, totalDuration } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    // Kiểm tra bài học có tồn tại không
    const lesson = await sql`
      SELECT id, duration FROM lessons WHERE id = ${lessonId}
    `

    if (lesson.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bài học không tồn tại' },
        { status: 404 }
      )
    }

    let lessonDuration = lesson[0].duration
    const currentWatchedDuration = watchedDuration || 0

    // If lesson duration is 0 and we have totalDuration from video, update it
    if (lessonDuration === 0 && totalDuration && totalDuration > 0) {
      await sql`
        UPDATE lessons 
        SET duration = ${totalDuration}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${lessonId}
      `
      lessonDuration = totalDuration
      console.log(`Auto-updated lesson ${lessonId} duration to ${totalDuration} seconds`)
    }

    // Kiểm tra điều kiện hoàn thành
    let canComplete = false
    let completionStatus = completed || false

    if (completed && !forceComplete) {
      // Kiểm tra xem đã xem đủ % video chưa (ít nhất 90%)
      const requiredWatchPercentage = 90
      
      // Special case: if lesson duration is still 0, we can't validate properly
      if (lessonDuration === 0) {
        return NextResponse.json({
          success: false,
          error: `Không thể xác định thời lượng video. Vui lòng tải lại trang và xem lại video.`,
          details: {
            watchedPercentage: 0,
            requiredPercentage: requiredWatchPercentage,
            watchedDuration: currentWatchedDuration,
            totalDuration: lessonDuration,
            note: "Lesson duration is 0, cannot validate completion"
          }
        }, { status: 400 })
      }
      
      const watchedPercentage = (currentWatchedDuration / lessonDuration) * 100
      
      if (watchedPercentage >= requiredWatchPercentage) {
        canComplete = true
        completionStatus = true
      } else {
        canComplete = false
        completionStatus = false
        
        return NextResponse.json({
          success: false,
          error: `Bạn cần xem ít nhất ${requiredWatchPercentage}% video để hoàn thành bài học`,
          details: {
            watchedPercentage: Math.round(watchedPercentage),
            requiredPercentage: requiredWatchPercentage,
            watchedDuration: currentWatchedDuration,
            totalDuration: lessonDuration
          }
        }, { status: 400 })
      }
    }

    // Cập nhật hoặc tạo mới progress
    const progress = await sql`
      INSERT INTO progress (user_id, lesson_id, completed, watched_duration, last_watched_at)
      VALUES (${userId}, ${lessonId}, ${completionStatus}, ${currentWatchedDuration}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        completed = ${completionStatus},
        watched_duration = GREATEST(progress.watched_duration, ${currentWatchedDuration}),
        last_watched_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    // Cập nhật tiến trình tổng thể của khóa học
    await updateCourseProgress(userId, lessonId)

    return NextResponse.json({
      success: true,
      message: completionStatus ? 'Hoàn thành bài học thành công' : 'Cập nhật tiến trình thành công',
      progress: {
        ...progress[0],
        duration: lessonDuration,
        watched_percentage: lessonDuration > 0 ? Math.round((currentWatchedDuration / lessonDuration) * 100) : 0
      },
      canComplete,
      watchedPercentage: lessonDuration > 0 ? Math.round((currentWatchedDuration / lessonDuration) * 100) : 0
    })
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật tiến trình' },
      { status: 500 }
    )
  }
}

// Hàm helper để cập nhật tiến trình tổng thể của khóa học
async function updateCourseProgress(userId: number, lessonId: number) {
  try {
    // Lấy course_id từ lesson
    const lesson = await sql`
      SELECT course_id FROM lessons WHERE id = ${lessonId}
    `

    if (lesson.length === 0) return

    const courseId = lesson[0].course_id

    // Tính tiến trình khóa học
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

    // Cập nhật hoặc tạo enrollment record
    await sql`
      INSERT INTO enrollments (user_id, course_id, progress, enrolled_at)
      VALUES (${userId}, ${courseId}, ${progressPercentage}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET
        progress = ${progressPercentage},
        completed_at = CASE 
          WHEN ${progressPercentage} = 100 THEN CURRENT_TIMESTAMP 
          ELSE NULL 
        END
    `
  } catch (error) {
    console.error('Error updating course progress:', error)
  }
}
