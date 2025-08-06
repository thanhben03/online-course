import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '@/lib/services/courseService';

// GET /api/courses/[id] - Lấy thông tin khóa học
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID khóa học không hợp lệ' },
        { status: 400 }
      );
    }

    const course = await courseService.getCourseById(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Không tìm thấy khóa học' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy thông tin khóa học' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Cập nhật khóa học
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID khóa học không hợp lệ' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, thumbnail_url, price, status } = body;

    const course = await courseService.updateCourse(id, {
      title,
      description,
      thumbnail_url,
      price,
      status
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Không tìm thấy khóa học' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật khóa học' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Xóa khóa học
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID khóa học không hợp lệ' },
        { status: 400 }
      );
    }

    const success = await courseService.deleteCourse(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Không tìm thấy khóa học' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Khóa học đã được xóa thành công'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa khóa học' },
      { status: 500 }
    );
  }
} 