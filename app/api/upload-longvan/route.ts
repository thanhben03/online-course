import { NextRequest, NextResponse } from 'next/server'
import { generateUploadUrl } from "@/lib/s3-longvan"

export async function POST(request: NextRequest) {
  try {
    console.log('Starting pre-signed URL generation...')
    
    const body = await request.json()
    const { fileName, contentType, folder = 'uploads' } = body
    
    if (!fileName || !contentType) {
      console.error('Missing fileName or contentType')
      return NextResponse.json({ error: 'fileName and contentType are required' }, { status: 400 })
    }

    console.log('Request data:', { fileName, contentType, folder })

    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing AWS credentials')
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 })
    }

    console.log('Environment variables check passed')

    console.log('Generating pre-signed URL...')
    const { url, key } = await generateUploadUrl(fileName, contentType, folder)
    
    console.log('Pre-signed URL generated successfully:', { key })

    return NextResponse.json({
      success: true,
      uploadUrl: url,
      key,
      expiresIn: 300 // 5 phút
    })

  } catch (error) {
    console.error('Pre-signed URL generation error:', error)
    
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
    
    return NextResponse.json({ error: 'Failed to generate pre-signed URL' }, { status: 500 })
  }
}
