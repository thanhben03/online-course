import { NextRequest } from 'next/server';
import { userService } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ 
          authenticated: false, 
          error: 'Thiếu thông tin xác thực' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Kiểm tra user trong database
    const user = await userService.findById(userId);
    
    if (!user || user.email !== email) {
      return new Response(
        JSON.stringify({ 
          authenticated: false, 
          error: 'Thông tin xác thực không hợp lệ' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Kiểm tra role admin
    if (user.role !== 'admin') {
      return new Response(
        JSON.stringify({ 
          authenticated: false, 
          error: 'Không có quyền truy cập admin' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        authenticated: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error checking admin auth:', error);
    return new Response(
      JSON.stringify({ 
        authenticated: false, 
        error: 'Lỗi kiểm tra quyền truy cập' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
