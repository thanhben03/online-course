import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3LongVan, generateS3Key } from "@/lib/s3-longvan"

export async function POST(request: NextRequest) {
  try {
    console.log('Starting proxy upload...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', { name: file.name, size: file.size, type: file.type })

    // Bỏ giới hạn file size - cho phép upload file lớn
    // const maxSize = 10 * 1024 * 1024
    // if (file.size > maxSize) {
    //   console.error('File too large:', file.size)
    //   return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 })
    // }

    // Bỏ giới hạn file type - cho phép tất cả loại file
    // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    // if (!allowedTypes.includes(file.type)) {
    //   console.error('File type not allowed:', file.type)
    //   return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    // }

    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing AWS credentials')
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 })
    }

    console.log('Environment variables check passed')

    // Generate unique key
    const key = generateS3Key(file.name, 'uploads')
    console.log('Generated key:', key)

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('File converted to buffer, size:', buffer.length)

    console.log('Uploading to S3...')
    await uploadToS3LongVan(buffer, key, file.type)
    console.log('S3 upload successful')

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