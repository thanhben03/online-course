import { NextRequest, NextResponse } from 'next/server';
import { instructorService } from '@/lib/services/instructorService';

// GET /api/admin/instructors - Lấy tất cả instructors
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 GET request received for all instructors');
    const instructors = await instructorService.getAll();
    console.log('✅ Fetched instructors:', instructors);
    return NextResponse.json({ instructors });
  } catch (error) {
    console.error('❌ Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/instructors - Tạo instructor mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, company, avatar_url, courses_count, lessons_count, rating, expertise, order_index } = body;

    // Validate required fields
    if (!name || !title || !company) {
      return NextResponse.json(
        { error: 'Name, title, and company are required' },
        { status: 400 }
      );
    }

    const instructor = await instructorService.create({
      name,
      title,
      company,
      avatar_url,
      courses_count,
      lessons_count,
      rating,
      expertise,
      order_index
    });

    return NextResponse.json({ instructor }, { status: 201 });
  } catch (error) {
    console.error('Error creating instructor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
