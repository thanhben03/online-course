import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Debug instructors database...');

    // Kiểm tra xem bảng có tồn tại không
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'instructors'
      );
    `;
    
    const tableExistsResult = tableExists[0]?.exists;
    console.log('📋 Table exists:', tableExistsResult);

    if (!tableExistsResult) {
      return NextResponse.json({ 
        success: false, 
        error: 'Instructors table does not exist',
        tableExists: false
      });
    }

    // Kiểm tra cấu trúc bảng
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'instructors' 
      ORDER BY ordinal_position;
    `;
    console.log('🏗️ Table structure:', tableStructure);

    // Kiểm tra dữ liệu
    const allInstructors = await sql`SELECT * FROM instructors ORDER BY id`;
    console.log('📊 All instructors count:', allInstructors.length);
    
    const activeInstructors = await sql`SELECT * FROM instructors WHERE is_active = true ORDER BY id`;
    console.log('✅ Active instructors count:', activeInstructors.length);

    // Kiểm tra instructor cụ thể (ID 1)
    const instructor1 = await sql`SELECT * FROM instructors WHERE id = 1`;
    console.log('🔍 Instructor with ID 1:', instructor1[0] || 'Not found');

    return NextResponse.json({ 
      success: true,
      tableExists: true,
      tableStructure,
      allInstructorsCount: allInstructors.length,
      activeInstructorsCount: activeInstructors.length,
      allInstructors: allInstructors,
      activeInstructors: activeInstructors,
      instructor1: instructor1[0] || null
    });

  } catch (error) {
    console.error('❌ Error debugging instructors database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to debug instructors database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

