import { NextRequest, NextResponse } from 'next/server';
import { instructorService } from '@/lib/services/instructorService';

// GET /api/admin/instructors/[id] - Lấy instructor theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const instructor = await instructorService.getById(id);
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    return NextResponse.json({ instructor });
  } catch (error) {
    console.error('Error fetching instructor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/instructors/[id] - Cập nhật instructor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 PUT request received for instructor ID:', params.id);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      console.log('❌ Invalid ID:', params.id);
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    console.log('📝 Request body:', body);
    console.log('🔍 Updating instructor with ID:', id);

    // Kiểm tra xem instructor có tồn tại trước khi update không
    const existingInstructor = await instructorService.getById(id);
    if (!existingInstructor) {
      console.log('❌ Instructor not found before update, ID:', id);
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }
    console.log('✅ Found existing instructor before update:', existingInstructor);

    const instructor = await instructorService.update(id, body);
    console.log('✅ Update result:', instructor);

    if (!instructor) {
      console.log('❌ Instructor not found after update');
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    console.log('🎉 Instructor updated successfully');
    return NextResponse.json({ instructor });
  } catch (error) {
    console.error('❌ Error updating instructor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/instructors/[id] - Xóa instructor (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const success = await instructorService.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
