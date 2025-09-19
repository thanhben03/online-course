// lib/s3Client.ts
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://s3-hcm5-r1.longvan.net',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true
})

export const generateUploadUrl = async (fileName: string, contentType: string, folder: string = 'uploads') => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = fileName.split('.').pop()
  const key = `${folder}/${timestamp}-${randomString}.${extension}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19430110-courses',
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })

  // Thêm CORS headers vào pre-signed URL
  const url = await getSignedUrl(s3Client, command, { 
    expiresIn: 300, // 5 phút
    unhoistableHeaders: new Set(['x-amz-acl']),
    signableHeaders: new Set(['host', 'x-amz-acl', 'x-amz-content-sha256', 'x-amz-date', 'x-amz-security-token'])
  })
  
  return { url, key }
}

export const uploadToS3LongVan = async (file: Buffer, key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19430110-courses',
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  })

  return await s3Client.send(command)
}

// Multipart upload cho file lớn để tránh memory overflow
export const uploadStreamToS3LongVan = async (
  stream: ReadableStream<Uint8Array>, 
  key: string, 
  contentType: string,
  contentLength: number
) => {
  const bucketName = process.env.AWS_S3_BUCKET || '19430110-courses'
  const partSize = 5 * 1024 * 1024 // 5MB per part (minimum cho S3 multipart)
  
  console.log(`Starting multipart upload for ${key}, size: ${(contentLength / 1024 / 1024).toFixed(2)}MB`)
  
  // Bước 1: Khởi tạo multipart upload
  const createCommand = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })
  
  const { UploadId } = await s3Client.send(createCommand)
  console.log(`Multipart upload initiated with ID: ${UploadId}`)
  
  const parts: { ETag: string; PartNumber: number }[] = []
  const reader = stream.getReader()
  let partNumber = 1
  let buffer = new Uint8Array()
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (value) {
        // Thêm data vào buffer
        const newBuffer = new Uint8Array(buffer.length + value.length)
        newBuffer.set(buffer)
        newBuffer.set(value, buffer.length)
        buffer = newBuffer
      }
      
      // Upload part khi buffer đủ lớn hoặc stream kết thúc
      if (buffer.length >= partSize || (done && buffer.length > 0)) {
        console.log(`Uploading part ${partNumber}, size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`)
        
        const uploadPartCommand = new UploadPartCommand({
          Bucket: bucketName,
          Key: key,
          PartNumber: partNumber,
          UploadId,
          Body: buffer,
        })
        
        const partResult = await s3Client.send(uploadPartCommand)
        parts.push({
          ETag: partResult.ETag!,
          PartNumber: partNumber,
        })
        
        console.log(`Part ${partNumber} uploaded successfully`)
        partNumber++
        buffer = new Uint8Array() // Reset buffer
        
        // Force garbage collection để giải phóng memory
        if (global.gc) {
          global.gc()
        }
      }
      
      if (done) break
    }
    
    // Bước 3: Complete multipart upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId,
      MultipartUpload: {
        Parts: parts,
      },
    })
    
    const result = await s3Client.send(completeCommand)
    console.log(`Multipart upload completed successfully for ${key}`)
    return result
    
  } catch (error) {
    // Abort multipart upload nếu có lỗi
    console.error('Multipart upload failed, aborting...', error)
    
    try {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId,
      })
      await s3Client.send(abortCommand)
      console.log('Multipart upload aborted successfully')
    } catch (abortError) {
      console.error('Failed to abort multipart upload:', abortError)
    }
    
    throw error
  } finally {
    reader.releaseLock()
  }
}

export const deleteFromS3LongVan = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19430110-courses',
    Key: key,
  })

  return await s3Client.send(command)
}

export const getSignedDownloadUrl = async (key: string, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19430110-courses',
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export const generateS3Key = (fileName: string, folder: string = 'uploads') => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = fileName.split('.').pop()
  return `${folder}/${timestamp}-${randomString}.${extension}`
}

export default s3Client
