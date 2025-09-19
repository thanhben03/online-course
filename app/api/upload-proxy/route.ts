import { NextRequest, NextResponse } from 'next/server'
import { uploadStreamToS3LongVan, generateS3Key } from "@/lib/s3-longvan"

export async function POST(request: NextRequest) {
  try {
    console.log('Starting optimized proxy upload...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', { name: file.name, size: file.size, type: file.type })

    // Kiểm tra file size để quyết định phương pháp upload
    const fileSize = file.size
    const maxMemorySize = 100 * 1024 * 1024 // 100MB - ngưỡng để quyết định dùng stream
    
    console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`)

    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing AWS credentials')
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 })
    }

    console.log('Environment variables check passed')

    // Generate unique key
    const key = generateS3Key(file.name, 'uploads')
    console.log('Generated key:', key)

    // Sử dụng stream cho file lớn để tránh load toàn bộ vào memory
    if (fileSize > maxMemorySize) {
      console.log('Large file detected - using stream upload')
      
      // Tạo ReadableStream từ file
      const stream = file.stream()
      
      console.log('Uploading large file to S3 using stream...')
      await uploadStreamToS3LongVan(stream, key, file.type, fileSize)
      console.log('S3 stream upload successful')
    } else {
      console.log('Small file - using buffer upload')
      
      // Convert file to buffer cho file nhỏ
      const buffer = Buffer.from(await file.arrayBuffer())
      console.log('File converted to buffer, size:', buffer.length)

      console.log('Uploading to S3...')
      const { uploadToS3LongVan } = await import("@/lib/s3-longvan")
      await uploadToS3LongVan(buffer, key, file.type)
      console.log('S3 upload successful')
    }

    const url = `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19428351-course'}/${key}`
    console.log('Generated URL:', url)

    return NextResponse.json({ 
      success: true,
      url,
      key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error('Proxy upload error:', error)
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.message.includes('credentials')) {
        return NextResponse.json({ error: 'Invalid AWS credentials' }, { status: 500 })
      }
      if (error.message.includes('bucket')) {
        return NextResponse.json({ error: 'Bucket not found or access denied' }, { status: 500 })
      }
      if (error.message.includes('network')) {
        return NextResponse.json({ error: 'Network error - check endpoint' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Upload failed - check server logs' }, { status: 500 })
  }
} 