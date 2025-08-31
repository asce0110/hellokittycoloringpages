"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, ArrowRight, Loader2 } from "lucide-react"
import { ColoringPageData } from "@/lib/coloring-data"
import { cn } from "@/lib/utils"

interface SEORelatedContentProps {
  currentPage: ColoringPageData
  relatedPages?: ColoringPageData[]
}

// 接口定义：从数据库获取的真实图片数据
interface LibraryImage {
  id: string
  title: string
  description?: string
  seo_slug?: string
  image_url: string
  thumbnail_url?: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  is_active: boolean
  created_at: string
}

// 默认推荐内容 - 当数据库没有数据时使用
const getDefaultRecommendations = (currentPage: ColoringPageData): LibraryImage[] => {
  const defaultPages = [
    {
      id: 'default-1',
      title: 'Creative Animal Coloring Page',
      description: 'A wonderful animal design perfect for creative coloring',
      image_url: '/hello-kitty-coloring-page.png',
      thumbnail_url: '/hello-kitty-coloring-page.png',
      category: 'Animals',
      difficulty: 'easy' as const,
      is_active: true,
      created_at: new Date().toISOString(),
      seo_slug: 'creative-animal-coloring-page'
    },
    {
      id: 'default-2',
      title: 'Fantasy Art Coloring Design',
      description: 'Magical fantasy themes for artistic expression',
      image_url: '/hello-kitty-coloring-page.png',
      thumbnail_url: '/hello-kitty-coloring-page.png',
      category: 'Fantasy',
      difficulty: 'medium' as const,
      is_active: true,
      created_at: new Date().toISOString(),
      seo_slug: 'fantasy-art-coloring-design'
    },
    {
      id: 'default-3',
      title: 'Nature Scene Coloring Page',
      description: 'Beautiful nature scenes for relaxing coloring time',
      image_url: '/hello-kitty-coloring-page.png',
      thumbnail_url: '/hello-kitty-coloring-page.png',
      category: 'Nature',
      difficulty: 'medium' as const,
      is_active: true,
      created_at: new Date().toISOString(),
      seo_slug: 'nature-scene-coloring-page'
    }
  ]

  // 过滤掉与当前页面相同的内容
  return defaultPages.filter(page => 
    page.seo_slug !== currentPage.slug && 
    page.id !== currentPage.id
  )
}

// 获取相关推荐内容的API函数
const fetchRelatedContent = async (currentPage: ColoringPageData): Promise<LibraryImage[]> => {
  try {
    console.log('🔍 Fetching related content for:', currentPage.category)
    
    // 优先获取相同分类的图片，如果没有则获取所有图片
    const response = await fetch(`/api/library-images?category=${encodeURIComponent(currentPage.category)}&limit=6&featured=true`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      const images = result.data || []
      
      // 过滤掉当前页面
      const filteredImages = images.filter((img: LibraryImage) => 
        img.seo_slug !== currentPage.slug && img.id !== currentPage.id
      )
      
      console.log(`✅ Found ${filteredImages.length} related images for category: ${currentPage.category}`)
      
      // 如果同分类图片不够，获取其他分类的推荐图片
      if (filteredImages.length < 3) {
        const additionalResponse = await fetch(`/api/library-images?limit=6&featured=true`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (additionalResponse.ok) {
          const additionalResult = await additionalResponse.json()
          const additionalImages = additionalResult.data || []
          
          // 合并图片并去重
          const allImages = [...filteredImages]
          additionalImages.forEach((img: LibraryImage) => {
            if (!allImages.find(existing => existing.id === img.id) && 
                img.seo_slug !== currentPage.slug && 
                img.id !== currentPage.id) {
              allImages.push(img)
            }
          })
          
          return allImages.slice(0, 3)
        } else {
          // 如果获取额外图片也失败，则补充默认推荐
          const defaultItems = getDefaultRecommendations(currentPage)
          const combined = [...filteredImages, ...defaultItems]
          return combined.slice(0, 3)
        }
      }
      
      // 如果图片数量足够，直接返回
      if (filteredImages.length >= 3) {
        return filteredImages.slice(0, 3)
      } else {
        // 如果图片不足3张，补充默认推荐
        const defaultItems = getDefaultRecommendations(currentPage)
        const combined = [...filteredImages, ...defaultItems]
        return combined.slice(0, 3)
      }
    } else {
      console.warn('⚠️ Failed to fetch related content from API - using default recommendations')
      return getDefaultRecommendations(currentPage)
    }
  } catch (error) {
    console.error('❌ Error fetching related content - using default recommendations:', error)
    return getDefaultRecommendations(currentPage)
  }
}

// 生成预估时间
const getEstimatedTime = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '10-15 min'
    case 'medium': return '20-30 min'
    case 'hard': return '30-45 min'
    default: return '15-25 min'
  }
}

// 生成SEO友好的URL
const generateColoringUrl = (image: LibraryImage): string => {
  if (image.seo_slug) {
    return `/${image.seo_slug}`
  }
  
  // 🎯 简单策略：取标题中"-"前面的部分，没有"-"就用全名
  const beforeDash = image.title.split('-')[0].trim()
  
  const baseSlug = beforeDash
    .toLowerCase()
    // 清理特殊字符，只保留字母数字和空格
    .replace(/[^a-z0-9\s]/g, '')
    // 空格转连字符
    .replace(/\s+/g, '-')
    // 合并多个连字符
    .replace(/-+/g, '-')
    // 移除首尾连字符
    .replace(/^-+|-+$/g, '') || 'creative-drawing'
  
  return `/${baseSlug}`
}

// Learning resources recommendations
const learningResources = [
  {
    title: "Color Theory Basics",
    description: "Learn fundamental color matching principles to create more beautiful artwork",
    link: "/learn/color-theory",
    type: "Tutorial"
  },
  {
    title: "Children's Creativity Development",
    description: "How coloring promotes children's creativity and cognitive development",
    link: "/learn/creativity-development",
    type: "Education"
  },
  {
    title: "Digital Art Techniques",
    description: "Master advanced techniques and methods for digital coloring",
    link: "/learn/digital-art-tips",
    type: "Tips"
  }
]

export function SEORelatedContent({ currentPage, relatedPages }: SEORelatedContentProps) {
  const [relatedImages, setRelatedImages] = useState<LibraryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取相关内容
  useEffect(() => {
    const loadRelatedContent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const images = await fetchRelatedContent(currentPage)
        setRelatedImages(images)
      } catch (err) {
        console.error('Failed to load related content:', err)
        // 即使出错，也设置默认推荐内容而不是显示错误
        const defaultImages = getDefaultRecommendations(currentPage)
        setRelatedImages(defaultImages)
        console.log('✅ Using default recommendations due to error')
      } finally {
        setIsLoading(false)
      }
    }

    loadRelatedContent()
  }, [currentPage.category, currentPage.id])

  return (
    <div className="space-y-8">
      {/* Related coloring pages recommendations */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Coloring Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading recommendations...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 dark:text-red-400 mb-4">Unable to load recommendations</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            // 现在总是显示推荐内容，因为有默认fallback
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedImages.map((image) => (
                <Link 
                  key={image.id}
                  href={generateColoringUrl(image)}
                  className="group block"
                >
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 dark:bg-gray-700 dark:border-gray-600">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
                      {image.thumbnail_url || image.image_url ? (
                        <img 
                          src={image.thumbnail_url || image.image_url}
                          alt={image.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        (image.thumbnail_url || image.image_url) ? "hidden" : ""
                      )}>
                        <div className="text-4xl">🎨</div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant={image.difficulty === 'easy' ? 'secondary' : image.difficulty === 'medium' ? 'default' : 'destructive'} 
                          className="dark:bg-gray-600 dark:text-gray-100"
                        >
                          {image.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-gray-100">
                        {image.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {image.description || `Color this beautiful ${image.title} design`}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getEstimatedTime(image.difficulty)}
                        </span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category browsing recommendations */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Explore More Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link 
              href="/library?category=cute-characters" 
              className="block p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-100 dark:border-pink-800 hover:border-pink-200 dark:hover:border-pink-700 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">🎨</div>
                <h3 className="font-semibold text-pink-800 dark:text-pink-300">Character Collection</h3>
                <p className="text-sm text-pink-600 dark:text-pink-400">50+ Creative Designs</p>
              </div>
            </Link>
            
            <Link 
              href="/library?difficulty=easy" 
              className="block p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 hover:border-green-200 dark:hover:border-green-700 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">⭐</div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Beginner Friendly</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Easy to Start</p>
              </div>
            </Link>
            
            <Link 
              href="/create" 
              className="block p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-100 dark:border-purple-800 hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">🤖</div>
                <h3 className="font-semibold text-purple-800 dark:text-purple-300">AI Generated</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Create Unique Designs</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Learning resources recommendations */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningResources.map((resource, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{resource.type}</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 text-gray-900 dark:text-gray-100">{resource.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{resource.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="flex-shrink-0 dark:hover:bg-gray-500">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics - SEO value */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Coloring Pages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">100K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">User Creations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">Free</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Forever</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}