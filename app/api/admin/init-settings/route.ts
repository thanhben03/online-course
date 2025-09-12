import { NextResponse } from 'next/server'
import sql from '@/lib/db'

// POST - Khởi tạo cài đặt mặc định
export async function POST() {
  try {
    console.log('Bắt đầu khởi tạo cài đặt trang web...')
    
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
      },
      // Stats defaults
      {
        key: 'stats_subscribers_number',
        value: '2,000+',
        type: 'text',
        description: 'Thống kê: số lượng subscribers hiển thị ở trang chủ'
      },
      {
        key: 'stats_subscribers_label',
        value: 'Subscribers',
        type: 'text',
        description: 'Thống kê: nhãn subscribers hiển thị ở trang chủ'
      },
      {
        key: 'stats_topics_number',
        value: '7',
        type: 'text',
        description: 'Thống kê: số chuyên đề hiển thị ở trang chủ'
      },
      {
        key: 'stats_topics_label',
        value: 'Chuyên đề',
        type: 'text',
        description: 'Thống kê: nhãn chuyên đề hiển thị ở trang chủ'
      },
      {
        key: 'stats_support_number',
        value: '24/7',
        type: 'text',
        description: 'Thống kê: số hỗ trợ hiển thị ở trang chủ'
      },
      {
        key: 'stats_support_label',
        value: 'Hỗ trợ',
        type: 'text',
        description: 'Thống kê: nhãn hỗ trợ hiển thị ở trang chủ'
      },
      {
        key: 'homepage_testimonials',
        value: JSON.stringify([
          {
            id: 1,
            name: 'Nguyễn Thị Tuyết Nhi',
            role: 'Học viên Olympic Toán',
            avatar: '/placeholder-user.jpg',
            content: 'Cảm ơn anh ạ, thực sự tự đọc giáo trình em chả hiểu gì luôn... Kênh rất hay nên anh tiếp tục làm video nhé.',
            rating: 5
          },
          {
            id: 2,
            name: 'Trần Văn Sơn',
            role: 'Học viên Olympic Toán',
            avatar: '/placeholder-user.jpg',
            content: 'Em 2k7 chuẩn bị lên Đại học... Rất vui khi thấy sự comeback này ạ.',
            rating: 5
          },
          {
            id: 3,
            name: 'Lê Thị Hồng Nhung',
            role: 'Học viên Olympic Toán',
            avatar: '/placeholder-user.jpg',
            content: 'Nhờ vid của anh mà em có được kiến thức nền tảng... Hy vọng anh làm thêm.',
            rating: 4
          }
        ]),
        type: 'text',
        description: 'Danh sách testimonials trang chủ (JSON)'
      },
      {
        key: 'cta_primary_text',
        value: 'Học phí 1.500.000 VNĐ',
        type: 'text',
        description: 'CTA chính trên banner (nội dung nút)'
      },
      {
        key: 'cta_primary_href',
        value: '/login',
        type: 'text',
        description: 'CTA chính trên banner (đường dẫn khi bấm)'
      },
      {
        key: 'cta_secondary_text',
        value: '7 chuyên đề',
        type: 'text',
        description: 'CTA phụ trên banner (nội dung nút)'
      },
      {
        key: 'cta_secondary_href',
        value: '/courses',
        type: 'text',
        description: 'CTA phụ trên banner (đường dẫn khi bấm)'
      },
      // Instructors page defaults
      { key: 'instructor_name', value: 'Nguyễn Hoàng Duy', type: 'text', description: 'Tên giảng viên' },
      { key: 'instructor_title', value: 'Admin/Founder', type: 'text', description: 'Chức danh giảng viên' },
      { key: 'instructor_company', value: 'Olympic Toán Giải Tích', type: 'text', description: 'Đơn vị' },
      { key: 'instructor_avatar', value: '/placeholder-user.jpg', type: 'text', description: 'Ảnh đại diện' },
      { key: 'instructor_bio', value: 'Giảng viên Olympic Toán với 5 năm kinh nghiệm giảng dạy và nghiên cứu...', type: 'text', description: 'Giới thiệu/Bio' },
      { key: 'instructor_students', value: '2500', type: 'text', description: 'Số học viên' },
      { key: 'instructor_rating', value: '4.9', type: 'text', description: 'Điểm rating' },
      { key: 'instructor_total_ratings', value: '450', type: 'text', description: 'Tổng số đánh giá' },
      { key: 'instructor_expertise_csv', value: 'Olympic Toán,Giải Tích,Toán THPT,Manim,VJIMC', type: 'text', description: 'Chuyên môn (CSV)' },
      { key: 'instructor_achievements_csv', value: 'Học bổng du học Châu Âu,Top 1 (BXH ĐHCT) VJIMC 2025,Giải nhất NCKH (ĐHCT) Ứng dụng Manim trong dạy học Toán,300+ member', type: 'text', description: 'Thành tích (CSV)' }
      ,
      { key: 'instructor_education', value: JSON.stringify([
        { degree: 'Thạc sĩ Toán ứng dụng', school: 'Đại học Cần Thơ', year: '2025-2027' },
        { degree: 'Cử nhân Sư phạm Toán học - K47', school: 'Trường Sư phạm - Đại học Cần Thơ', year: '2021-2025' },
        { degree: 'Du học - thực tập', school: 'Đại học Ostra - Cộng Hoà Séc', year: '8/2024 - 7/2025' }
      ]), type: 'text', description: 'Danh sách học vấn (JSON)'}
    ]

    const results = []

    // Thêm từng cài đặt
    for (const setting of defaultSettings) {
      const result = await sql`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
        VALUES (${setting.key}, ${setting.value}, ${setting.type}, ${setting.description})
        ON CONFLICT (setting_key) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          setting_type = EXCLUDED.setting_type,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      results.push(result[0])
      console.log(`Đã khởi tạo cài đặt: ${setting.key}`)
    }
    
    console.log('Khởi tạo cài đặt trang web thành công!')
    
    return NextResponse.json({
      success: true,
      message: 'Khởi tạo cài đặt trang web thành công!',
      settings: results,
      count: results.length
    })
  } catch (error) {
    console.error('Lỗi khởi tạo cài đặt:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi khởi tạo cài đặt trang web' },
      { status: 500 }
    )
  }
}
