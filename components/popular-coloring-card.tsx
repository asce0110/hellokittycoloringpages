"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PopularityScore } from "@/lib/popularity-ranking"
import { Heart, Eye, TrendingUp } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { showToast } from "@/lib/toast"

interface PopularColoringCardProps {
  page: PopularityScore
  rank?: number
  showRank?: boolean
  showMetrics?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function PopularColoringCard({ 
  page, 
  rank, 
  showRank = false, 
  showMetrics = true,
  size = 'medium',
  className = "" 
}: PopularColoringCardProps) {
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites()
  const { isAuthenticated } = useAuth()
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [localFavorited, setLocalFavorited] = useState<boolean>(false)

  // 检查是否已收藏 - 使用本地状态确保实时更新
  const favorited = localFavorited

  // 🎯 监听全局收藏状态变化 - 实现跨页面同步
  useEffect(() => {
    const handleFavoritesUpdate = (event: CustomEvent) => {
      const { libraryImageId, isFavorited: newFavoriteState } = event.detail
      if (libraryImageId === page.id) {
        console.log(`🔄 Popular卡片接收到收藏状态更新: ${page.id} -> ${newFavoriteState}`, {
          pageTitle: page.title,
          previousState: localFavorited,
          newState: newFavoriteState
        })
        setLocalFavorited(newFavoriteState)
      }
    }

    // 添加全局事件监听器
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener)

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener)
    }
  }, [page.id, localFavorited])

  // 🎯 同步初始收藏状态和Provider状态变化
  useEffect(() => {
    const currentFavorited = isFavorite(page.id)
    if (currentFavorited !== localFavorited) {
      console.log(`🔄 Popular卡片同步收藏状态: ${page.id}`, {
        pageTitle: page.title,
        providerState: currentFavorited,
        localState: localFavorited,
        syncDirection: 'provider -> local'
      })
      setLocalFavorited(currentFavorited)
    }
  }, [isFavorite, page.id, localFavorited])

  // 处理收藏切换
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isTogglingFavorite) return

    const previousState = favorited
    setIsTogglingFavorite(true)
    
    console.log(`🎨 Popular卡片收藏切换开始: ${page.id}`, {
      pageTitle: page.title,
      currentState: previousState,
      targetState: !previousState
    })
    
    try {
      await toggleFavorite(page.id)
      
      console.log(`✅ Popular卡片收藏切换成功: ${page.id}`, {
        pageTitle: page.title,
        previousState,
        newState: !previousState
      })
      
      if (previousState) {
        showToast.success("Removed from favorites", "Successfully removed from your collection")
      } else {
        showToast.success("Added to favorites", "Successfully added to your collection")
      }
    } catch (error: any) {
      console.error(`❌ Popular卡片收藏切换失败: ${page.id}`, {
        pageTitle: page.title,
        error: error.message,
        previousState
      })
      
      if (error.message !== 'LOGIN_REQUIRED') {
        // 只有非登录错误才显示toast
        showToast.error("Operation failed", "Failed to update favorites, please try again")
      }
      // LOGIN_REQUIRED错误由FavoritesProvider处理，显示登录模态框
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  
  // 根据尺寸调整样式
  const sizeClasses = {
    small: "h-48",
    medium: "h-64", 
    large: "h-80"
  }
  
  // 根据分数设置热度标识颜色
  const getHeatColor = (score: number) => {
    if (score >= 80) return "bg-red-500 text-white" // 超热
    if (score >= 60) return "bg-orange-500 text-white" // 热门
    if (score >= 40) return "bg-yellow-500 text-gray-900" // 一般热度
    return "bg-gray-400 text-white" // 较冷
  }
  
  // 格式化数字显示
  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }
  
  return (
    <Card 
      className={`group overflow-hidden shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 bg-white dark:bg-card min-h-[400px] flex flex-col ${className}`}
    >
      <CardContent className="p-0 relative flex flex-col h-full">
        {/* 排名标识 */}
        {showRank && rank && (
          <div className="absolute top-2 left-2 z-10">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
              {rank}
            </div>
          </div>
        )}
        
        {/* 热度标识 */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className={`${getHeatColor(page.score)} shadow-lg`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {page.score}
          </Badge>
        </div>
        
        {/* 最近活跃标识 */}
        {page.recentActivity && (
          <div className="absolute top-10 right-2 z-10">
            <Badge variant="default" className="bg-green-500 text-white shadow-lg text-xs">
              Hot
            </Badge>
          </div>
        )}
        
        {/* 图片链接 */}
        <Link href={`/${page.slug}`} className="block">
          <div className={`relative ${sizeClasses[size]}`} style={{ overflow: 'hidden' }}>
            <Image
              src={page.thumbnailUrl || page.imageUrl}
              alt={`Popular coloring page: ${page.title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* 悬停覆盖层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 收藏按钮 - 居中显示，单一按钮设计 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center">
              <Button 
                size="lg" 
                variant="outline"
                className={`h-12 w-12 rounded-full border-2 shadow-lg backdrop-blur-sm transition-all duration-300 transform scale-90 group-hover:scale-100 ${
                  favorited 
                    ? 'bg-pink-500/90 text-white hover:bg-pink-600/90 border-pink-400/60 shadow-pink-500/25' 
                    : 'bg-white/90 text-gray-700 hover:bg-white hover:text-pink-500 border-white/60 shadow-white/25'
                }`}
                onClick={handleFavoriteToggle}
                disabled={isTogglingFavorite}
                title={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`w-5 h-5 transition-all duration-200 ${favorited ? 'fill-current' : ''} ${isTogglingFavorite ? 'animate-pulse' : ''}`} 
                />
              </Button>
            </div>
          </div>
        </Link>
        
        {/* 卡片内容 */}
        <div className="p-4 flex-1 flex flex-col">
          {/* 上半部分：标题和描述 */}
          <div className="space-y-2 flex-1">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight text-sm">
              {page.title.length > 25 ? `${page.title.substring(0, 25)}...` : page.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {page.description}
            </p>
          </div>
          
          {/* 下半部分：标签、难度和指标 */}
          <div className="space-y-3 mt-3">
            {/* 标签和难度 */}
            <div className="flex gap-2 flex-wrap items-center">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                page.difficulty === 'easy' ? 'border-green-200 text-green-700' :
                page.difficulty === 'medium' ? 'border-blue-200 text-blue-700' :
                'border-purple-200 text-purple-700'
              }`}
            >
              {page.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
              {page.category}
            </Badge>
            {page.tags.slice(0, 1).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs text-gray-500">
                {tag}
              </Badge>
            ))}
          </div>
          
            {/* 热门指标和快速操作 */}
            {showMetrics && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-muted/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatCount(page.favoriteCount)}</span>
                </div>
                {page.viewCount && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatCount(page.viewCount)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Score {page.score}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 快速收藏按钮 */}
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isTogglingFavorite}
                  className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                    favorited 
                      ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-50' 
                      : 'text-muted-foreground hover:text-pink-500 hover:bg-pink-50'
                  } ${isTogglingFavorite ? 'opacity-50' : ''}`}
                  title={favorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
                </button>
                <div className="text-xs font-medium text-primary">
                  #{rank || '?'}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}