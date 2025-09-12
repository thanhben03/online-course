import { NextResponse } from 'next/server'
import sql from '@/lib/db'

// POST - Reset cài đặt về mặc định
export async function POST() {
  try {
    console.log('Bắt đầu reset cài đặt về mặc định...')
    
    // Xóa tất cả cài đặt hiện tại
    await sql`DELETE FROM site_settings`
    console.log('Đã xóa tất cả cài đặt hiện tại')
    
    // Nội quy mặc định
    const defaultRules = `# Nội quy sử dụng trang web

## 1. Quy định chung
- Tuân thủ pháp luật Việt Nam
- Không vi phạm bản quyền
- Không spam hoặc quấy rối người khác

## 2. Quy định về nội dung
- Không đăng nội dung phản động, khiêu dâm
- Không đăng thông tin cá nhân của người khác
- Không đăng nội dung quảng cáo không được phép

## 3. Quy định về tài khoản
- Không chia sẻ tài khoản với người khác
- Bảo mật thông tin đăng nhập
- Không tạo nhiều tài khoản giả

## 4. Quy định về học tập
- Tôn trọng giảng viên và học viên khác
- Không gian lận trong bài kiểm tra
- Tham gia thảo luận một cách tích cực

## 5. Hình thức xử lý vi phạm
- Cảnh báo lần đầu
- Tạm khóa tài khoản
- Xóa tài khoản vĩnh viễn

Bằng việc đồng ý với nội quy này, bạn cam kết tuân thủ các quy định trên.`

    // Cài đặt mặc định
    const defaultSettings = [
      {
        key: 'site_rules',
        value: defaultRules,
        type: 'text',
        description: 'Nội quy sử dụng trang web'
      },
      {
        key: 'site_name',
        value: 'Nền tảng học tập trực tuyến',
        type: 'text',
        description: 'Tên trang web'
      },
      {
        key: 'site_description',
        value: 'Nền tảng học tập trực tuyến chất lượng cao',
        type: 'text',
        description: 'Mô tả trang web'
      },
      {
        key: 'contact_email',
        value: 'contact@example.com',
        type: 'text',
        description: 'Email liên hệ'
      },
      {
        key: 'enable_registration',
        value: 'true',
        type: 'boolean',
        description: 'Cho phép đăng ký tài khoản mới'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Chế độ bảo trì'
      }
    ]

    const results = []

    // Thêm từng cài đặt mặc định
    for (const setting of defaultSettings) {
      const result = await sql`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
        VALUES (${setting.key}, ${setting.value}, ${setting.type}, ${setting.description})
        RETURNING *
      `
      results.push(result[0])
      console.log(`Đã tạo cài đặt mặc định: ${setting.key}`)
    }
    
    console.log('Reset cài đặt về mặc định thành công!')
    
    return NextResponse.json({
      success: true,
      message: 'Reset cài đặt về mặc định thành công!',
      settings: results,
      count: results.length
    })
  } catch (error) {
    console.error('Lỗi reset cài đặt:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi reset cài đặt về mặc định' },
      { status: 500 }
    )
  }
}
