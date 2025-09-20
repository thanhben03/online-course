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
import { Readable } from 'stream'

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
    // Removed ACL từ presigned URL để tránh permission conflict
    // Public access sẽ được handle bởi bucket policy
    ACL: 'public-read',
  })

  // Simplified presigned URL generation  
  const url = await getSignedUrl(s3Client, command, { 
    expiresIn: 300, // 5 phút
  })
  
  return { url, key }
}

export const uploadToS3LongVan = async (file: Buffer, key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '19430110-courses',
    Key: key,
    Body: file,
    ContentType: contentType,
    // Removed ACL - sẽ dựa vào bucket policy cho public access
  })

  return await s3Client.send(command)
}

export const uploadStreamToS3LongVan = async (
  stream: Readable, // <- Node stream
  key: string,
  contentType: string,
  contentLength: number
) => {
  const bucketName = process.env.AWS_S3_BUCKET || '19430110-courses';
  const partSize = 10 * 1024 * 1024;

  const createCommand = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    // Removed ACL - sẽ dựa vào bucket policy cho public access
    ACL: 'public-read',
  });
  const { UploadId } = await s3Client.send(createCommand);

  const parts: { ETag: string; PartNumber: number }[] = [];
  let partNumber = 1;
  let chunkBuffer = Buffer.alloc(0);

  for await (const chunk of stream) {
    chunkBuffer = Buffer.concat([chunkBuffer, chunk]);
    if (chunkBuffer.length >= partSize) {
      const uploadChunk = chunkBuffer.subarray(0, partSize);

      const partResult = await s3Client.send(
        new UploadPartCommand({
          Bucket: bucketName,
          Key: key,
          PartNumber: partNumber,
          UploadId,
          Body: uploadChunk,
        })
      );
      parts.push({ ETag: partResult.ETag!, PartNumber: partNumber });
      partNumber++;
      chunkBuffer = chunkBuffer.subarray(partSize);
    }
  }

  // upload phần còn lại
  if (chunkBuffer.length > 0) {
    const partResult = await s3Client.send(
      new UploadPartCommand({
        Bucket: bucketName,
        Key: key,
        PartNumber: partNumber,
        UploadId,
        Body: chunkBuffer,
      })
    );
    parts.push({ ETag: partResult.ETag!, PartNumber: partNumber });
  }

  const completeCommand = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    UploadId,
    MultipartUpload: { Parts: parts },
  });
  return await s3Client.send(completeCommand);
};

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
