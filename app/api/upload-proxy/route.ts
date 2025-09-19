import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3LongVan, uploadStreamToS3LongVan, generateS3Key } from "@/lib/s3-longvan"

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 VPS NGINX UPLOAD: Starting optimized upload for large files...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('❌ No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('📁 File received:', { 
      name: file.name, 
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`, 
      type: file.type 
    })

    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('❌ Missing AWS credentials')
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 })
    }

    console.log('✅ Environment variables check passed')

    // Generate unique key
    const key = generateS3Key(file.name, 'uploads')
    console.log('🔑 Generated key:', key)

    // Smart upload: Stream cho file lớn, Buffer cho file nhỏ
    const fileSize = file.size
    const streamThreshold = 100 * 1024 * 1024 // 100MB threshold

    if (fileSize > streamThreshold) {
      console.log('🌊 LARGE FILE: Using streaming upload for', `${(fileSize / 1024 / 1024).toFixed(2)}MB`)
      
      // Sử dụng streaming upload để tránh memory overflow
      const stream = file.stream()
      await uploadStreamToS3LongVan(stream, key, file.type, fileSize)
      console.log('✅ S3 streaming upload successful')
    } else {
      console.log('📦 SMALL FILE: Using buffer upload for', `${(fileSize / 1024 / 1024).toFixed(2)}MB`)
      
      // Sử dụng buffer upload cho file nhỏ (nhanh hơn)
      const buffer = Buffer.from(await file.arrayBuffer())
      await uploadToS3LongVan(buffer, key, file.type)
      console.log('✅ S3 buffer upload successful')
    }

    const url = `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19430110-courses'}/${key}`
    console.log('🔗 Generated URL:', url)

    return NextResponse.json({ 
      success: true,
      url,
      key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error('Upload-proxy error:', error)
    
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