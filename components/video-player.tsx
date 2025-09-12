"use client"

import { useEffect, useRef, useState } from 'react'
import { useDevToolsDetector } from '@/hooks/use-dev-tools-detector'

interface VideoPlayerProps {
  src: string
  className?: string
  autoPlay?: boolean
  lessonId?: number
  userId?: number
  onProgressUpdate?: (watchedDuration: number, totalDuration: number, percentageWatched: number) => void
}

export default function VideoPlayer({ 
  src, 
  className = "", 
  autoPlay = false,
  lessonId,
  userId,
  onProgressUpdate
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showDevToolsWarning, setShowDevToolsWarning] = useState(false)
  const [watchedDuration, setWatchedDuration] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const { isDevToolsOpen, warningCount, shouldSendTimeoutAlert } = useDevToolsDetector()
  const latestSnapshotRef = useRef<{ watched: number; total: number } | null>(null)

  // Gửi cảnh báo đến admin khi F12 lần thứ 3 hoặc mở quá 5 giây
  const sendDevToolsAlert = async (count: number, reason: 'count' | 'timeout' = 'count') => {
    try {
      // Lấy thông tin user từ localStorage
      const userInfo = localStorage.getItem("userInfo")
      if (!userInfo) return

      const user = JSON.parse(userInfo)
      
      const response = await fetch('/api/admin/alerts/devtools-warning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          warningCount: count,
          currentPage: window.location.pathname,
          alertReason: reason
        })
      })

      const result = await response.json()
      if (result.success) {
        const reasonText = reason === 'timeout' ? 'mở quá 5 giây' : `lần ${count}`
        console.log(`🚨 Cảnh báo DevTools đã được gửi đến admin (${reasonText})`)
      }
    } catch (error) {
      console.error('Error sending DevTools alert:', error)
    }
  }

  // Video progress tracking functions
  const updateProgress = async (currentTime: number, duration: number) => {
    if (!lessonId || !userId || !duration) return

    const watchedSeconds = Math.floor(currentTime)
    const totalSeconds = Math.floor(duration)
    const percentageWatched = Math.round((watchedSeconds / totalSeconds) * 100)

    setWatchedDuration(watchedSeconds)
    setTotalDuration(totalSeconds)
    latestSnapshotRef.current = { watched: watchedSeconds, total: totalSeconds }

    // Call parent callback
    if (onProgressUpdate) {
      onProgressUpdate(watchedSeconds, totalSeconds, percentageWatched)
    }

    // Update progress in database every 10 seconds
    if (watchedSeconds % 10 === 0) {
      try {
        const response = await fetch(`/api/progress/${lessonId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            watchedDuration: watchedSeconds,
            completed: false, // Don't auto-complete, require manual action
            totalDuration: totalSeconds // Send video duration to update lesson
          })
        })
      } catch (error) {
        console.error('Failed to update progress:', error)
      }
    }
  }

  // Flush progress immediately (used on beforeunload/visibility change)
  const flushProgress = async () => {
    try {
      const snapshot = latestSnapshotRef.current
      const video = videoRef.current
      if (!lessonId || !userId) return
      const watchedSeconds = snapshot?.watched ?? (video ? Math.floor(video.currentTime) : 0)
      const totalSeconds = snapshot?.total ?? (video ? Math.floor(video.duration) : 0)
      if (totalSeconds <= 0) return
      await fetch(`/api/progress/${lessonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          watchedDuration: watchedSeconds,
          completed: false,
          totalDuration: totalSeconds
        })
      })
    } catch (e) {
      // best-effort
    }
  }

  const startProgressTracking = () => {
    if (progressUpdateInterval.current) return
    
    setIsTracking(true)
    progressUpdateInterval.current = setInterval(() => {
      const video = videoRef.current
      if (video && !video.paused) {
        updateProgress(video.currentTime, video.duration)
      }
    }, 1000) // Update every second
  }

  const stopProgressTracking = () => {
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current)
      progressUpdateInterval.current = null
    }
    setIsTracking(false)
  }

  // Handle timeout alert (mở DevTools quá 5 giây)
  useEffect(() => {
    if (shouldSendTimeoutAlert) {
      sendDevToolsAlert(warningCount, 'timeout')
    }
  }, [shouldSendTimeoutAlert])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Resume from previously saved progress
    const resumeFromSavedProgress = async () => {
      try {
        if (!lessonId || !userId) return
        const res = await fetch(`/api/progress/${lessonId}?userId=${userId}`)
        const json = await res.json()
        if (json?.success) {
          const savedWatched = json.progress?.watched_duration ?? 0
          const savedDuration = json.progress?.duration ?? video.duration ?? 0
          if (savedWatched > 0 && video.duration) {
            // set currentTime after metadata is ready
            video.currentTime = Math.min(savedWatched, Math.floor(video.duration))
            setWatchedDuration(Math.floor(video.currentTime))
            setTotalDuration(Math.floor(video.duration))
            latestSnapshotRef.current = { watched: Math.floor(video.currentTime), total: Math.floor(video.duration) }
            if (onProgressUpdate) {
              const percentage = savedDuration > 0 ? Math.round((Math.floor(video.currentTime) / Math.floor(savedDuration)) * 100) : 0
              onProgressUpdate(Math.floor(video.currentTime), Math.floor(savedDuration), percentage)
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Ensure metadata loaded then resume
    if (video.readyState >= 1) {
      resumeFromSavedProgress()
    } else {
      const onLoaded = () => resumeFromSavedProgress()
      video.addEventListener('loadedmetadata', onLoaded, { once: true })
    }

    // Handle dev tools detection
    if (isDevToolsOpen) {
      setShowDevToolsWarning(true)
      if (video) {
        video.pause()
      }
      
      // Gửi cảnh báo đến admin khi đạt lần thứ 3
      if (warningCount >= 3) {
        sendDevToolsAlert(warningCount, 'count')
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

    // Video event handlers for progress tracking
    const handlePlay = () => {
      startProgressTracking()
    }

    const handlePause = () => {
      stopProgressTracking()
      // Update progress when paused
      if (video.duration) {
        updateProgress(video.currentTime, video.duration)
      }
    }

    const handleLoadedMetadata = async () => {
      const videoDuration = Math.floor(video.duration)
      setTotalDuration(videoDuration)
      
      // Update lesson duration in database if it's 0 or different
      if (lessonId && userId && videoDuration > 0) {
        try {
          await fetch(`/api/lessons/${lessonId}/update-duration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration: videoDuration })
          })
        } catch (error) {
          console.error('Failed to update lesson duration:', error)
        }
      }
    }

    const handleEnded = () => {
      stopProgressTracking()
      // Final progress update when video ends
      if (video.duration) {
        updateProgress(video.duration, video.duration)
      }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    video.addEventListener('contextmenu', handleContextMenu)
    video.addEventListener('dragstart', handleDragStart)
    video.addEventListener('selectstart', handleSelectStart)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    // Flush progress on tab hide/close
    const handleBeforeUnload = () => {
      // Using navigator.sendBeacon would be ideal; fallback to sync XHR is not allowed here
      flushProgress()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      stopProgressTracking()
      document.removeEventListener('keydown', handleKeyDown)
      video.removeEventListener('contextmenu', handleContextMenu)
      video.removeEventListener('dragstart', handleDragStart)
      video.removeEventListener('selectstart', handleSelectStart)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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
              Phát hiện Developer Tools (Lần {warningCount})
            </h3>
            <p className="text-gray-600 mb-4">
              Vui lòng đóng Developer Tools (F12) để tiếp tục xem video. 
              Nếu người dùng cố tình bật Developer Tools nhiều lần, hệ thống sẽ tự động xóa tài khoản của người dùng mà không báo trước
              {(warningCount >= 3 || shouldSendTimeoutAlert) && (
                <span className="block mt-2 text-red-600 font-semibold">
                  🚨 Cảnh báo đã được gửi đến admin!
                  {shouldSendTimeoutAlert && (
                    <span className="block text-sm">
                      (DevTools mở quá 5 giây)
                    </span>
                  )}
                </span>
              )}
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