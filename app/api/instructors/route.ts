import { NextRequest, NextResponse } from 'next/server';
import { instructorService } from '@/lib/services/instructorService';

// GET /api/instructors - Lấy tất cả instructors đang hoạt động (public)
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 GET request received for public instructors');
    
    const instructors = await instructorService.getAllActive();
    console.log('✅ Fetched active instructors:', instructors);
    
    return NextResponse.json({ 
      instructors,
      count: instructors.length 
    });
  } catch (error) {
    console.error('❌ Error fetching active instructors:', error);
    
    // Trả về dữ liệu mặc định nếu có lỗi
    const fallbackInstructors = [
      {
        id: 1,
        name: "Nguyễn Hoàng Duy",
        title: "Admin/Founder",
        company: "Olympic Toán Giải Tích",
        avatar_url: "/placeholder-user.jpg",
        courses_count: 7,
        lessons_count: 80,
        rating: 4.8,
        expertise: ["VJIMC", "Olympic Toán Giải Tích", "Manim"],
        order_index: 1
      }
    ];
    
    return NextResponse.json({ 
      instructors: fallbackInstructors,
      count: fallbackInstructors.length,
      fallback: true
    });
  }
}
