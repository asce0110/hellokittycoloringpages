"use client"

import { useState, useEffect } from "react"
import { PopularColoringCard } from "./popular-coloring-card"
import { PopularityScore, getPopularColoringPages } from "@/lib/popularity-ranking"
import { Button } from "@/components/ui/button"
import { TrendingUp, RefreshCw } from "lucide-react"

interface PopularColoringGridProps {
  count?: number
  showRank?: boolean
  showMetrics?: boolean
  showHeader?: boolean
  cardSize?: 'small' | 'medium' | 'large'
  gridCols?: 'auto' | '2' | '3' | '4' | '5'
  className?: string
}

export function PopularColoringGrid({
  count = 10,
  showRank = true,
  showMetrics = true,
  showHeader = true,
  cardSize = 'medium',
  gridCols = 'auto',
  className = ""
}: PopularColoringGridProps) {
  const [popularPages, setPopularPages] = useState<PopularityScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 网格列数样式映射 - 优化少数图片的显示
  const gridColsClass = {
    'auto': popularPages.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 justify-center' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    '2': 'grid-cols-1 sm:grid-cols-2 justify-center',
    '3': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    '5': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  }
  
  // 获取热门内容
  const fetchPopularPages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const pages = await getPopularColoringPages(count)
      setPopularPages(pages)
      
      console.log(`✅ PopularColoringGrid 成功加载 ${pages.length} 个热门着色页面`)
      
      // 🎯 调试：显示每张图片的详细信息
      pages.forEach((page, index) => {
        console.log(`📊 热门图片 ${index + 1}: "${page.title}"`, {
          id: page.id,
          score: page.score,
          downloadCount: page.downloadCount,
          favoriteCount: page.favoriteCount,
          viewCount: page.viewCount,
          metrics: page.metrics
        })
      })
    } catch (err) {
      console.error('获取热门内容失败:', err)
      setError('无法加载热门内容，请稍后重试')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchPopularPages()
  }, [count])
  
  // 🎯 监听收藏状态变化事件，重新获取热门数据确保收藏数同步
  useEffect(() => {
    const handleFavoritesUpdate = (event: CustomEvent) => {
      console.log('🔄 Popular Grid 检测到收藏状态变化，重新获取热门数据:', event.detail)
      // 延迟一点刷新，确保数据库更新完成
      setTimeout(() => {
        fetchPopularPages()
      }, 500)
    }

    // 添加全局事件监听器
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener)

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener)
    }
  }, [])
  
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showHeader && (
          <div className="text-center space-y-2">
            <div className="h-8 bg-muted rounded w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
          </div>
        )}
        
        <div className={`grid gap-6 ${gridColsClass[gridCols]}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-5 bg-muted rounded w-12" />
                  <div className="h-5 bg-muted rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="space-y-4">
          <div className="text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">无法加载热门内容</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button variant="outline" onClick={fetchPopularPages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新加载
          </Button>
        </div>
      </div>
    )
  }
  
  if (popularPages.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">暂无热门内容</p>
          <p className="text-sm">请稍后再试，或浏览我们的完整图库</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-blue-50 rounded-full">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Hot Picks</span>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl text-gray-800 dark:text-gray-200">
            Free Coloring Pages Printable - Top Picks
          </h2>
          
          <p className="max-w-2xl mx-auto text-muted-foreground md:text-lg">
            Discover the most loved coloring pages by our community. These designs are trending based on downloads, favorites, and recent activity.
          </p>
          
          {popularPages.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Showing top {popularPages.length} most popular pages</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={fetchPopularPages}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className={`grid gap-6 ${gridColsClass[gridCols]} ${popularPages.length <= 2 ? 'max-w-2xl mx-auto' : ''}`}>
        {popularPages.map((page, index) => (
          <PopularColoringCard
            key={page.id}
            page={page}
            rank={index + 1}
            showRank={showRank}
            showMetrics={showMetrics}
            size={cardSize}
          />
        ))}
      </div>
      
      {/* 查看更多链接 */}
      <div className="text-center pt-4">
        <Button asChild variant="outline">
          <a href="/library?sort=popular">
            View All Popular Pages →
          </a>
        </Button>
      </div>
    </div>
  )
}