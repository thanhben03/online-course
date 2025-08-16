import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy danh sách tài liệu của một bài học
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

    // Check if lesson exists
    const lesson = await sql`
      SELECT id FROM lessons WHERE id = ${lessonId}
    `

    if (lesson.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài học' },
        { status: 404 }
      )
    }

    // Get documents for this lesson (exclude video files)
    const documents = await sql`
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
      AND u.file_type NOT LIKE 'video/%'
      AND u.file_type NOT LIKE 'audio/%'
      ORDER BY u.created_at DESC
    `

    // Format documents
    const formattedDocuments = documents.map((doc: any) => ({
      id: doc.id,
      filename: doc.filename,
      originalName: doc.original_name,
      fileSize: doc.file_size,
      fileType: doc.file_type,
      downloadUrl: doc.s3_url || `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19428351-course'}/${doc.s3_key}`,
      uploadedAt: doc.created_at,
      icon: getFileIcon(doc.file_type)
    }))

    return NextResponse.json({
      success: true,
      documents: formattedDocuments
    })
  } catch (error) {
    console.error('Error fetching lesson documents:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách tài liệu' },
      { status: 500 }
    )
  }
}

// Helper function to determine file icon based on file type (documents only)
function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return 'pdf'
  if (fileType.includes('word') || fileType.includes('document')) return 'doc'
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'excel'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'ppt'
  if (fileType.includes('image')) return 'image'
  if (fileType.includes('text')) return 'text'
  // Note: video and audio files are excluded from documents
  return 'file'
}
