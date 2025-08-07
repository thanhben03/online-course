"use client"

import { useEffect, useRef, useState } from 'react'
import { useDevToolsDetector } from '@/hooks/use-dev-tools-detector'

interface VideoPlayerProps {
  src: string
  className?: string
  autoPlay?: boolean
}

export default function VideoPlayer({ src, className = "", autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showDevToolsWarning, setShowDevToolsWarning] = useState(false)
  const isDevToolsOpen = useDevToolsDetector()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Handle dev tools detection
    if (isDevToolsOpen) {
      setShowDevToolsWarning(true)
      if (video) {
        video.pause()
      }
    } else {
      setShowDevToolsWarning(false)
    }

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common video download shortcuts
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C')
      ) {
        e.preventDefault()
        return false
      }
      
      // Detect F12 key
      if (e.key === 'F12') {
        e.preventDefault()
        setShowDevToolsWarning(true)
        if (video) {
          video.pause()
        }
        return false
      }
    }

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Disable selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    video.addEventListener('contextmenu', handleContextMenu)
    video.addEventListener('dragstart', handleDragStart)
    video.addEventListener('selectstart', handleSelectStart)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      video.removeEventListener('contextmenu', handleContextMenu)
      video.removeEventListener('dragstart', handleDragStart)
      video.removeEventListener('selectstart', handleSelectStart)
    }
  }, [isDevToolsOpen])

  const handleCloseWarning = () => {
    setShowDevToolsWarning(false)
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        controls
        autoPlay={autoPlay}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay to prevent interaction with video element */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Developer Tools Warning */}
      {showDevToolsWarning && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Phát hiện Developer Tools
            </h3>
            <p className="text-gray-600 mb-4">
              Vui lòng đóng Developer Tools (F12) để tiếp tục xem video. 
              Nếu người dùng cố tình bật Developer Tools nhiều lần, hệ thống sẽ tự động xóa tài khoản của người dùng mà không báo trước
            </p>
            <button
              onClick={handleCloseWarning}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 