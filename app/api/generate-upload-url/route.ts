import { NextRequest, NextResponse } from 'next/server'
import { generateUploadUrl } from '@/lib/s3-longvan'

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType, folder = 'uploads' } = await request.json()
    
    if (!fileName || !contentType) {
      return NextResponse.json({ 
        error: 'fileName and contentType are required' 
      }, { status: 400 })
    }

    // Generate presigned URL for direct upload
    const { url, key } = await generateUploadUrl(fileName, contentType, folder)
    
    // Return presigned URL and file info
    return NextResponse.json({
      success: true,
      uploadUrl: url,
      key: key,
      fileName: fileName,
      contentType: contentType,
      // URL sau khi upload thành công
      finalUrl: `https://s3-hcm5-r1.longvan.net/${process.env.AWS_S3_BUCKET || '19430110-courses'}/${key}`
    })

  } catch (error) {
    console.error('Generate upload URL error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 })
      }
      if (error.message.includes('bucket')) {
        return NextResponse.json({ error: 'S3 bucket not found' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate upload URL' 
    }, { status: 500 })
  }
}
