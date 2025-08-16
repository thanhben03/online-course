import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// DELETE - Xóa upload file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const uploadId = parseInt(params.id)

    // Check if upload exists
    const upload = await sql`
      SELECT id, filename FROM uploads WHERE id = ${uploadId}
    `

    if (upload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file' },
        { status: 404 }
      )
    }

    // Delete upload record (note: this doesn't delete the actual file from S3)
    await sql`
      DELETE FROM uploads WHERE id = ${uploadId}
    `

    return NextResponse.json({
      success: true,
      message: `Đã xóa file "${upload[0].filename}" thành công`
    })
  } catch (error) {
    console.error('Error deleting upload:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi xóa file' },
      { status: 500 }
    )
  }
}
