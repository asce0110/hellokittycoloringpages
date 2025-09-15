"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LibraryImage } from "@/lib/types"
import { generateSmartSeoUrl } from "@/lib/seo-url-generator"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/hooks/use-auth"
import { showToast } from "@/lib/toast"
import { extractFavoriteId, areIdsMatching } from "@/lib/id-utils"
import { Heart, Download, Palette, LogIn } from "lucide-react"

interface LibraryImageCardProps {
  image: LibraryImage
  showDifficulty?: boolean
  showCategory?: boolean
  className?: string
}

export function LibraryImageCard({ 
  image, 
  showDifficulty = true, 
  showCategory = true,
  className = "" 
}: LibraryImageCardProps) {
  const router = useRouter()
  const { isFavorite, toggleFavorite, refreshFavorites, favorites } = useFavorites()
  const { isAuthenticated } = useAuth()
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = React.useState(false)
  const [localFavorited, setLocalFavorited] = React.useState<boolean>(false)
  const [forceUpdate, setForceUpdate] = React.useState(0)

  // 检查是否已收藏 - 使用本地状态确保实时更新
  const favorited = localFavorited

  // 🎯 使用统一的ID提取逻辑
  const favoriteIdResult = React.useMemo(() => {
    return extractFavoriteId(image)
  }, [image])

  // 🎯 监听全局收藏状态变化 - 使用新的ID匹配逻辑和强制刷新
  React.useEffect(() => {
    const handleFavoritesUpdate = (event: CustomEvent) => {
      const { libraryImageId, isFavorited: newFavoriteState, timestamp } = event.detail
      
      // 使用新的ID匹配逻辑
      if (areIdsMatching(libraryImageId, favoriteIdResult.normalizedId) ||
          areIdsMatching(libraryImageId, image.id)) {
        console.log(`🔄 Library card received favorite status update:`, {
          eventId: libraryImageId,
          cardNormalizedId: favoriteIdResult.normalizedId,
          cardOriginalId: image.id,
          imageTitle: image.title,
          previousState: localFavorited,
          newState: newFavoriteState,
          timestamp
        })
        setLocalFavorited(newFavoriteState)
        // 强制重新渲染
        setForceUpdate(prev => prev + 1)
      }
    }

    const handleForceRefresh = () => {
      console.log(`🔄 Library card force refresh:`, {
        cardNormalizedId: favoriteIdResult.normalizedId,
        cardOriginalId: image.id,
        imageTitle: image.title
      })
      // 重新检查收藏状态
      const currentFavorited = isFavorite(favoriteIdResult.normalizedId) || 
                             isFavorite(image.id)
      setLocalFavorited(currentFavorited)
      setForceUpdate(prev => prev + 1)
    }

    const handleFavoritesCleared = () => {
      console.log(`🧹 Library card favorites cleared:`, {
        cardNormalizedId: favoriteIdResult.normalizedId,
        cardOriginalId: image.id,
        imageTitle: image.title
      })
      setLocalFavorited(false)
      setForceUpdate(prev => prev + 1)
    }

    const handleFavoritesRefreshed = (event: CustomEvent) => {
      console.log(`🔄 Library card favorites refreshed:`, {
        cardNormalizedId: favoriteIdResult.normalizedId,
        cardOriginalId: image.id,
        imageTitle: image.title,
        newCount: event.detail.count
      })
      // 重新检查收藏状态
      const currentFavorited = isFavorite(favoriteIdResult.normalizedId) || 
                             isFavorite(image.id)
      setLocalFavorited(currentFavorited)
      setForceUpdate(prev => prev + 1)
    }

    // 添加全局事件监听器
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener)
    window.addEventListener('favoritesForceRefresh', handleForceRefresh as EventListener)
    window.addEventListener('favoritesCleared', handleFavoritesCleared as EventListener)
    window.addEventListener('favoritesRefreshed', handleFavoritesRefreshed as EventListener)

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate as EventListener)
      window.removeEventListener('favoritesForceRefresh', handleForceRefresh as EventListener)
      window.removeEventListener('favoritesCleared', handleFavoritesCleared as EventListener)
      window.removeEventListener('favoritesRefreshed', handleFavoritesRefreshed as EventListener)
    }
  }, [favoriteIdResult.normalizedId, image.id, isFavorite])

  // 🎯 同步初始收藏状态和Provider状态变化 - 使用统一的ID逻辑
  React.useEffect(() => {
    // 使用标准化的ID检查收藏状态
    const currentFavorited = isFavorite(favoriteIdResult.normalizedId) || 
                           isFavorite(image.id)
    
    if (currentFavorited !== localFavorited) {
      console.log(`🔄 Library card syncing favorite status:`, {
        originalId: image.id,
        normalizedId: favoriteIdResult.normalizedId,
        format: favoriteIdResult.format,
        imageTitle: image.title,
        providerState: currentFavorited,
        localState: localFavorited,
        syncDirection: 'provider -> local',
        favoritesLength: favorites.length
      })
      setLocalFavorited(currentFavorited)
      // 强制重新渲染以确保UI更新
      setForceUpdate(prev => prev + 1)
    }
  }, [isFavorite, favoriteIdResult.normalizedId, image.id, favorites, localFavorited, forceUpdate])
  
  // 🎯 强制同步初始状态（确保组件挂载时状态正确）
  React.useEffect(() => {
    const initialFavorited = isFavorite(favoriteIdResult.normalizedId) || 
                           isFavorite(image.id)
    setLocalFavorited(initialFavorited)
    
    console.log(`🎯 Library card initial favorite status:`, {
      originalId: image.id,
      normalizedId: favoriteIdResult.normalizedId,
      format: favoriteIdResult.format,
      imageTitle: image.title,
      initialFavorited,
      favoritesCount: favorites.length,
      matchingFavorites: favorites.filter(fav => 
        (fav.libraryImageId && (fav.libraryImageId === favoriteIdResult.normalizedId || fav.libraryImageId === image.id)) ||
        (favoriteIdResult.normalizedId && fav.libraryImageId && areIdsMatching(favoriteIdResult.normalizedId, fav.libraryImageId))
      )
    })
  }, [])
  
  // 🔄 备用刷新机制：当其他方式都失败时，强制同步状态
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，强制同步状态
        const currentFavorited = isFavorite(favoriteIdResult.normalizedId) || 
                               isFavorite(image.id)
        if (currentFavorited !== localFavorited) {
          setLocalFavorited(currentFavorited)
          console.log(`🔄 备用同步机制触发:`, {
            imageTitle: image.title,
            newState: currentFavorited
          })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isFavorite, favoriteIdResult.normalizedId, image.id, localFavorited])
  
  // 🔄 第二个备用同步机制：定时检查（增强版）
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentFavorited = isFavorite(favoriteIdResult.normalizedId) || 
                             isFavorite(image.id)
      if (currentFavorited !== localFavorited) {
        setLocalFavorited(currentFavorited)
        setForceUpdate(prev => prev + 1) // 强制重新渲染
        console.log(`🕰️ 定时同步机制触发:`, {
          imageTitle: image.title,
          previousState: localFavorited,
          newState: currentFavorited,
          forceUpdate: forceUpdate + 1
        })
      }
    }, 1000) // 减少到每1秒检查一次

    return () => clearInterval(interval)
  }, [isFavorite, favoriteIdResult.normalizedId, image.id, localFavorited, forceUpdate])
  
  // 处理点击着色按钮 - 使用与库页面相同的逻辑
  const handleColorOnline = React.useCallback(async () => {
    setIsNavigating(true)
    
    console.log('🎨 点击着色按钮:', {
      imageId: image.id,
      imageTitle: image.title,
      imageCategory: image.category,
      imageSrc: image.imageUrl
    })
    
    try {
      // 生成SEO友好的slug
      const seoSlug = await generateSmartSeoUrl(image.title, image.imageUrl, image.description || '')
      
      // 存储映射到服务器
      const response = await fetch('/api/seo-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: seoSlug,
          imageUrl: image.imageUrl,
          title: image.title,
          description: image.description || '',
          libraryImageId: image.id // 🎯 添加真实的图片ID用于浏览量追踪
        })
      })

      if (response.ok) {
        const cleanSeoUrl = `/${seoSlug}`
        
        console.log('🎯 生成的SEO URL:', {
          cleanUrl: cleanSeoUrl,
          seoSlug: seoSlug,
          imageUrl: image.imageUrl.substring(0, 50) + '...',
          title: image.title,
          storedOnServer: true
        })
        
        router.push(cleanSeoUrl)
      } else {
        // 如果API存储失败，直接使用简洁的slug
        // 页面路由会通过URL参数处理这种情况
        console.warn('⚠️ SEO存储失败，使用简洁slug')
        router.push(`/${seoSlug}`)
      }
    } catch (error) {
      console.error('❌ SEO存储请求失败:', error)
      // 网络错误时使用基本的slug（移除hello-kitty前缀）
      const basicSlug = image.title.toLowerCase()
        .replace(/^hello\s+kitty\s+/i, '') // 移除不需要的前缀
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-') + '-coloring-pages'
      router.push(`/${basicSlug}`)
    } finally {
      setIsNavigating(false)
    }
  }, [image, router])


  // 处理收藏切换 - 使用统一的ID处理逻辑
  const handleFavoriteToggle = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isTogglingFavorite) return
    if (!favoriteIdResult.normalizedId) {
      console.error('❌ 无法提取有效的收藏ID:', favoriteIdResult)
      showToast.error("收藏失败", "无法识别图片ID")
      return
    }

    const previousState = favorited
    setIsTogglingFavorite(true)
    
    console.log(`📚 Library card favorite toggle started:`, {
      originalId: image.id,
      normalizedId: favoriteIdResult.normalizedId,
      format: favoriteIdResult.format,
      imageTitle: image.title,
      currentState: previousState,
      targetState: !previousState
    })
    
    try {
      // 使用标准化的ID调用收藏API
      await toggleFavorite(favoriteIdResult.normalizedId)
      
      console.log(`✅ Library card favorite toggle successful:`, {
        originalId: image.id,
        normalizedId: favoriteIdResult.normalizedId,
        imageTitle: image.title,
        previousState,
        newState: !previousState
      })
      
      // 🎯 根据ID类型显示更准确的消息
      if (previousState) {
        showToast.success("Removed from favorites", "Successfully removed from your collection")
      } else {
        const message = favoriteIdResult.format === 'uuid' 
          ? "Successfully added to your collection" 
          : "Added to local favorites (offline mode)"
        showToast.success("Added to favorites", message)
      }
    } catch (error: any) {
      console.error(`❌ Library card favorite toggle failed:`, {
        originalId: image.id,
        normalizedId: favoriteIdResult.normalizedId,
        format: favoriteIdResult.format,
        imageTitle: image.title,
        previousState,
        error: error.message
      })
      
      if (error.message === 'LOGIN_REQUIRED') {
        showToast.loginRequired.favorite(() => {
          router.push('/login')
        })
      } else {
        const errorTitle = previousState ? "Remove Failed" : "Add Failed"
        const errorMessage = error.message || "Failed to update favorites, please try again"
        showToast.error(errorTitle, errorMessage)
      }
    } finally {
      setIsTogglingFavorite(false)
    }
  }, [favorited, toggleFavorite, favoriteIdResult, isTogglingFavorite, image.title, router])

  // 处理下载
  const handleDownload = React.useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isDownloading) return

    setIsDownloading(true)
    try {
      // 🎯 使用标准化的ID
      const downloadId = favoriteIdResult.normalizedId || image.id
      
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          libraryImageId: downloadId,
          type: 'standard'
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = data.filename || `${image.title}.png`
        link.target = '_blank'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToast.success("Download started", "Image is downloading...")
      } else {
        throw new Error(data.error || 'Download failed')
      }
    } catch (error) {
      console.error('Download failed:', error)
      showToast.error("Download failed", "Unable to download image, please try again later")
    } finally {
      setIsDownloading(false)
    }
  }, [favoriteIdResult, image.id, image.title, isDownloading])
  
  // 难度颜色映射
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'complex':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  // 分类颜色映射
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'characters':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'nature':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'adventure':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'classic':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className={`group overflow-hidden cursor-pointer shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 ${className}`} onClick={handleColorOnline}>
        <CardContent className="p-0">
          {/* 图片容器 */}
          <div className="relative w-full aspect-square overflow-hidden">
            <Image
              src={image.thumbnailUrl || image.imageUrl}
              alt={`${image.title} - coloring page`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* 特色标签 */}
            {image.isFeatured && !isNavigating && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  ✨ Featured
                </Badge>
              </div>
            )}
            
            {/* 加载状态覆盖 */}
            {isNavigating && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Loading...</p>
                </div>
              </div>
            )}
            
            {/* 下载计数 */}
            {image.downloadCount > 0 && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                  {image.downloadCount}↓
                </Badge>
              </div>
            )}

            {/* 悬停时的操作按钮 - 纯图标模式 */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex gap-2 justify-center">
                {/* 下载按钮 - 纯图标 */}
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-9 w-9 p-0 bg-white/95 text-gray-800 hover:bg-white hover:text-blue-500 border-white/60 shadow-sm transition-all duration-200"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  title={isDownloading ? "Downloading..." : "Download image"}
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                </Button>
                
                {/* 收藏按钮 - 纯图标 */}
                <Button 
                  size="sm" 
                  variant="outline"
                  className={`h-9 w-9 p-0 border-white/60 shadow-sm transition-all duration-200 ${
                    favorited 
                      ? 'bg-pink-500 text-white hover:bg-pink-600 border-pink-500 transform scale-105' 
                      : 'bg-white/95 text-gray-800 hover:bg-white hover:text-pink-500 hover:scale-105'
                  }`}
                  key={`favorite-button-${forceUpdate}`} // 强制重新渲染
                  onClick={handleFavoriteToggle}
                  disabled={isTogglingFavorite}
                  title={(() => {
                    const baseTitle = favorited ? "Remove from favorites" : "Add to favorites"
                    return favoriteIdResult.normalizedId ? baseTitle : `${baseTitle} (ID format issue)`
                  })()}
                >
                  <Heart 
                    className={`w-4 h-4 transition-all duration-200 ${
                      favorited ? 'fill-current scale-110' : ''
                    } ${isTogglingFavorite ? 'animate-pulse' : ''}`} 
                  />
                </Button>
                
                {/* 着色按钮 - 纯图标 */}
                <Button 
                  size="sm" 
                  className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200 hover:scale-105"
                  onClick={handleColorOnline}
                  disabled={isNavigating}
                  title={isNavigating ? "Loading..." : "Start coloring"}
                >
                  <Palette className={`w-4 h-4 ${isNavigating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="p-4">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
              {image.title}
            </h3>
            
            {image.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {image.description}
              </p>
            )}
            
            {/* 标签区域和快速操作 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2 flex-wrap">
                {showDifficulty && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDifficultyColor(image.difficulty)}`}
                  >
                    {image.difficulty.charAt(0).toUpperCase() + image.difficulty.slice(1)}
                  </Badge>
                )}
                
                {showCategory && image.category && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getCategoryColor(image.category)}`}
                  >
                    {image.category}
                  </Badge>
                )}
                
                {/* 显示部分标签 */}
                {image.tags && image.tags.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    {image.tags[0]}
                  </Badge>
                )}
              </div>
              
              {/* 快速收藏按钮 */}
              <button
                onClick={handleFavoriteToggle}
                disabled={isTogglingFavorite}
                className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 shrink-0 ${
                  favorited 
                    ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-50' 
                    : 'text-muted-foreground hover:text-pink-500 hover:bg-pink-50'
                } ${isTogglingFavorite ? 'opacity-50' : ''}`}
                key={`quick-favorite-button-${forceUpdate}`} // 强制重新渲染
                title={(() => {
                  const baseTitle = favorited ? "Remove from favorites" : "Add to favorites"
                  return favoriteIdResult.normalizedId ? baseTitle : `${baseTitle} (ID format issue)`
                })()}
              >
                <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}