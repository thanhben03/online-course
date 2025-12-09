// app/api/upload-proxy/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Busboy from 'busboy'
import { Readable } from 'stream'
import { uploadStreamToS3LongVan, generateS3Key } from '@/lib/s3-longvan'

export async function POST(req: NextRequest) {
  return new Promise((resolve, reject) => {
    // Convert Web ReadableStream (req.body) sang Node Readable
    if (!req.body) {
      resolve(NextResponse.json({ error: 'No body' }, { status: 400 }))
      return
    }
    const nodeStream = Readable.fromWeb(req.body as any)

    // Khởi tạo busboy với headers
    const busboy = Busboy({ headers: Object.fromEntries(req.headers) })
    let uploadPromise: Promise<any> | null = null

    busboy.on('file', (fieldname, file, info) => {
      const key = generateS3Key(info.filename, 'uploads')
      // file ở đây là Node Readable
      uploadPromise = uploadStreamToS3LongVan(
        file, // Node stream
        key,
        info.mimeType,
        parseInt(req.headers.get('content-length') || '0')
      )
    })

    busboy.on('finish', async () => {
      try {
        const result = await uploadPromise
        resolve(NextResponse.json({ success: true, result }))
      } catch (err) {
        reject(err)
      }
    })

    nodeStream.pipe(busboy)
  })
}
