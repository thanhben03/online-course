import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy danh sách tất cả uploads
export async function GET() {
  try {
    const uploads = await sql`
      SELECT 
        u.*,
        users.name as user_name,
        l.title as lesson_title,
        c.title as course_title
      FROM uploads u
      LEFT JOIN users ON u.user_id = users.id
      LEFT JOIN lessons l ON u.lesson_id = l.id
      LEFT JOIN courses c ON l.course_id = c.id
      ORDER BY u.created_at DESC
    `
    
    return NextResponse.json({ 
      success: true, 
      files: uploads 
    })
  } catch (error) {
    console.error('Error fetching uploads:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải danh sách file' },
      { status: 500 }
    )
  }
}

// POST - Lưu thông tin file upload vào database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, original_name, file_size, file_type, s3_key, s3_url, user_id, lesson_id } = body

    // Validate required fields
    if (!filename || !file_size || !file_type || !s3_key) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Validate lesson exists if lesson_id is provided
    if (lesson_id) {
      const lesson = await sql`
        SELECT id FROM lessons WHERE id = ${lesson_id}
      `
      
      if (lesson.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Bài học không tồn tại' },
          { status: 400 }
        )
      }
    }

    // Insert upload record
    const newUpload = await sql`
      INSERT INTO uploads (
        user_id, 
        lesson_id,
        filename, 
        original_name, 
        file_size, 
        file_type, 
        s3_key, 
        s3_url, 
        status
      )
      VALUES (
        ${user_id || null}, 
        ${lesson_id || null},
        ${filename}, 
        ${original_name || filename}, 
        ${file_size}, 
        ${file_type}, 
        ${s3_key}, 
        ${s3_url}, 
        'completed'
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: 'Lưu thông tin file thành công',
      upload: newUpload[0]
    })
  } catch (error) {
    console.error('Error saving upload to database:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lưu thông tin file' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật thông tin file upload
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, filename, original_name, lesson_id } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID file là bắt buộc' },
        { status: 400 }
      )
    }

    // Check if upload exists
    const existingUpload = await sql`
      SELECT id FROM uploads WHERE id = ${id}
    `

    if (existingUpload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file' },
        { status: 404 }
      )
    }

    // Validate lesson exists if lesson_id is provided
    if (lesson_id) {
      const lesson = await sql`
        SELECT id FROM lessons WHERE id = ${lesson_id}
      `
      
      if (lesson.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Bài học không tồn tại' },
          { status: 400 }
        )
      }
    }

    // Update upload record
    const updatedUpload = await sql`
      UPDATE uploads 
      SET 
        filename = ${filename},
        original_name = ${original_name},
        lesson_id = ${lesson_id || null}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin file thành công',
      upload: updatedUpload[0]
    })
  } catch (error) {
    console.error('Error updating upload:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật thông tin file' },
      { status: 500 }
    )
  }
}
