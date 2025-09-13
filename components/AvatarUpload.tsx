'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatarUrl?: string
  instructorId: string | number
  instructorName: string
  onUploadSuccess?: (newAvatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  uploadType?: 'instructor' | 'site-settings'
}

export function AvatarUpload({
  currentAvatarUrl,
  instructorId,
  instructorName,
  onUploadSuccess,
  size = 'md',
  disabled = false,
  uploadType = 'instructor'
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Kích thước avatar dựa trên prop size
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Kiểm tra loại file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Loại file không được phép. Chỉ chấp nhận ảnh (JPEG, PNG, GIF, WebP)')
      return
    }

    // Kiểm tra kích thước file (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File quá lớn. Kích thước tối đa cho ảnh avatar là 5MB')
      return
    }

    // Tạo preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    if (!file || uploading) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Chỉ thêm instructorId cho upload instructor
      if (uploadType === 'instructor') {
        formData.append('instructorId', instructorId.toString())
      }

      const apiEndpoint = uploadType === 'site-settings' 
        ? '/api/admin/site-settings/upload-avatar'
        : '/api/admin/instructors/upload-avatar'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload thất bại')
      }

      toast.success('Upload avatar thành công!')
      
      // Gọi callback nếu có
      if (onUploadSuccess) {
        onUploadSuccess(result.data.avatarUrl)
      }

      // Reset preview URL sau khi upload thành công
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi upload avatar')
      
      // Reset preview nếu upload thất bại
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    if (disabled || uploading) return
    fileInputRef.current?.click()
  }

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar hiển thị */}
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={previewUrl || currentAvatarUrl} 
            alt={`Avatar của ${instructorName}`}
          />
          <AvatarFallback>
            {instructorName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay khi đang upload */}
        {uploading && (
          <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center ${sizeClasses[size]}`}>
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {/* Nút hủy preview */}
        {previewUrl && !uploading && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
            onClick={handleCancelPreview}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Input file ẩn */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Nút upload */}
      <Button
        onClick={handleButtonClick}
        disabled={disabled || uploading}
        variant="outline"
        size="sm"
        className="w-full max-w-xs"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang upload...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {previewUrl ? 'Chọn ảnh khác' : 'Chọn ảnh avatar'}
          </>
        )}
      </Button>

      {/* Hướng dẫn */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Chấp nhận: JPEG, PNG, GIF, WebP
        <br />
        Kích thước tối đa: 5MB
      </p>
    </div>
  )
}
