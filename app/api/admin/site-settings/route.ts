import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy tất cả cài đặt
export async function GET() {
  try {
    const settings = await sql`
      SELECT * FROM site_settings ORDER BY setting_key
    `
    
    return NextResponse.json({ 
      success: true, 
      settings 
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải cài đặt' },
      { status: 500 }
    )
  }
}

// POST - Tạo hoặc cập nhật cài đặt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { setting_key, setting_value, setting_type, description } = body

    // Validate required fields
    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Upsert setting (insert or update)
    const result = await sql`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
      VALUES (${setting_key}, ${setting_value}, ${setting_type || 'text'}, ${description || null})
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        setting_type = EXCLUDED.setting_type,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cài đặt thành công',
      setting: result[0]
    })
  } catch (error) {
    console.error('Error saving site setting:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi lưu cài đặt' },
      { status: 500 }
    )
  }
}
