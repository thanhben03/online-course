import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy video của một bài học
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = parseInt(params.id)

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { success: false, error: 'ID bài học không hợp lệ' },
        { status: 400 }
      )
    }

    // Check if lesson exists and get video_url if available
    const lesson = await sql`
      SELECT id, video_url FROM lessons WHERE id = ${lessonId}
    `

    if (lesson.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài học' },
        { status: 404 }
      )
    }

    // If lesson has video_url, return it
    if (lesson[0].video_url) {
      return NextResponse.json({
        success: true,
        video: {
          source: 'direct',
          url: lesson[0].video_url,
          type: 'url'
        }
      })
    }

    // Get video files uploaded for this lesson
    const videoFiles = await sql`
      SELECT 
        u.id,
        u.filename,
        u.original_name,
        u.file_size,
        u.file_type,
        u.s3_key,
        u.s3_url,
        u.created_at
      FROM uploads u
      WHERE u.lesson_id = ${lessonId}
      AND u.status = 'completed'
      AND (u.file_type LIKE 'video/%' OR u.file_type LIKE 'audio/%')
      ORDER BY u.created_at DESC
      LIMIT 1
    `

    if (videoFiles.length > 0) {
      const videoFile = videoFiles[0]
      const videoUrl = videoFile.s3_url || `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19428351-course'}/${videoFile.s3_key}`
      
      return NextResponse.json({
        success: true,
        video: {
          source: 'upload',
          url: videoUrl,
          type: 'file',
          filename: videoFile.filename,
          fileType: videoFile.file_type,
          fileSize: videoFile.file_size
        }
      })
    }

    // No video found
    return NextResponse.json({
      success: true,
      video: null
    })

  } catch (error) {
    console.error('Error fetching lesson video:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải video bài học' },
      { status: 500 }
    )
  }
}
