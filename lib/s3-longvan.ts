// lib/s3Client.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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
    Bucket: process.env.AWS_S3_BUCKET || '19428351-course',
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
    Bucket: process.env.AWS_S3_BUCKET || '19428351-course',
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  })

  return await s3Client.send(command)
}

export const deleteFromS3LongVan = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19428351-course',
    Key: key,
  })

  return await s3Client.send(command)
}

export const getSignedDownloadUrl = async (key: string, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19428351-course',
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
