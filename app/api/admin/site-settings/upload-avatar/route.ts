import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3LongVan, generateS3Key, deleteFromS3LongVan } from "@/lib/s3-longvan"
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting site settings avatar upload...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ error: 'Không có file được cung cấp' }, { status: 400 })
    }

    console.log('File received:', { name: file.name, size: file.size, type: file.type })

    // Kiểm tra loại file - chỉ cho phép ảnh
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.error('File type not allowed:', file.type)
      return NextResponse.json({ 
        error: 'Loại file không được phép. Chỉ chấp nhận ảnh (JPEG, PNG, GIF, WebP)' 
      }, { status: 400 })
    }

    // Kiểm tra kích thước file - tối đa 5MB cho ảnh avatar
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size)
      return NextResponse.json({ 
        error: 'File quá lớn. Kích thước tối đa cho ảnh avatar là 5MB' 
      }, { status: 400 })
    }

    // Kiểm tra môi trường S3
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing AWS credentials')
      return NextResponse.json({ error: 'Cấu hình AWS chưa đúng' }, { status: 500 })
    }

    // Lấy setting instructor_avatar hiện tại
    const currentSetting = await sql`
      SELECT setting_value FROM site_settings WHERE setting_key = 'instructor_avatar'
    `

    console.log('Environment variables check passed')

    // Tạo key S3 cho avatar trong thư mục riêng
    const key = generateS3Key(file.name, 'avatars/site-settings')
    console.log('Generated key:', key)

    // Chuyển file thành buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('File converted to buffer, size:', buffer.length)

    console.log('Uploading to S3...')
    await uploadToS3LongVan(buffer, key, file.type)
    console.log('S3 upload successful')

    // Tạo URL công khai
    const avatarUrl = `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19428351-course'}/${key}`

    // Lấy avatar URL cũ để xóa (nếu không phải placeholder)
    let oldKey = null
    if (currentSetting.length > 0) {
      const oldAvatarUrl = currentSetting[0].setting_value
      if (oldAvatarUrl && !oldAvatarUrl.includes('placeholder')) {
        // Trích xuất key từ URL cũ
        const urlParts = oldAvatarUrl.split('/')
        const bucketIndex = urlParts.findIndex((part: string) => part === (process.env.AWS_S3_BUCKET || '19428351-course'))
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          oldKey = urlParts.slice(bucketIndex + 1).join('/')
        }
      }
    }

    // Cập nhật setting trong database
    await sql`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
      VALUES ('instructor_avatar', ${avatarUrl}, 'text', 'Ảnh đại diện giảng viên')
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = ${avatarUrl}, 
        updated_at = CURRENT_TIMESTAMP
    `

    // Xóa ảnh cũ từ S3 (nếu có)
    if (oldKey) {
      try {
        await deleteFromS3LongVan(oldKey)
        console.log('Old avatar deleted from S3:', oldKey)
      } catch (error) {
        console.warn('Failed to delete old avatar:', error)
        // Không throw error vì upload mới đã thành công
      }
    }

    console.log('Site settings avatar updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Upload avatar thành công',
      data: {
        avatarUrl,
        key,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    })

  } catch (error) {
    console.error('Upload site settings avatar error:', error)
    return NextResponse.json({
      success: false,
      error: 'Có lỗi xảy ra khi upload avatar'
    }, { status: 500 })
  }
}
