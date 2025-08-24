"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LibraryImage } from "@/lib/types"
import { generateSmartSeoUrl } from "@/lib/seo-url-generator"

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
  const [isNavigating, setIsNavigating] = React.useState(false)
  
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
          description: image.description || ''
        })
      })

      if (response.ok) {
        const cleanSeoUrl = `/color/${seoSlug}`
        
        console.log('🎯 生成的SEO URL:', {
          cleanUrl: cleanSeoUrl,
          seoSlug: seoSlug,
          imageUrl: image.imageUrl.substring(0, 50) + '...',
          title: image.title,
          storedOnServer: true
        })
        
        router.push(cleanSeoUrl)
      } else {
        // 如果API存储失败，回退到URL参数方案
        console.warn('⚠️ SEO存储失败，使用URL参数回退方案')
        const encodedImageUrl = encodeURIComponent(image.imageUrl)
        const encodedTitle = encodeURIComponent(image.title)
        const encodedDescription = encodeURIComponent(image.description || '')
        const fallbackUrl = `/color/${seoSlug}?imageUrl=${encodedImageUrl}&title=${encodedTitle}&description=${encodedDescription}`
        router.push(fallbackUrl)
      }
    } catch (error) {
      console.error('❌ SEO存储请求失败:', error)
      // 网络错误时使用基本的slug
      const basicSlug = `hello-kitty-${image.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-coloring-page`
      const encodedImageUrl = encodeURIComponent(image.imageUrl)
      const encodedTitle = encodeURIComponent(image.title)
      const encodedDescription = encodeURIComponent(image.description || '')
      const fallbackUrl = `/color/${basicSlug}?imageUrl=${encodedImageUrl}&title=${encodedTitle}&description=${encodedDescription}`
      router.push(fallbackUrl)
    } finally {
      setIsNavigating(false)
    }
  }, [image, router])
  
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
              alt={`${image.title} - Hello Kitty coloring page`}
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
            
            {/* 标签区域 */}
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
          </div>
        </CardContent>
      </Card>
  )
}