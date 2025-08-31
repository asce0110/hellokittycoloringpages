/**
 * Hook for tracking image views
 * Automatically increments view count when user visits an image page
 */

"use client"

import { useEffect, useRef } from 'react'

interface ViewTrackingOptions {
  /** Delay before tracking view (in milliseconds) */
  delay?: number
  /** Whether to track multiple views from same session */
  trackMultiple?: boolean
}

/**
 * Hook to track image views
 * @param imageId - ID of the image to track
 * @param options - Tracking configuration options
 */
export function useViewTracking(
  imageId: string | null, 
  options: ViewTrackingOptions = {}
) {
  const { 
    delay = 2000,        // 2 seconds delay to ensure genuine view
    trackMultiple = false // Don't track multiple views by default
  } = options
  
  const hasTrackedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Don't track if no imageId or already tracked (and trackMultiple is false)
    if (!imageId || (!trackMultiple && hasTrackedRef.current)) {
      return
    }
    
    console.log(`🔍 开始浏览量追踪: 图片ID ${imageId}, 延迟 ${delay}ms`)
    
    // Set up delayed tracking
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log(`📈 发送浏览量统计: 图片ID ${imageId}`)
        
        const response = await fetch(`/api/library-images/${imageId}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ 浏览量统计成功:', {
            imageId,
            imageTitle: data.imageTitle,
            newViewCount: data.newViewCount,
            method: data.fallback ? 'fallback' : 'database'
          })
          
          hasTrackedRef.current = true
          
          // 可选：发布全局事件通知其他组件
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('imageViewed', {
              detail: {
                imageId,
                imageTitle: data.imageTitle,
                newViewCount: data.newViewCount,
                timestamp: new Date()
              }
            })
            window.dispatchEvent(event)
          }
          
        } else {
          console.warn('⚠️ 浏览量统计失败:', data.error)
        }
        
      } catch (error) {
        console.error('❌ 浏览量追踪网络错误:', error)
        
        // Fallback: 使用localStorage记录浏览
        try {
          const viewsKey = 'image_views_cache'
          const storedViews = localStorage.getItem(viewsKey)
          const views = storedViews ? JSON.parse(storedViews) : {}
          
          views[imageId] = {
            count: (views[imageId]?.count || 0) + 1,
            lastViewed: new Date().toISOString()
          }
          
          localStorage.setItem(viewsKey, JSON.stringify(views))
          console.log('📱 浏览量已保存到本地缓存')
          
        } catch (localError) {
          console.error('❌ 本地浏览量缓存失败:', localError)
        }
      }
    }, delay)
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        console.log('🧹 清理浏览量追踪定时器')
      }
    }
  }, [imageId, delay, trackMultiple])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return {
    hasTracked: hasTrackedRef.current
  }
}

/**
 * Hook to get cached view counts from localStorage
 */
export function useCachedViewCounts() {
  const getCachedViews = (): Record<string, { count: number; lastViewed: string }> => {
    if (typeof window === 'undefined') return {}
    
    try {
      const viewsKey = 'image_views_cache'
      const storedViews = localStorage.getItem(viewsKey)
      return storedViews ? JSON.parse(storedViews) : {}
    } catch (error) {
      console.error('❌ 读取本地浏览量缓存失败:', error)
      return {}
    }
  }
  
  const getViewCount = (imageId: string): number => {
    const views = getCachedViews()
    return views[imageId]?.count || 0
  }
  
  return {
    getCachedViews,
    getViewCount
  }
}