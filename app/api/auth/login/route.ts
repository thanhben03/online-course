import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';

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