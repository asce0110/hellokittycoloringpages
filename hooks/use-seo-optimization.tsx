"use client"

import { useEffect, useRef } from "react"
import { ColoringPageData } from "@/lib/coloring-data"

interface SEOOptimizationHook {
  trackUserEngagement: (action: string, details?: any) => void
  reportPagePerformance: () => void
  updatePageViews: () => void
}

// 用户行为跟踪和SEO优化Hook
export function useSEOOptimization(coloringPage: ColoringPageData): SEOOptimizationHook {
  const startTime = useRef<number>(Date.now())
  const engagementEvents = useRef<any[]>([])

  // 跟踪用户参与度
  const trackUserEngagement = (action: string, details?: any) => {
    const event = {
      action,
      timestamp: Date.now(),
      timeFromStart: Date.now() - startTime.current,
      coloringPageId: coloringPage.id,
      coloringPageTitle: coloringPage.title,
      ...details
    }
    
    engagementEvents.current.push(event)
    
    // 发送到分析服务（如果需要）
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: 'coloring_engagement',
        event_label: coloringPage.title,
        value: Math.floor((Date.now() - startTime.current) / 1000),
        custom_map: {
          coloring_page_id: coloringPage.id,
          difficulty: coloringPage.difficulty,
          category: coloringPage.category
        }
      })
    }
  }

  // 报告页面性能指标
  const reportPagePerformance = () => {
    if (typeof window === 'undefined') return

    // 收集Core Web Vitals
    try {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        trackUserEngagement('lcp_measured', {
          value: lastEntry.startTime,
          metric: 'lcp'
        })
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          trackUserEngagement('fid_measured', {
            value: entry.processingStart - entry.startTime,
            metric: 'fid'
          })
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((list) => {
        let clsScore = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value
          }
        })
        trackUserEngagement('cls_measured', {
          value: clsScore,
          metric: 'cls'
        })
      }).observe({ entryTypes: ['layout-shift'] })

    } catch (error) {
      console.log('Performance measurement not supported')
    }
  }

  // 更新页面浏览量
  const updatePageViews = () => {
    // 这里可以调用API更新数据库中的浏览量
    try {
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: coloringPage.id,
          pageType: 'coloring_page',
          category: coloringPage.category,
          difficulty: coloringPage.difficulty,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      }).catch(() => {
        // 静默失败，不影响用户体验
      })
    } catch (error) {
      // 静默处理错误
    }
  }

  // 组件挂载时的初始化
  useEffect(() => {
    trackUserEngagement('page_load', {
      pageType: 'coloring_page',
      loadTime: Date.now() - startTime.current
    })

    updatePageViews()
    reportPagePerformance()

    // 页面可见性变化追踪
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackUserEngagement('page_hidden', {
          timeSpent: Date.now() - startTime.current,
          engagementEvents: engagementEvents.current.length
        })
      } else {
        trackUserEngagement('page_visible', {
          returnTime: Date.now() - startTime.current
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 页面卸载时的清理
    const handleBeforeUnload = () => {
      trackUserEngagement('page_unload', {
        totalTimeSpent: Date.now() - startTime.current,
        totalEngagementEvents: engagementEvents.current.length,
        engagementScore: calculateEngagementScore()
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // 计算参与度分数
  const calculateEngagementScore = () => {
    const timeSpent = Date.now() - startTime.current
    const eventCount = engagementEvents.current.length
    const averageTimePerEvent = eventCount > 0 ? timeSpent / eventCount : 0
    
    // 简单的参与度评分算法
    let score = 0
    if (timeSpent > 30000) score += 25 // 超过30秒
    if (timeSpent > 120000) score += 25 // 超过2分钟
    if (eventCount > 5) score += 25 // 超过5次交互
    if (averageTimePerEvent > 10000) score += 25 // 平均每次交互超过10秒
    
    return Math.min(score, 100)
  }

  return {
    trackUserEngagement,
    reportPagePerformance,
    updatePageViews
  }
}

// 声明全局gtag类型
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}