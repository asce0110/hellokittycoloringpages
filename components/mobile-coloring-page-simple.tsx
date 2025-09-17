"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { ColoringPageData } from '@/lib/coloring-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Share2, 
  Heart,
  Save,
  FolderOpen,
  ArrowLeft,
  Printer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useFavorites } from '@/hooks/use-favorites'
import { useSEOOptimization } from '@/hooks/use-seo-optimization'
import { showToast } from '@/lib/toast'

interface MobileColoringPageSimpleProps {
  coloringPage: ColoringPageData
}

export function MobileColoringPageSimple({ coloringPage }: MobileColoringPageSimpleProps) {
  const { user, isAuthenticated } = useAuth()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const { trackUserEngagement } = useSEOOptimization(coloringPage)
  
  // 基础状态
  const [imageLoaded, setImageLoaded] = useState(false)
  const [savedWork, setSavedWork] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  // 获取URL参数以检查是否有保存的作品
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  
  // 从localStorage加载保存的作品
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(`coloring-page-${coloringPage.slug}`)
      if (storedData) {
        try {
          const data = JSON.parse(storedData)
          if (data.imageData) {
            setSavedWork(data.imageData)
          }
        } catch (error) {
          console.warn('Failed to load saved work:', error)
        }
      }
    }
  }, [coloringPage.slug])

  // SEO标题处理
  const actualTitle = coloringPage.title
  const displayImageUrl = savedWork || coloringPage.imageUrl

  // 分享功能
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${actualTitle} - Coloring Page`,
          text: `Check out this ${actualTitle.toLowerCase()} coloring page!`,
          url: window.location.href,
        })
        trackUserEngagement('share', 'native')
      } else {
        // 降级到复制链接
        await navigator.clipboard.writeText(window.location.href)
        showToast.success('链接已复制到剪贴板')
        trackUserEngagement('share', 'clipboard')
      }
    } catch (error) {
      console.error('分享失败:', error)
      showToast.error('分享失败，请稍后再试')
    }
  }, [actualTitle, trackUserEngagement])

  // 下载功能
  const handleDownload = useCallback(() => {
    if (!imageRef.current) return
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    // 创建下载链接
    canvas.toBlob((blob) => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${coloringPage.slug}-coloring-page.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      trackUserEngagement('download', 'mobile')
      showToast.success('图片已下载')
    }, 'image/png')
  }, [coloringPage.slug, trackUserEngagement])

  // 打印功能
  const handlePrint = useCallback(() => {
    if (!imageRef.current) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print: ${actualTitle}</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
            .title { font-family: Arial, sans-serif; margin-bottom: 20px; }
            @media print {
              body { padding: 0; }
              .title { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="title">
            <h2>${actualTitle}</h2>
            <p>Coloring Page - Print and Color</p>
          </div>
          <img src="${displayImageUrl}" alt="${actualTitle}" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
    
    trackUserEngagement('print', 'mobile')
  }, [actualTitle, displayImageUrl, trackUserEngagement])

  // 收藏功能
  const handleFavoriteToggle = useCallback(async () => {
    if (!isAuthenticated) {
      showToast.warning('请先登录后收藏')
      return
    }

    try {
      const isCurrentlyFavorite = isFavorite(coloringPage.id, 'library')
      if (isCurrentlyFavorite) {
        await removeFromFavorites(coloringPage.id, 'library')
        showToast.success('已从收藏中移除')
      } else {
        await addToFavorites(coloringPage.id, 'library')
        showToast.success('已添加到收藏')
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      showToast.error('操作失败，请稍后再试')
    }
  }, [isAuthenticated, isFavorite, addToFavorites, removeFromFavorites, coloringPage.id])

  // 返回功能
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/library'
    }
  }, [])

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      {/* 简化的顶部导航 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 mx-4">
          <h1 className="text-lg font-semibold text-gray-900 truncate text-center">
            {actualTitle}
          </h1>
          {savedWork && (
            <p className="text-xs text-blue-600 text-center mt-1">
              已着色作品
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavoriteToggle}
          className="p-2"
        >
          <Heart 
            className={cn(
              "h-5 w-5",
              isAuthenticated && isFavorite(coloringPage.id, 'library')
                ? "fill-red-500 text-red-500" 
                : "text-gray-400"
            )} 
          />
        </Button>
      </div>

      {/* 图片显示区域 */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full h-full max-w-2xl relative">
          <img
            ref={imageRef}
            src={displayImageUrl}
            alt={actualTitle}
            className="w-full h-full object-contain rounded-xl shadow-lg bg-white"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
              <div className="text-gray-500">加载中...</div>
            </div>
          )}
        </div>
      </div>

      {/* 简化的底部操作栏 */}
      <div className="bg-white border-t p-4 flex-shrink-0">
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 max-w-[100px]"
          >
            <Share2 className="h-4 w-4 mr-2" />
            分享
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 max-w-[100px]"
          >
            <Download className="h-4 w-4 mr-2" />
            下载
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 max-w-[100px]"
          >
            <Printer className="h-4 w-4 mr-2" />
            打印
          </Button>
        </div>
        
        {/* 提示信息 */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            {savedWork 
              ? "这是您在桌面端保存的着色作品" 
              : "在桌面端着色后可在此查看作品"
            }
          </p>
        </div>
      </div>
    </div>
  )
}