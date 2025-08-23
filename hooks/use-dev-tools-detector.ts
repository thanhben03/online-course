import { useState, useEffect, useRef } from 'react'

export function useDevToolsDetector() {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const warningCountRef = useRef<number>(0)
  const previousStateRef = useRef<boolean>(false) // Trạng thái trước đó
  const devToolsOpenTime = useRef<number>(0) // Thời gian bắt đầu mở DevTools
  const [shouldSendTimeoutAlert, setShouldSendTimeoutAlert] = useState(false)

  useEffect(() => {
    let devToolsInterval: NodeJS.Timeout

    // Helper function để đếm khi có sự chuyển đổi từ đóng sang mở
    const handleDevToolsOpened = () => {
      if (!previousStateRef.current) { // Chỉ đếm khi chuyển từ đóng sang mở
        warningCountRef.current += 1
        setWarningCount(warningCountRef.current)
        devToolsOpenTime.current = Date.now() // Ghi lại thời gian mở
        console.log(`🚨 DevTools opened - Count: ${warningCountRef.current}`)
      }
      previousStateRef.current = true
      setIsDevToolsOpen(true)
    }

    const handleDevToolsClosed = () => {
      previousStateRef.current = false
      devToolsOpenTime.current = 0 // Reset thời gian
      setShouldSendTimeoutAlert(false) // Reset timeout alert
      setIsDevToolsOpen(false)
    }

    // Kiểm tra xem DevTools đã mở quá 5 giây chưa
    const checkTimeoutAlert = () => {
      if (previousStateRef.current && devToolsOpenTime.current > 0) {
        const openDuration = Date.now() - devToolsOpenTime.current
        if (openDuration >= 5000 && !shouldSendTimeoutAlert) { // 5 giây
          setShouldSendTimeoutAlert(true)
          console.log(`🚨 DevTools open for more than 5 seconds - sending timeout alert`)
        }
      }
    }

    const detectDevTools = () => {
      // Method 1: Check window size difference
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        handleDevToolsOpened()
        return true
      }

      // Method 2: Check console.log timing
      const start = performance.now()
      console.log('%c', 'color: transparent')
      const end = performance.now()
      
      if (end - start > 100) {
        handleDevToolsOpened()
        return true
      }

      // Method 3: Check if debugger is available
      try {
        const devtools = {
          open: false,
          orientation: null as string | null
        }
        
        const threshold = 160
        const widthThreshold = window.outerWidth - window.innerWidth > threshold
        const heightThreshold = window.outerHeight - window.innerHeight > threshold
        
        if (widthThreshold || heightThreshold) {
          devtools.open = true
          devtools.orientation = widthThreshold ? 'vertical' : 'horizontal'
        }
        
        if (devtools.open) {
          handleDevToolsOpened()
          return true
        }
      } catch (e) {
        // Ignore errors
      }

      // Method 4: Check for specific dev tools properties
      if (
        (window as any).Firebug && 
        (window as any).Firebug.chrome && 
        (window as any).Firebug.chrome.isInitialized
      ) {
        handleDevToolsOpened()
        return true
      }

      // Method 5: Check for Chrome DevTools
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        handleDevToolsOpened()
        return true
      }

      // Không phát hiện DevTools -> đóng
      handleDevToolsClosed()
      return false
    }

    // Check periodically
    devToolsInterval = setInterval(() => {
      detectDevTools()
      checkTimeoutAlert() // Kiểm tra timeout cảnh báo
    }, 1000)

    // Check on resize
    const handleResize = () => {
      detectDevTools()
    }

    // Check on keydown (F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        handleDevToolsOpened()
        return false
      }
    }

    // Check on context menu
    const handleContextMenu = (e: MouseEvent) => {
      // If right-click is detected, check if dev tools might be open
      setTimeout(() => {
        detectDevTools()
      }, 100)
    }

    // Add event listeners
    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)

    // Initial check
    detectDevTools()

    // Cleanup
    return () => {
      clearInterval(devToolsInterval)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  return { isDevToolsOpen, warningCount, shouldSendTimeoutAlert }
} 