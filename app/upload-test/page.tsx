"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/header"
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download,
  Copy,
  Trash2,
  Video
} from "lucide-react"

interface UploadedFile {
  url: string
  key: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: Date
}

const BUCKET_NAME = '19428351-course'

export default function UploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedMB, setUploadedMB] = useState(0)
  const [totalMB, setTotalMB] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [uploadStartTime, setUploadStartTime] = useState<number>(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [folder, setFolder] = useState("uploads")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file: File) => {
    // Bỏ giới hạn file size - cho phép upload file lớn
    // const maxSize = 10 * 1024 * 1024
    // if (file.size > maxSize) {
    //   setError("File quá lớn. Tối đa 10MB được phép.")
    //   return
    // }

    // Bỏ giới hạn file type - cho phép tất cả loại file
    // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    // if (!allowedTypes.includes(file.type)) {
    //   setError("Loại file không được hỗ trợ.")
    //   return
    // }

    setSelectedFile(file)
    setError("")
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    setUploadedMB(0);
    setTotalMB(selectedFile.size / (1024 * 1024)); // Convert bytes to MB
    setUploadSpeed(0);
    setUploadStartTime(Date.now());
    setError("");
    setSuccess("");

    try {
      console.log('Starting upload via upload-proxy (server upload)...');

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Sử dụng XMLHttpRequest để theo dõi tiến trình upload
      const xhr = new XMLHttpRequest();

      // Promise để handle XMLHttpRequest
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressPercent = Math.round((event.loaded / event.total) * 100);
            const uploadedMegabytes = event.loaded / (1024 * 1024);
            const totalMegabytes = event.total / (1024 * 1024);
            
            // Tính tốc độ upload (MB/s)
            const currentTime = Date.now();
            const elapsedSeconds = (currentTime - uploadStartTime) / 1000;
            const currentSpeed = elapsedSeconds > 0 ? uploadedMegabytes / elapsedSeconds : 0;
            
            setProgress(progressPercent);
            setUploadedMB(uploadedMegabytes);
            setTotalMB(totalMegabytes);
            setUploadSpeed(currentSpeed);
            
            console.log(`🚀 UPLOAD PROGRESS THẬT: ${progressPercent}% | ${uploadedMegabytes.toFixed(2)}MB / ${totalMegabytes.toFixed(2)}MB | Speed: ${currentSpeed.toFixed(2)} MB/s`);
            console.log(`📊 Bytes uploaded: ${event.loaded.toLocaleString()} / ${event.total.toLocaleString()}`);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });

        xhr.open('POST', '/api/upload-proxy');
        xhr.send(formData);
      });

      const result = await uploadPromise;

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setProgress(100);
      console.log('File uploaded successfully via server:', result.key);

      const uploadedFile: UploadedFile = {
        url: result.url,
        key: result.key,
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
        uploadedAt: new Date(),
      };

      setUploadedFiles(prev => [uploadedFile, ...prev]);
      setSuccess(`Upload thành công: ${selectedFile.name}`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi upload. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      setProgress(0);
      setUploadedMB(0);
      setTotalMB(0);
      setUploadSpeed(0);
      setUploadStartTime(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Đã copy URL vào clipboard!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (fileType === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header variant="default" />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Upload S3 Long Vân</h1>
            <p className="text-gray-600">Upload file lên S3 Long Vân qua Server Upload (CORS Bypass - Vercel Compatible - Không giới hạn dung lượng)</p>
          </div>

          {/* Configuration Info */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Cấu hình S3 Long Vân</CardTitle>
              <CardDescription className="text-blue-700">
                Endpoint: s3-hcm5-r1.longvan.net | Bucket: {BUCKET_NAME} | Server Upload (CORS Bypass)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-blue-800">Upload Method</Label>
                  <Input 
                    value="Server Upload (CORS Bypass)" 
                    readOnly 
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-blue-800">Referer Header</Label>
                  <Input 
                    value="http://localhost:3000" 
                    readOnly 
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>
                Chọn file để upload lên S3 Long Vân. Hỗ trợ tất cả loại file bao gồm video, hình ảnh, tài liệu (không giới hạn kích thước)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Folder Selection */}
              <div>
                <Label htmlFor="folder">Thư mục đích</Label>
                <Input
                  id="folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="uploads"
                  className="mt-1"
                />
              </div>

              {/* File Selection */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  accept="*/*"
                  className="hidden"
                />
                
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Hỗ trợ tất cả loại file: Video, hình ảnh, tài liệu, v.v. (không giới hạn kích thước)
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Chọn File
                </Button>
              </div>

              {/* Selected File Preview */}
              {selectedFile && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedFile.type)}
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Đang upload...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{uploadedMB.toFixed(2)} MB / {totalMB.toFixed(2)} MB</span>
                      <span>{((uploadedMB / totalMB) * 100).toFixed(1)}% hoàn thành</span>
                    </div>
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>📊 Upload thật từ browser → server</span>
                      <span>⚡ {uploadSpeed.toFixed(2)} MB/s</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload lên S3 Long Vân
                  </>
                )}
              </Button>

              {/* Alerts */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Files đã upload</CardTitle>
                <CardDescription>
                  Danh sách các file đã upload thành công lên S3 Long Vân
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.fileType)}
                          <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.fileSize)} • {file.fileType}
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.uploadedAt.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{file.key}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(file.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Input
                          value={file.url}
                          readOnly
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 