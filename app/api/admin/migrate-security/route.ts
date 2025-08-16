import { NextResponse } from 'next/server';
import { addSecurityTables } from '@/scripts/add-security-tables';

export async function POST() {
  try {
    await addSecurityTables();
    
    return NextResponse.json({
      success: true,
      message: 'Đã tạo thành công các bảng bảo mật (login_sessions, admin_alerts)'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Lỗi khi tạo bảng bảo mật',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
