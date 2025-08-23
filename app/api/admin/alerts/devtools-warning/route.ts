import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getClientIP, normalizeIP } from '@/lib/utils/getClientIP'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, userName, warningCount, currentPage, alertReason = 'count' } = body

    // Validate required fields
    if (!userId || !userEmail || !userName || !warningCount) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Lấy thông tin IP và user agent
    const clientIP = normalizeIP(getClientIP(request))
    const userAgent = request.headers.get('User-Agent') || 'Unknown'

    // Tạo thông báo cảnh báo
    const alertMessage = alertReason === 'timeout' 
      ? `⚠️ CẢNH BÁO DEVTOOLS: Người dùng "${userName}" (${userEmail}) đã mở DevTools quá 5 giây (lần ${warningCount})`
      : `⚠️ CẢNH BÁO DEVTOOLS: Người dùng "${userName}" (${userEmail}) đã mở DevTools ${warningCount} lần liên tiếp`
    
    const alertDetails = {
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      warning_count: warningCount,
      current_page: currentPage || 'Unknown',
      ip_address: clientIP,
      user_agent: userAgent,
      alert_reason: alertReason,
      timestamp: new Date().toISOString(),
      severity: (warningCount >= 3 || alertReason === 'timeout') ? 'HIGH' : 'MEDIUM'
    }

    // Kiểm tra xem đã có cảnh báo về DevTools trong 1 giờ qua chưa để tránh spam
    const existingAlert = await sql`
      SELECT id FROM admin_alerts 
      WHERE user_id = ${userId} 
        AND alert_type = 'devtools_detected'
        AND created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 1
    `

    let alertId = null

    if (existingAlert.length === 0) {
      // Tạo cảnh báo mới
      const newAlert = await sql`
        INSERT INTO admin_alerts (user_id, alert_type, message, details)
        VALUES (${userId}, 'devtools_detected', ${alertMessage}, ${JSON.stringify(alertDetails)})
        RETURNING id
      `
      alertId = newAlert[0].id
    } else {
      // Cập nhật cảnh báo hiện có với thông tin mới
      await sql`
        UPDATE admin_alerts 
        SET 
          message = ${alertMessage},
          details = ${JSON.stringify(alertDetails)},
          is_read = false,
          created_at = NOW()
        WHERE id = ${existingAlert[0].id}
      `
      alertId = existingAlert[0].id
    }

    console.log(`🚨 DEVTOOLS WARNING: User ${userName} (${userEmail}) - ${warningCount} times - IP: ${clientIP}`)

    return NextResponse.json({
      success: true,
      message: 'Cảnh báo đã được gửi đến admin',
      alertId: alertId,
      warningCount: warningCount
    })

  } catch (error) {
    console.error('Error creating DevTools warning:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server khi tạo cảnh báo' },
      { status: 500 }
    )
  }
}
