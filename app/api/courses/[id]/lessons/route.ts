import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET /api/courses/[id]/lessons - Lấy danh sách lessons của một khóa học
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'ID khóa học không hợp lệ' },
        { status: 400 }
      );
    }

    // Kiểm tra course có tồn tại không
    const courseExists = await sql`
      SELECT id FROM courses WHERE id = ${courseId}
    `;

    if (courseExists.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy khóa học' },
        { status: 404 }
      );
    }

    // Lấy danh sách lessons
    const lessons = await sql`
      SELECT id, course_id, title, description, video_url, duration, order_index, created_at, updated_at
      FROM lessons 
      WHERE course_id = ${courseId}
      ORDER BY order_index ASC
    `;

    return NextResponse.json({
      success: true,
      lessons: lessons
    });

  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách bài học' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/lessons - Tạo lesson mới cho khóa học
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'ID khóa học không hợp lệ' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, video_url, duration, order_index } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra course có tồn tại không
    const courseExists = await sql`
      SELECT id FROM courses WHERE id = ${courseId}
    `;

    if (courseExists.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy khóa học' },
        { status: 404 }
      );
    }

    // Tạo lesson mới
    const result = await sql`
      INSERT INTO lessons (course_id, title, description, video_url, duration, order_index)
      VALUES (${courseId}, ${title}, ${description}, ${video_url}, ${duration || 0}, ${order_index || 0})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      lesson: result[0]
    });

  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo bài học' },
      { status: 500 }
    );
  }
} 