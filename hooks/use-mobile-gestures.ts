"use client"

import { useEffect, useRef, useState } from "react"

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch'
  startPosition: { x: number, y: number }
  endPosition?: { x: number, y: number }
  duration: number
  distance?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  scale?: number
}

interface MobileGestureOptions {
  onTap?: (gesture: TouchGesture) => void
  onDoubleTap?: (gesture: TouchGesture) => void
  onLongPress?: (gesture: TouchGesture) => void
  onSwipe?: (gesture: TouchGesture) => void
  onPinch?: (gesture: TouchGesture) => void
  longPressDelay?: number
  doubleTapDelay?: number
  swipeThreshold?: number
  pinchThreshold?: number
}

export function useMobileGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: MobileGestureOptions = {}
) {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    onPinch,
    longPressDelay = 500,
    doubleTapDelay = 300,
    swipeThreshold = 50,
    pinchThreshold = 1.2
  } = options

  const lastTapRef = useRef<{ time: number, position: { x: number, y: number } } | null>(null)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ 
    touches: Touch[], 
    time: number, 
    initialDistance?: number 
  } | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touches = Array.from(e.touches)
      const startTime = Date.now()
      
      touchStartRef.current = {
        touches,
        time: startTime,
        initialDistance: touches.length === 2 
          ? getDistance(touches[0], touches[1]) 
          : undefined
      }

      // Handle long press
      if (touches.length === 1 && onLongPress) {
        longPressTimeoutRef.current = setTimeout(() => {
          if (touchStartRef.current) {
            const gesture: TouchGesture = {
              type: 'long-press',
              startPosition: { x: touches[0].clientX, y: touches[0].clientY },
              duration: Date.now() - startTime
            }
            onLongPress(gesture)
          }
        }, longPressDelay)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touches = Array.from(e.touches)
      
      // Cancel long press on movement
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
        longPressTimeoutRef.current = null
      }

      // Handle pinch gesture
      if (touches.length === 2 && touchStartRef.current && onPinch) {
        const currentDistance = getDistance(touches[0], touches[1])
        const initialDistance = touchStartRef.current.initialDistance
        
        if (initialDistance) {
          const scale = currentDistance / initialDistance
          
          if (Math.abs(scale - 1) > (pinchThreshold - 1)) {
            const gesture: TouchGesture = {
              type: 'pinch',
              startPosition: {
                x: (touchStartRef.current.touches[0].clientX + touchStartRef.current.touches[1].clientX) / 2,
                y: (touchStartRef.current.touches[0].clientY + touchStartRef.current.touches[1].clientY) / 2
              },
              duration: Date.now() - touchStartRef.current.time,
              scale
            }
            onPinch(gesture)
          }
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
        longPressTimeoutRef.current = null
      }

      if (!touchStartRef.current) return

      const endTime = Date.now()
      const duration = endTime - touchStartRef.current.time
      const startTouch = touchStartRef.current.touches[0]
      
      if (!startTouch) return

      const startPos = { x: startTouch.clientX, y: startTouch.clientY }
      
      // Get end position from changedTouches
      const changedTouches = Array.from(e.changedTouches)
      const endTouch = changedTouches[0]
      const endPos = endTouch ? { x: endTouch.clientX, y: endTouch.clientY } : startPos

      const distance = getDistance(
        { clientX: startPos.x, clientY: startPos.y } as Touch,
        { clientX: endPos.x, clientY: endPos.y } as Touch
      )

      // Handle swipe
      if (distance > swipeThreshold && onSwipe) {
        const deltaX = endPos.x - startPos.x
        const deltaY = endPos.y - startPos.y
        const direction = getSwipeDirection(deltaX, deltaY)
        
        const gesture: TouchGesture = {
          type: 'swipe',
          startPosition: startPos,
          endPosition: endPos,
          duration,
          distance,
          direction
        }
        onSwipe(gesture)
        return
      }

      // Handle tap and double tap
      if (distance < 10 && duration < 300) { // Small movement and quick
        const currentTap = { time: endTime, position: startPos }
        
        // Check for double tap
        if (lastTapRef.current && onDoubleTap) {
          const timeDiff = currentTap.time - lastTapRef.current.time
          const positionDiff = getDistance(
            { clientX: lastTapRef.current.position.x, clientY: lastTapRef.current.position.y } as Touch,
            { clientX: currentTap.position.x, clientY: currentTap.position.y } as Touch
          )
          
          if (timeDiff < doubleTapDelay && positionDiff < 30) {
            const gesture: TouchGesture = {
              type: 'double-tap',
              startPosition: startPos,
              duration: timeDiff
            }
            onDoubleTap(gesture)
            lastTapRef.current = null
            return
          }
        }
        
        // Handle single tap
        lastTapRef.current = currentTap
        setTimeout(() => {
          if (lastTapRef.current === currentTap && onTap) {
            const gesture: TouchGesture = {
              type: 'tap',
              startPosition: startPos,
              duration
            }
            onTap(gesture)
          }
          if (lastTapRef.current === currentTap) {
            lastTapRef.current = null
          }
        }, doubleTapDelay)
      }

      touchStartRef.current = null
    }

    // Add passive: false to prevent default touch behavior when needed
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
    }
  }, [
    elementRef,
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    onPinch,
    longPressDelay,
    doubleTapDelay,
    swipeThreshold,
    pinchThreshold
  ])

  return {
    isLongPressing: !!longPressTimeoutRef.current,
    clearLongPress: () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
        longPressTimeoutRef.current = null
      }
    }
  }
}

// Helper function to calculate distance between two touch points
function getDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Helper function to determine swipe direction
function getSwipeDirection(deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left'
  } else {
    return deltaY > 0 ? 'down' : 'up'
  }
}

// Hook for managing mobile-specific UI states
export function useMobileUIState() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [viewportHeight, setViewportHeight] = useState<number>(0)
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    const updateViewport = () => {
      // Use visual viewport if available for better mobile support
      const height = window.visualViewport?.height || window.innerHeight
      setViewportHeight(height)
    }

    const updateSafeArea = () => {
      const computed = getComputedStyle(document.documentElement)
      setSafeAreaInsets({
        top: parseInt(computed.getPropertyValue('env(safe-area-inset-top)')) || 0,
        bottom: parseInt(computed.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(computed.getPropertyValue('env(safe-area-inset-left)')) || 0,
        right: parseInt(computed.getPropertyValue('env(safe-area-inset-right)')) || 0
      })
    }

    // Initial setup
    updateOrientation()
    updateViewport()
    updateSafeArea()

    // Event listeners
    window.addEventListener('orientationchange', updateOrientation)
    window.addEventListener('resize', updateViewport)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport)
    }

    return () => {
      window.removeEventListener('orientationchange', updateOrientation)
      window.removeEventListener('resize', updateViewport)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport)
      }
    }
  }, [])

  return {
    orientation,
    viewportHeight,
    safeAreaInsets,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  }
}

// Hook for thumb-friendly positioning
export function useThumbReachZones() {
  const [zones, setZones] = useState({
    easy: { bottom: 0, right: 0, height: 0, width: 0 },
    medium: { bottom: 0, right: 0, height: 0, width: 0 },
    hard: { bottom: 0, right: 0, height: 0, width: 0 }
  })

  useEffect(() => {
    const updateZones = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Based on ergonomic research for thumb reach on mobile devices
      setZones({
        easy: {
          bottom: 0,
          right: 0,
          height: height * 0.4, // Bottom 40% of screen
          width: width * 0.3    // Right 30% of screen (for right thumb)
        },
        medium: {
          bottom: 0,
          right: 0,
          height: height * 0.6,
          width: width * 0.5
        },
        hard: {
          bottom: 0,
          right: 0,
          height: height * 0.8,
          width: width * 0.7
        }
      })
    }

    updateZones()
    window.addEventListener('resize', updateZones)
    window.addEventListener('orientationchange', updateZones)

    return () => {
      window.removeEventListener('resize', updateZones)
      window.removeEventListener('orientationchange', updateZones)
    }
  }, [])

  return zones
}