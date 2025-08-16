import { NextRequest, NextResponse } from 'next/server';
import { loginSecurityService } from '@/lib/services/loginSecurityService';

// GET - Lấy thông tin bảo mật của user cụ thể
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'User ID không hợp lệ' },
        { status: 400 }
      );
    }

    // Lấy thống kê đăng nhập
    const loginStats = await loginSecurityService.getLoginStats(userId);
    
    // Lấy lịch sử đăng nhập
    const loginHistory = await loginSecurityService.getUserLoginHistory(userId, 50);
    
    // Lấy danh sách IP đã sử dụng
    const recentIPs = await loginSecurityService.getRecentLoginIPs(userId, 30);
    
    // Đếm số IP khác nhau
    const uniqueIPCount = await loginSecurityService.countUniqueIPs(userId, 30);

    return NextResponse.json({
      success: true,
      data: {
        stats: loginStats,
        recent_ips: recentIPs,
        unique_ip_count: uniqueIPCount,
        login_history: loginHistory
      }
    });
  } catch (error) {
    console.error('Error fetching user security info:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải thông tin bảo mật' },
      { status: 500 }
    );
  }
}
