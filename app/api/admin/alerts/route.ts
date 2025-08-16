import { NextRequest, NextResponse } from 'next/server';
import { loginSecurityService } from '@/lib/services/loginSecurityService';

// GET - Lấy danh sách cảnh báo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';
    
    let alerts;
    if (showAll) {
      // Lấy tất cả cảnh báo (cần thêm phân trang sau)
      const result = await loginSecurityService.getAllAlerts();
      alerts = result;
    } else {
      // Lấy chỉ cảnh báo chưa đọc
      alerts = await loginSecurityService.getUnreadAlerts();
    }

    return NextResponse.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải cảnh báo' },
      { status: 500 }
    );
  }
}

// PUT - Đánh dấu cảnh báo đã đọc
export async function PUT(request: NextRequest) {
  try {
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID là bắt buộc' },
        { status: 400 }
      );
    }

    await loginSecurityService.markAlertAsRead(alertId);

    return NextResponse.json({
      success: true,
      message: 'Đã đánh dấu cảnh báo là đã đọc'
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi cập nhật cảnh báo' },
      { status: 500 }
    );
  }
}
