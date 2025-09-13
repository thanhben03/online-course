import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3LongVan, generateS3Key } from "@/lib/s3-longvan"

export async function POST(request: NextRequest) {
  try {
    console.log('Starting upload-proxy with server upload (CORS bypass)...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', { name: file.name, size: file.size, type: file.type })

    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing AWS credentials')
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 })
    }

    console.log('Environment variables check passed')

    // Generate unique key
    const key = generateS3Key(file.name, 'uploads')
    console.log('Generated key:', key)

    // For large files, we need to use streaming upload
    // Convert file to buffer in chunks to avoid memory issues
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('File converted to buffer, size:', buffer.length)

    console.log('Uploading to S3 via server (CORS bypass)...')
    await uploadToS3LongVan(buffer, key, file.type)
    console.log('S3 upload successful')

    const url = `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19430110-courses'}/${key}`
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