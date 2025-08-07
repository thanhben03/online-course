import { useEffect, useState } from 'react'

export function useDevToolsDetector() {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)

  useEffect(() => {
    let devToolsInterval: NodeJS.Timeout

    const detectDevTools = () => {
      // Method 1: Check window size difference
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true)
        return true
      }

      // Method 2: Check console.log timing
      const start = performance.now()
      console.log('%c', 'color: transparent')
      const end = performance.now()
      
      if (end - start > 100) {
        setIsDevToolsOpen(true)
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
          setIsDevToolsOpen(true)
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
        setIsDevToolsOpen(true)
        return true
      }

      // Method 5: Check for Chrome DevTools
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        setIsDevToolsOpen(true)
        return true
      }

      setIsDevToolsOpen(false)
      return false
    }

    // Check periodically
    devToolsInterval = setInterval(detectDevTools, 1000)

    // Check on resize
    const handleResize = () => {
      detectDevTools()
    }

    // Check on keydown (F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        setIsDevToolsOpen(true)
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

  return isDevToolsOpen
} 