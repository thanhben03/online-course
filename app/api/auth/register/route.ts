import { NextRequest, NextResponse } from 'next/server';
import { User, userService } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name và password là bắt buộc' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await userService.createUser({
      email,
      name,
      password
    });

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user as User & { password_hash: string };

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Lỗi đăng ký' },
      { status: 500 }
    );
  }
} 