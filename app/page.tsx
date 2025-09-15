"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BowIcon } from "@/components/icons/bow-icon"
import { Library, Sparkles, HelpCircle, Download, Heart, Wand2 } from "lucide-react"
import MovingImageBanner from "@/components/moving-image-banner"
import { PopularColoringGrid } from "@/components/popular-coloring-grid"
import { MobileHomeHero, MobileHomeFeatures, MobileQuickStats } from "@/components/mobile-home-layout"
import { SimpleNewsletter } from "@/components/simple-newsletter"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import * as React from "react"
import { getTimeRangeQueryParams } from "@/lib/time-filters"

// Fresh Images 数据类型
interface FreshImage {
  id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  category: string
  difficulty: 'easy' | 'medium' | 'complex'
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

interface TimeRange {
  label: string
  description: string
  filterDate: Date | string
  period: 'week' | 'month' | 'quarter' | 'year'
}

interface FreshImagesResponse {
  success: boolean
  timeRange: TimeRange
  images: FreshImage[]
  totalCount: number
  error?: string
  metadata: {
    requestedCount: number
    period: string
    filterDate: string
    dataSource?: string // 🎯 数据源标识：'database' | 'mock' | 'fallback'
  }
}

export default function HomePage() {
  const [freshImages, setFreshImages] = useState<FreshImage[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFreshImages, setShowFreshImages] = useState(false)
  const isMobile = useIsMobile()

  // 获取最新图片数据 - 增强调试和错误处理
  useEffect(() => {
    const fetchFreshImages = async (retryCount = 0) => {
      const maxRetries = 3 // 增加重试次数
      
      try {
        setLoading(true)
        
        console.log(`🔍 获取Fresh Images (尝试 ${retryCount + 1}/${maxRetries + 1})`)
        console.log(`📡 正在请求: /api/fresh-images/?count=4`)
        
        // 增加超时控制和更详细的错误处理
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时
        
        const response = await fetch('/api/fresh-images/?count=4', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        console.log(`📊 API响应状态: ${response.status} ${response.statusText}`)
        console.log(`📋 响应头:`, Object.fromEntries(response.headers))
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ API错误响应:`, errorText)
          throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`)
        }
        
        const responseText = await response.text()
        console.log(`📄 原始响应内容 (前500字符):`, responseText.substring(0, 500))
        
        let data: FreshImagesResponse
        try {
          data = JSON.parse(responseText)
        } catch (parseErr) {
          console.error(`❌ JSON解析失败:`, parseErr)
          console.error(`🔍 响应内容:`, responseText)
          throw new Error(`JSON解析失败: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`)
        }
        
        console.log(`✅ 解析成功的数据结构:`, {
          success: data.success,
          hasImages: !!data.images,
          imageCount: data.images?.length || 0,
          hasTimeRange: !!data.timeRange,
          dataSource: data.metadata?.dataSource || 'unknown'
        })
        
        if (data.success && data.images && data.images.length > 0) {
          // 🎯 只接受真实数据库数据，拒绝模拟数据
          const isRealDatabaseData = data.metadata?.dataSource === 'database'
          
          console.log(`🔍 数据源验证:`, {
            success: data.success,
            dataSource: data.metadata?.dataSource,
            isRealDatabaseData,
            imageCount: data.images.length,
            sampleIds: data.images.slice(0, 2).map(img => img.id)
          })
          
          if (isRealDatabaseData) {
            console.log(`✅ 真实数据库数据加载成功:`, {
              images: data.images.slice(0, 2).map(img => ({ id: img.id, title: img.title })),
              totalCount: data.images.length,
              timeRange: data.timeRange.label
            })
            
            setFreshImages(data.images)
            setTimeRange(data.timeRange)
            setShowFreshImages(true)
            setLoading(false)
            
            console.log(`✅ Fresh Images加载完成 (真实数据)`)
            return // 成功，直接返回
          } else {
            console.log('ℹ️ 非数据库数据源，隐藏Fresh Images部分')
            // 非数据库数据，隐藏Fresh Images部分
            setShowFreshImages(false)
            setLoading(false)
            return
          }
        } else {
          console.log('ℹ️ 无有效数据，隐藏Fresh Images部分')
          // 无有效数据，隐藏Fresh Images部分
          setShowFreshImages(false)
          setLoading(false)
          return
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error(`❌ Fresh images 加载失败 (尝试 ${retryCount + 1}):`, {
          error: errorMessage,
          name: err instanceof Error ? err.name : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined
        })
        
        // 如果还有重试机会
        if (retryCount < maxRetries) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000) // 指数退避，最大5秒
          console.log(`🔄 将在${retryDelay}ms后重试... (${retryCount + 1}/${maxRetries})`)
          setTimeout(() => {
            fetchFreshImages(retryCount + 1)
          }, retryDelay)
          return
        }
        
        // 所有重试都失败了
        console.log('ℹ️ 所有重试都失败，隐藏Fresh Images部分')
        
        setShowFreshImages(false)
        setLoading(false)
      }
    }

    // 延迟启动
    const timer = setTimeout(() => {
      fetchFreshImages()
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col">
      {/* 响应式优化的Hero区域 */}
      <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/20 relative overflow-hidden">
        {/* Background Elements */}
        <MovingImageBanner className="z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 z-1" />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-2" />

        {/* Foreground Content */}
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-white drop-shadow-lg">
                {/* 移动端简化标题 */}
                <span className="block sm:hidden text-2xl font-extrabold">
                  Coloreveal
                </span>
                {/* 桌面端完整标题 */}
                <span className="hidden sm:block text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Coloreveal - Free Coloring Pages Printable
                </span>
              </h1>
              <p className="mx-auto text-white/90 drop-shadow-md">
                {/* 移动端简化描述 */}
                <span className="block sm:hidden text-sm max-w-[280px]">
                  Spark creativity with free printable coloring pages for all ages!
                </span>
                {/* 桌面端完整描述 */}
                <span className="hidden sm:block max-w-[700px] mx-auto md:text-xl">
                  Welcome to Coloreveal, your creative destination for free printable coloring pages! Discover magical fairy themes, AI-generated designs, and curated collections perfect for kids, adults, teachers & parents. Spark imagination and create beautiful moments together.
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
              {/* --- UPDATED: 移动端优化按钮 --- */}
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto px-6 sm:px-8 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Link href="/library">
                  🎨 <span className="hidden sm:inline">Art Gallery</span><span className="sm:hidden">Gallery</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-pink-200 text-pink-100 bg-pink-500/20 hover:bg-pink-500/30 backdrop-blur-sm w-full sm:w-auto px-6 sm:px-8 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Link href="/fairy">
                  <span className="hidden sm:inline">✨ Fairy Magic</span><span className="sm:hidden">🧚‍♀️ Fairy</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white bg-transparent hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto px-6 sm:px-8 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Link href="/create">
                  <span className="hidden sm:inline">AI Studio</span><span className="sm:hidden">AI Create</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* 移动端优化的快速统计 */}
      <MobileQuickStats />

      {/* 2. Featured Categories - Core Strategic Section */}
      <section className="w-full py-12 md:py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Explore Featured Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Discover hundreds of high-quality coloring pages organized by theme
            </p>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
            {/* Animals */}
            <Link href="/library?category=animals" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-green-300 dark:hover:border-green-600">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-green-200 group-hover:to-blue-200 dark:group-hover:from-green-800/30 dark:group-hover:to-blue-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🐾</div>
                    <div className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-green-50 dark:group-hover:bg-green-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-500">Animals</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Fairy Tales */}
            <Link href="/fairy" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-pink-300 dark:hover:border-pink-600">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-pink-200 group-hover:to-purple-200 dark:group-hover:from-pink-800/30 dark:group-hover:to-purple-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🧚‍♀️</div>
                    <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-pink-50 dark:group-hover:bg-pink-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-pink-700 dark:group-hover:text-pink-400 transition-colors duration-500">Fairies</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Mandalas */}
            <Link href="/library?category=mandalas" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-purple-300 dark:hover:border-purple-600">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-purple-200 group-hover:to-indigo-200 dark:group-hover:from-purple-800/30 dark:group-hover:to-indigo-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🕉️</div>
                    <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-500">Mandalas</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* For Kids */}
            <Link href="/library?difficulty=easy" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-yellow-300 dark:hover:border-yellow-600">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-yellow-200 group-hover:to-orange-200 dark:group-hover:from-yellow-800/30 dark:group-hover:to-orange-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🎨</div>
                    <div className="absolute inset-0 bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors duration-500">For Kids</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Holidays */}
            <Link href="/library?category=holidays" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-red-300 dark:hover:border-red-600">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-red-100 to-green-100 dark:from-red-900/20 dark:to-green-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-red-200 group-hover:to-green-200 dark:group-hover:from-red-800/30 dark:group-hover:to-green-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🎄</div>
                    <div className="absolute inset-0 bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-red-50 dark:group-hover:bg-red-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors duration-500">Holidays</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* For Adults */}
            <Link href="/library?difficulty=complex" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-gray-400 dark:hover:border-gray-500">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-gray-200 group-hover:to-slate-200 dark:group-hover:from-gray-800/30 dark:group-hover:to-slate-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🎭</div>
                    <div className="absolute inset-0 bg-gray-500/10 group-hover:bg-gray-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-gray-50 dark:group-hover:bg-gray-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors duration-500">Adults</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Nature */}
            <Link href="/library?category=nature" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-emerald-300 dark:hover:border-emerald-600">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-emerald-200 group-hover:to-teal-200 dark:group-hover:from-emerald-800/30 dark:group-hover:to-teal-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🌿</div>
                    <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-500">Nature</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Fantasy */}
            <Link href="/library?category=fantasy" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 active:scale-95 border-2 hover:border-violet-300 dark:hover:border-violet-600">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20 flex items-center justify-center relative overflow-hidden group-hover:from-violet-200 group-hover:to-fuchsia-200 dark:group-hover:from-violet-800/30 dark:group-hover:to-fuchsia-800/30 transition-all duration-500">
                    <div className="text-3xl md:text-4xl group-hover:scale-125 transition-transform duration-500 group-active:scale-110">🦄</div>
                    <div className="absolute inset-0 bg-violet-500/10 group-hover:bg-violet-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div className="p-2 text-center group-hover:bg-violet-50 dark:group-hover:bg-violet-900/10 transition-all duration-500">
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors duration-500">Fantasy</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          <div className="text-center mt-8">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/library">
                <Library className="mr-2 h-4 w-4" />
                Browse All Collections
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Latest Additions - Fresh Images Section */}
      {(loading || showFreshImages) && (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card relative -mt-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-full bg-muted px-4 py-2 text-sm font-semibold text-primary">
                {loading ? 'Loading...' : timeRange?.label || 'Featured Pages'}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-gray-800 dark:text-gray-200">
                Latest Additions
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                {loading 
                  ? 'Loading the latest AI generated coloring pages...'
                  : timeRange?.description || 'Discover amazing new AI-generated coloring pages and printable designs perfect for kids and adults.'
                }
              </p>
              {!loading && timeRange && (
                <Link href={`/library?${getTimeRangeQueryParams(timeRange)}`}>
                  <Button variant="outline" className="mt-4">
                    View All New Pages
                  </Button>
                </Link>
              )}
            </div>

            {/* Fresh Images Grid - 移动端优化为2列 */}
            <div className="mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <CardContent className="p-0">
                      <div className="w-full aspect-square bg-muted" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="flex gap-2">
                          <div className="h-5 bg-muted rounded w-12" />
                          <div className="h-5 bg-muted rounded w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Actual fresh images (只在showFreshImages为true时才到这里)
                freshImages.map((image) => (
                  <Link 
                    key={image.id} 
                    href={`/library?imageId=${image.id}`}
                    className="block"
                  >
                    <Card
                      className="overflow-hidden group cursor-pointer shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
                    >
                      <CardContent className="p-0">
                        <Image
                          src={image.thumbnailUrl || image.imageUrl}
                          alt={`Fresh coloring page: ${image.title}`}
                          width={300}
                          height={300}
                          className="object-cover w-full aspect-square transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="p-4">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {image.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {image.description}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              New
                            </Badge>
                            {image.isFeatured && (
                              <Badge variant="default">Featured</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {image.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {/* Show total count if available */}
            {!loading && showFreshImages && timeRange && (
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                  Showing {freshImages.length} of the latest additions
                  {timeRange.period === 'week' && ' this week'}
                  {timeRange.period === 'month' && ' this month'}
                  {timeRange.period === 'quarter' && ' this quarter'}
                  {timeRange.period === 'year' && ' this year'}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Popular Downloads - Popular Creative Content Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-50 via-teal-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4 md:px-6">
          <PopularColoringGrid 
            count={10}
            showRank={true}
            showMetrics={true}
            showHeader={true}
            cardSize="medium"
            gridCols="auto"
            className="max-w-7xl mx-auto"
          />
        </div>
      </section>

      {/* 5. Seasonal/Holiday Feature - Winter Coloring Collection */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 relative overflow-hidden">
        {/* Seasonal decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-blue-200 opacity-60 animate-pulse text-4xl">❄️</div>
          <div className="absolute top-32 right-16 text-indigo-200 opacity-40 animate-bounce text-3xl">⭐</div>
          <div className="absolute bottom-20 left-1/4 text-purple-200 opacity-50 animate-ping text-2xl">✨</div>
          <div className="absolute bottom-32 right-1/3 text-blue-300 opacity-30 animate-pulse text-5xl">❄️</div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Badge variant="outline" className="bg-white/90 text-blue-700 border-blue-200 font-semibold text-sm px-4 py-2">
                🗓️ Seasonal Collection
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
              Winter Wonderland Coloring Pages
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Embrace the magic of winter with our seasonal collection! From cozy snowscenes to festive celebrations, 
              discover enchanting designs perfect for the winter season.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Link href="/library?category=winter">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Explore Winter Collection
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8">
                <Link href="/library?category=holidays">
                  View All Holiday Themes →
                </Link>
              </Button>
            </div>
            
            {/* Featured seasonal images preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
              {[
                { emoji: '❄️', title: 'Snowflakes', category: 'winter' },
                { emoji: '⛄', title: 'Snowman Fun', category: 'winter' }, 
                { emoji: '🎄', title: 'Winter Trees', category: 'winter' },
                { emoji: '🏔️', title: 'Snow Scenes', category: 'winter' }
              ].map((item, index) => (
                <Link key={index} href={`/library?category=${item.category}`} className="group">
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {item.emoji}
                      </div>
                      <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse Original Art by Difficulty Level - moved here */}
      <section className="w-full py-16 bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 via-green-50 via-yellow-50 to-orange-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:via-blue-900/20 dark:via-green-900/20 dark:via-yellow-900/20 dark:to-orange-900/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Discover Art That Sparks Your Creativity
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Coloreveal offers carefully curated coloring pages for every skill level. From magical fairy kingdoms to simple designs for beginners, find the perfect creative challenge for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Easy Coloring Pages */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Easy Creative Coloring Pages</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Perfect for beginners and young children. Simple original designs with large areas, basic patterns, and clear outlines for easy coloring.
                </p>
                <div className="space-y-2 mb-6">
                  <Badge variant="outline" className="bg-green-50 text-green-700">Beginner Friendly</Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Ages 3-7</Badge>
                </div>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/library?difficulty=easy">
                    Browse Easy Art →
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Medium Coloring Pages */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Medium Creative Coloring Pages</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Intermediate original designs with balanced detail and moderate complexity. Perfect for building coloring skills and artistic confidence.
                </p>
                <div className="space-y-2 mb-6">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">Intermediate</Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">Ages 7-12</Badge>
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/library?difficulty=medium">
                    Browse Medium Art →
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Complex Coloring Pages */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Complex Artistic Coloring Pages</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Advanced original artwork with intricate designs for expert colorists. Detailed patterns and challenging layouts for sophisticated artistic experiences.
                </p>
                <div className="space-y-2 mb-6">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">Advanced</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">Adults & Experts</Badge>
                </div>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/library?difficulty=hard">
                    Browse Complex Art →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Simple "How It Works" */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl">
              How It Works
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Getting started with Coloreveal is simple and fun!
            </p>
          </div>
          <div className="mx-auto grid gap-8 md:grid-cols-3 max-w-5xl">
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-card rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Library className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Browse & Select</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore our hundreds of free designs organized by categories, themes, and difficulty levels. Find the perfect page for your mood!
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-card rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Download className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Print Instantly</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download high-quality PDF files that print beautifully at home or at your local copy shop. No watermarks, no hassle!
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-card rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Start Coloring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Grab your favorite coloring tools and enjoy hours of creative relaxation. Share your masterpieces with family and friends!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Email Signup - Newsletter Subscription */}
      <section className="w-full py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container px-4 md:px-6">
          <SimpleNewsletter />
        </div>
      </section>

      {/* 8. About Us/Brand Story */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-blue-900/10">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <BowIcon className="h-20 w-20 mx-auto text-primary mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Our Story
              </h2>
            </div>
            
            <div className="prose prose-lg mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
              <p className="text-xl mb-6">
                Welcome to <strong className="text-primary">Coloreveal</strong> – where creativity meets technology to bring joy to families worldwide.
              </p>
              
              <p className="mb-6">
                Founded by two passionate mothers and artists, Coloreveal was born from a simple belief: 
                <em>every child deserves access to beautiful, high-quality coloring pages that spark their imagination.</em>
              </p>
              
              <p className="mb-8">
                What started as a small collection of hand-drawn designs has grown into a comprehensive platform 
                featuring both traditional artistry and cutting-edge AI-generated content. We're proud to serve 
                families, teachers, and creative minds across the globe with our ever-expanding library of 
                printable coloring pages.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Made with Love</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Every design is carefully curated to bring joy and spark creativity in colorists of all ages.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Always Free</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We believe creativity should be accessible to everyone. Our core collection will always be free.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Innovation Driven</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Combining traditional art with AI technology to create endless possibilities for creativity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-8 md:py-16 lg:py-20 bg-white dark:bg-card">
        <div className="container px-4 md:px-6 text-center">
          <BowIcon className="h-16 w-16 mx-auto text-primary opacity-80" />
          <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl mb-4 text-gray-800 dark:text-gray-200 mt-2">
            Where Creativity Meets Imagination
          </h2>
          <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl">
            At Coloreveal, we believe every moment is an opportunity to create something beautiful. Explore our curated collection of free printable coloring pages, from enchanting fairy tales to AI-generated masterpieces. 
            Discover themed collections designed to spark joy and creativity for the whole family.
          </p>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <HelpCircle className="h-10 w-10 mb-2" />
            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Have questions? We have answers. Here are some common queries from our community.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-bold">Are the coloring pages really free?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Yes! A large portion of our official library and a limited number of daily AI generations are
                  completely free for personal use. We offer a Premium plan for users who want unlimited access,
                  exclusive content, and higher-resolution downloads.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-bold">What format are the downloads in?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  All coloring pages are available as high-quality, print-ready PDF files. This ensures they look crisp
                  and clean when printed on standard A4 or US Letter paper.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-bold">
                  Can I use these images for commercial purposes?
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Our original AI-generated content is available for personal use with our free plan. Pro subscribers get commercial licensing rights for AI-generated content. All content is 100% original and copyright-free. Check your plan details for specific usage rights.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-bold">How good is the AI generation?</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  Our AI is specifically trained to produce clean, high-contrast line art perfect for coloring. It
                  excels at interpreting creative prompts and generating unique original designs in various artistic styles. The AI constantly learns and improves, consistently producing high-quality, creative results that surprise and delight users.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

    </div>
  )
}
