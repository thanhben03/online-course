import { NextResponse } from 'next/server'
import sql from '@/lib/db'

// GET - Lấy nội quy trang web
export async function GET() {
  try {
    const rules = await sql`
      SELECT setting_value FROM site_settings WHERE setting_key = 'site_rules'
    `
    
    const siteRules = rules.length > 0 ? rules[0].setting_value : null
    
    return NextResponse.json({ 
      success: true, 
      rules: siteRules 
    })
  } catch (error) {
    console.error('Error fetching site rules:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tải nội quy' },
      { status: 500 }
    )
  }
}
