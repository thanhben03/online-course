import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';
import { loginSecurityService } from '@/lib/services/loginSecurityService';
import { getClientIP, getUserAgent, normalizeIP } from '@/lib/utils/getClientIP';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và password là bắt buộc' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Email hoặc password không đúng' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await userService.verifyPassword(user, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email hoặc password không đúng' },
        { status: 401 }
      );
    }

    // Ghi lại thông tin đăng nhập và kiểm tra IP
    try {
      const clientIP = normalizeIP(getClientIP(request));
      const userAgent = getUserAgent(request);
      
      // Ghi lại session đăng nhập
      await loginSecurityService.recordLoginSession(user.id, clientIP, userAgent);
      
      // Kiểm tra và tạo cảnh báo nếu cần thiết
      const alertCreated = await loginSecurityService.checkAndCreateMultipleIPAlert(user.id, clientIP);
      
      if (alertCreated) {
        console.log(`Cảnh báo: Tài khoản ${user.email} đã đăng nhập từ nhiều IP khác nhau`);
      }
    } catch (securityError) {
      // Log lỗi nhưng không làm gián đoạn quá trình đăng nhập
      console.error('Lỗi khi ghi lại thông tin bảo mật:', securityError);
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Lỗi đăng nhập' },
      { status: 500 }
    );
  }
} 