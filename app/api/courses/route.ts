import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '@/lib/services/courseService';

// GET /api/courses - Lấy danh sách khóa học
export async function GET() {
  try {
    const courses = await courseService.getAllCourses();
    return NextResponse.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách khóa học' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Tạo khóa học mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, thumbnail_url, price, instructor_id, status } = body;

    // Validate required fields
    if (!title || !instructor_id) {
      return NextResponse.json(
        { error: 'Title và instructor_id là bắt buộc' },
        { status: 400 }
      );
    }

    const course = await courseService.createCourse({
      title,
      description,
      thumbnail_url,
      price,
      instructor_id,
      status
    });

    return NextResponse.json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo khóa học' },
      { status: 500 }
    );
  }
} 