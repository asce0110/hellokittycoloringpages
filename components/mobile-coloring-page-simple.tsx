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
  Printer,
  Upload
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
  const [hasLocalSave, setHasLocalSave] = useState(false)
  const [hasCloudSave, setHasCloudSave] = useState(false)
  const [isCheckingCloud, setIsCheckingCloud] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  
  // 获取URL参数以检查是否有保存的作品
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  
  // 检查是否有保存的作品 - 兼容桌面端存储格式和云端同步
  useEffect(() => {
    const checkSavedProgress = async () => {
      if (typeof window !== 'undefined') {
        // 1. 检查本地存储
        const desktopKey = `coloring-progress-${coloringPage.imageUrl}`
        const mobileKey = `coloring-page-${coloringPage.slug}`
        
        let storedData = localStorage.getItem(desktopKey) || localStorage.getItem(mobileKey)
        
        if (storedData) {
          try {
            const data = JSON.parse(storedData)
            if (data.dataURL || data.data || data.imageData) {
              setHasLocalSave(true)
              console.log('Found local saved work:', data)
            }
          } catch (error) {
            console.warn('Failed to check local saved work:', error)
          }
        }
        
        // 2. 如果用户已登录，检查云端存储
        if (isAuthenticated && user?.id) {
          setIsCheckingCloud(true)
          try {
            const response = await fetch(`/api/coloring-progress?userId=${user.id}&imageUrl=${encodeURIComponent(coloringPage.imageUrl)}`)
            if (response.ok) {
              const result = await response.json()
              if (result.success && result.data) {
                setHasCloudSave(true)
                console.log('Found cloud saved work:', result.data)
              }
            }
          } catch (error) {
            console.warn('Failed to check cloud saved work:', error)
          } finally {
            setIsCheckingCloud(false)
          }
        }
      }
    }
    
    checkSavedProgress()
  }, [coloringPage.slug, coloringPage.imageUrl, isAuthenticated, user?.id])

  // 加载保存的作品 - 云端优先，本地降级
  const handleLoadSavedWork = useCallback(async () => {
    if (typeof window !== 'undefined') {
      let loadSuccess = false
      
      // 1. 如果用户已登录且有云端保存，优先从云端加载
      if (isAuthenticated && user?.id && hasCloudSave) {
        try {
          const response = await fetch(`/api/coloring-progress?userId=${user.id}&imageUrl=${encodeURIComponent(coloringPage.imageUrl)}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data && result.data.progressData) {
              setSavedWork(result.data.progressData)
              showToast.success('Loaded saved work from cloud!')
              trackUserEngagement('load_saved_work', 'mobile_cloud')
              loadSuccess = true
            }
          }
        } catch (error) {
          console.warn('Failed to load from cloud, trying local:', error)
        }
      }
      
      // 2. 如果云端加载失败或无云端数据，从本地加载
      if (!loadSuccess) {
        const desktopKey = `coloring-progress-${coloringPage.imageUrl}`
        const mobileKey = `coloring-page-${coloringPage.slug}`
        
        let storedData = localStorage.getItem(desktopKey) || localStorage.getItem(mobileKey)
        
        if (storedData) {
          try {
            const data = JSON.parse(storedData)
            let imageDataUrl = null
            
            // 检查桌面端新格式 (dataURL)
            if (data.dataURL) {
              imageDataUrl = data.dataURL
            }
            // 检查桌面端旧格式 (legacy data array) 
            else if (data.data && Array.isArray(data.data) && data.width && data.height) {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              if (ctx) {
                canvas.width = data.width
                canvas.height = data.height
                const imageData = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height)
                ctx.putImageData(imageData, 0, 0)
                imageDataUrl = canvas.toDataURL('image/png')
              }
            }
            // 检查移动端格式
            else if (data.imageData) {
              imageDataUrl = data.imageData
            }
            
            if (imageDataUrl) {
              setSavedWork(imageDataUrl)
              showToast.success('Loaded saved work from local storage!')
              trackUserEngagement('load_saved_work', 'mobile_local')
              loadSuccess = true
            }
          } catch (error) {
            console.warn('Failed to load from local storage:', error)
          }
        }
      }
      
      if (!loadSuccess) {
        showToast.error('No saved work found or data is corrupted')
      }
    }
  }, [coloringPage.slug, coloringPage.imageUrl, trackUserEngagement, isAuthenticated, user?.id, hasCloudSave])

  // SEO标题处理
  const actualTitle = coloringPage.title
  const displayImageUrl = savedWork || coloringPage.imageUrl

  // 分享功能 - 改进错误处理和备用方案
  const handleShare = useCallback(async () => {
    try {
      const shareData = {
        title: `${actualTitle} - Coloring Page`,
        text: `Check out this beautiful ${actualTitle.toLowerCase()} coloring page! ${savedWork ? 'I\'ve already colored it!' : 'Perfect for printing and coloring.'}`,
        url: window.location.href,
      }
      
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        trackUserEngagement('share', 'native')
        showToast.success('Shared successfully!')
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // 降级到复制链接
        await navigator.clipboard.writeText(window.location.href)
        showToast.success('Link copied to clipboard')
        trackUserEngagement('share', 'clipboard')
      } else {
        // 最后的备用方案 - 手动选择文本
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          showToast.success('Link copied to clipboard')
          trackUserEngagement('share', 'fallback')
        } catch (err) {
          showToast.error('Please manually copy the URL from your browser')
        }
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error('Share failed:', error)
      // 如果所有方法都失败，提供手动分享提示
      showToast.warning('Please manually copy and share the page URL')
    }
  }, [actualTitle, savedWork, trackUserEngagement])

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
      showToast.success('Image downloaded')
    }, 'image/png')
  }, [coloringPage.slug, trackUserEngagement])

  // 打印功能 - 支持数据URL和常规图片
  const handlePrint = useCallback(() => {
    if (!imageRef.current) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    // 如果是data URL，直接使用；否则使用原图片URL
    const printImageUrl = savedWork || displayImageUrl
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print: ${actualTitle}</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif; }
            img { max-width: 100%; height: auto; border: 1px solid #ddd; }
            .title { margin-bottom: 20px; }
            @media print {
              body { padding: 0; }
              .title { page-break-inside: avoid; margin-bottom: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="title">
            <h2>${actualTitle}</h2>
            <p>${savedWork ? 'Colored Work - Ready to Print' : 'Coloring Page - Print and Color'}</p>
          </div>
          <img src="${printImageUrl}" alt="${actualTitle}" onload="setTimeout(() => { window.print(); setTimeout(() => window.close(), 100); }, 100);" onerror="alert('Failed to load image for printing'); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
    
    trackUserEngagement('print', 'mobile')
    showToast.success('Opening print dialog...')
  }, [actualTitle, displayImageUrl, savedWork, trackUserEngagement])

  // 收藏功能
  const handleFavoriteToggle = useCallback(async () => {
    if (!isAuthenticated) {
      showToast.warning('Please login to add favorites')
      return
    }

    try {
      const isCurrentlyFavorite = isFavorite(coloringPage.id, 'library')
      if (isCurrentlyFavorite) {
        await removeFromFavorites(coloringPage.id, 'library')
        showToast.success('Removed from favorites')
      } else {
        await addToFavorites(coloringPage.id, 'library')
        showToast.success('Added to favorites')
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      showToast.error('Operation failed, please try again')
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
              Colored Work
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
              <div className="text-gray-500">Loading...</div>
            </div>
          )}
        </div>
      </div>

      {/* 简化的底部操作栏 */}
      <div className="bg-white border-t p-4 flex-shrink-0">
        {/* Load saved work button */}
        {(hasLocalSave || hasCloudSave) && !savedWork && (
          <div className="mb-3">
            <Button
              onClick={handleLoadSavedWork}
              className={cn(
                "w-full text-white",
                hasCloudSave 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              )}
              size="sm"
              disabled={isCheckingCloud}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {isCheckingCloud 
                ? "Checking Cloud..." 
                : hasCloudSave 
                  ? "Load from Cloud" 
                  : "Load Local Work"
              }
            </Button>
          </div>
        )}
        
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 max-w-[90px]"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 max-w-[90px]"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 max-w-[90px]"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
        
        {/* 提示信息 */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            {savedWork 
              ? hasCloudSave 
                ? "This is your colored work synced from cloud" 
                : "This is your colored work saved locally"
              : isCheckingCloud
                ? "Checking for saved work in cloud..."
                : hasCloudSave
                  ? "Tap 'Load from Cloud' to view your synced work"
                  : hasLocalSave
                    ? "Tap 'Load Local Work' to view your desktop work"
                    : isAuthenticated
                      ? "Color on any device and sync across all devices"
                      : "Color on desktop or sign in to sync across devices"
            }
          </p>
        </div>
      </div>
    </div>
  )
}