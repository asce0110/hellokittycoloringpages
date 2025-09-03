"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BowIcon } from "@/components/icons/bow-icon"
import { Library, Sparkles, HelpCircle } from "lucide-react"
import MovingImageBanner from "@/components/moving-image-banner"
import { PopularColoringGrid } from "@/components/popular-coloring-grid"
import { MobileHomeHero, MobileHomeFeatures, MobileQuickStats } from "@/components/mobile-home-layout"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
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
                  Free Coloring Pages
                </span>
                {/* 桌面端完整标题 */}
                <span className="hidden sm:block text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Coloring Pages Printable | Free Download & Print Instantly
                </span>
              </h1>
              <p className="mx-auto text-white/90 drop-shadow-md">
                {/* 移动端简化描述 */}
                <span className="block sm:hidden text-sm max-w-[280px]">
                  500+ free printable coloring pages for all ages!
                </span>
                {/* 桌面端完整描述 */}
                <span className="hidden sm:block max-w-[700px] md:text-xl">
                  Download coloring pages printable instantly! 500+ original printable coloring sheets ready to download. Perfect for kids, adults, teachers & parents. Explore our comprehensive library of coloring pages printable for every skill level now!
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

      {/* Fresh Images Section - 只在有真实数据库数据时显示 */}
      {(loading || showFreshImages) && (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-card relative -mt-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-full bg-muted px-4 py-2 text-sm font-semibold text-primary">
                {loading ? 'Loading...' : timeRange?.label || 'Featured Pages'}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl text-gray-800 dark:text-gray-200">
                Fresh Printable Coloring Pages Collection
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

      {/* Popular Creative Content Section */}
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

      {/* Browse Original Art by Difficulty Level - moved here */}
      <section className="w-full py-16 bg-gradient-to-br from-pink-100 via-purple-50 via-blue-50 via-green-50 via-yellow-50 to-orange-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:via-blue-900/20 dark:via-green-900/20 dark:via-yellow-900/20 dark:to-orange-900/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Browse Original Art by Difficulty Level
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find the perfect original coloring pages and AI-generated designs for your skill level. Choose from simple patterns for beginners to intricate masterpieces for advanced artists.
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

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tighter sm:text-5xl">
              How It Works: Two Paths to Creativity
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Choose your adventure! Explore our curated collection or become the creator.
            </p>
          </div>
          <div className="mx-auto grid gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-card rounded-2xl shadow-md">
              <Library className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">1. Explore the Official Library</h3>
              <p className="text-muted-foreground">
                Browse thousands of high-resolution, ready-to-print coloring pages. Our library is meticulously
                organized by themes, characters, and difficulty. Find your favorite, click, and instantly download or
                print. Perfect for quick, reliable fun.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-card rounded-2xl shadow-md">
              <Sparkles className="h-12 w-12 mb-4 text-secondary" />
              <h3 className="text-2xl font-bold mb-2">2. Create with AI</h3>
              <p className="text-muted-foreground">
                Unleash your imagination! Describe any scene, character, or theme in our AI creator tool. "A cute
                cat as an astronaut on Mars," or "a magical forest with woodland creatures." Our AI will generate a unique,
                personalized coloring page just for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-8 md:py-16 lg:py-20 bg-white dark:bg-card">
        <div className="container px-4 md:px-6 text-center">
          <BowIcon className="h-16 w-16 mx-auto text-primary opacity-80" />
          <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl mb-4 text-gray-800 dark:text-gray-200 mt-2">
            Your Ultimate Creative Coloring Destination
          </h2>
          <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl">
            Welcome to your ultimate printable coloring pages destination! Explore our extensive collection of free coloring pages printable for every age and skill level, from simple designs for kids to intricate patterns for adults.
            Create custom coloring pages with our AI generator and enjoy hours of creative fun with unlimited artistic possibilities.
          </p>
        </div>
      </section>

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
