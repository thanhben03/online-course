import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3LongVan, generateS3Key } from "@/lib/s3-longvan"

// Tăng giới hạn runtime cho streaming
export const maxDuration = 300; // 5 phút
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting streaming upload to bypass Vercel limits...')
    
    // Sử dụng stream thay vì formData để bypass 4.5MB limit
    const contentLength = request.headers.get('content-length')
    const contentType = request.headers.get('content-type') || 'application/octet-stream'
    const fileName = request.headers.get('x-file-name') || 'unnamed-file'
    
    if (!contentLength) {
      return NextResponse.json({ error: 'Content-Length header required' }, { status: 400 })
    }
    
    const fileSize = parseInt(contentLength)
    console.log(`Streaming upload: ${fileName}, size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)
    
    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing AWS credentials')
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 })
    }
    
    // Generate unique key
    const key = generateS3Key(fileName, 'uploads')
    console.log('Generated key:', key)
    
    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = request.body?.getReader()
    
    if (!reader) {
      return NextResponse.json({ error: 'No request body' }, { status: 400 })
    }
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }
    
    // Combine chunks into single buffer
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const buffer = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }
    
    console.log(`Stream processed: ${buffer.length} bytes`)
    
    // Upload to S3
    console.log('Uploading to S3 via streaming...')
    await uploadToS3LongVan(Buffer.from(buffer), key, contentType)
    console.log('S3 streaming upload successful')
    
    const url = `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19430110-courses'}/${key}`
    console.log('Generated URL:', url)
    
    return NextResponse.json({ 
      success: true,
      url,
      key,
      fileName,
      fileSize: buffer.length,
      fileType: contentType
    })
    
  } catch (error) {
    console.error('Streaming upload error:', error)
    
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
    
    return NextResponse.json({ error: 'Streaming upload failed - check server logs' }, { status: 500 })
  }
}
