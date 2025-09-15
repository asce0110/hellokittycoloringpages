"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Heart, Wand2, Download, Printer } from "lucide-react"
import { LibraryImageCard } from "@/components/library-image-card"
import { LibraryImage } from "@/lib/types"
import { demoLibraryImages } from "@/lib/demo-data"

interface FairyImage extends LibraryImage {
  fairyType: string // 🎯 改为动态字符串类型
}

export default function FairyColoringPagesPage() {
  const [fairyImages, setFairyImages] = React.useState<FairyImage[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // Simplified schema objects to avoid bundler issues
  const getSchemaData = () => ({
    collection: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Fairy Coloring Pages Printable Collection",
      "description": "Magical fairy coloring pages featuring various fairy themes. Free printable coloring pages for all ages.",
      "url": "https://coloringpagesprintable.net/fairy",
      "publisher": {
        "@type": "Organization",
        "name": "Coloreveal",
        "url": "https://coloringpagesprintable.net"
      }
    },
    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Are fairy coloring pages free to print?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! All our fairy coloring pages are completely free to download and print at home."
          }
        }
      ]
    }
  })
  
  // Filter for fairy-related content
  React.useEffect(() => {
    const fetchFairyImages = async () => {
      setLoading(true)
      try {
        // 获取真实数据库数据
        const response = await fetch('/api/library-images?limit=50')
        let fairyFilteredImages: FairyImage[] = []
        
        if (response.ok) {
          const data = await response.json()
          console.log('🧚 获取到的数据库图片数据:', data)
          console.log('🧚 图片数量:', data.data?.length || 0)
          
          if (data.success && data.data) {
            // 过滤fairy相关的图片  
            fairyFilteredImages = data.data
              .filter((image: LibraryImage) => 
                image.tags.some(tag => 
                  tag.toLowerCase().includes('fairy') || 
                  tag.toLowerCase().includes('princess') ||
                  tag.toLowerCase().includes('butterfly') ||
                  tag.toLowerCase().includes('flower') ||
                  tag.toLowerCase().includes('garden') ||
                  tag.toLowerCase().includes('magical') ||
                  tag.toLowerCase().includes('castle')
                )
              )
              .map((image: LibraryImage) => ({
                ...image,
                fairyType: extractFairyType(image.tags, image.title, image.description)
              } as FairyImage))
              .slice(0, 24) // 显示更多fairy图片
          }
        }
        
        // 如果数据库没有数据，使用demo数据作为后备
        if (fairyFilteredImages.length === 0) {
          console.log('🧚 数据库无fairy数据，使用demo数据')
          fairyFilteredImages = demoLibraryImages
            .filter(image => 
              image.tags.some(tag => 
                tag.toLowerCase().includes('fairy') || 
                tag.toLowerCase().includes('princess') ||
                tag.toLowerCase().includes('butterfly') ||
                tag.toLowerCase().includes('flower') ||
                tag.toLowerCase().includes('garden') ||
                tag.toLowerCase().includes('magical') ||
                tag.toLowerCase().includes('castle')
              )
            )
            .map(image => ({
              ...image,
              fairyType: extractFairyType(image.tags, image.title, image.description)
            } as FairyImage))
            .slice(0, 12)
        }
        
        console.log('🧚 最终fairy图片数量:', fairyFilteredImages.length)
        
        // 🎯 调试信息：检查每个类型的分布
        const typeDistribution = fairyFilteredImages.reduce((acc, img) => {
          const type = extractFairyType(img.tags, img.title, img.description)
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        console.log('🧚 Fairy动态类型分布:', typeDistribution)
        console.log('🧚 示例图片分类:', fairyFilteredImages.slice(0, 5).map(img => ({
          title: img.title,
          tags: img.tags,
          description: img.description?.substring(0, 50) + '...',
          extractedType: extractFairyType(img.tags, img.title, img.description)
        })))
        
        setFairyImages(fairyFilteredImages)
        
      } catch (error) {
        console.error('🧚 获取fairy图片失败:', error)
        // 出错时使用demo数据
        const fallbackImages = demoLibraryImages
          .filter(image => 
            image.tags.some(tag => 
              tag.toLowerCase().includes('fairy') || 
              tag.toLowerCase().includes('princess') ||
              tag.toLowerCase().includes('butterfly') ||
              tag.toLowerCase().includes('flower') ||
              tag.toLowerCase().includes('garden') ||
              tag.toLowerCase().includes('magical') ||
              tag.toLowerCase().includes('castle')
            )
          )
          .map(image => ({
            ...image,
            fairyType: extractFairyType(image.tags, image.title, image.description)
          } as FairyImage))
          .slice(0, 12)
        setFairyImages(fallbackImages)
      } finally {
        setLoading(false)
      }
    }

    fetchFairyImages()
  }, [])
  
  // 🎯 新的动态分类系统：根据实际数据提取分类
  const extractFairyType = (tags: string[], title?: string, description?: string): string => {
    const allText = [tags.join(' '), title || '', description || ''].join(' ').toLowerCase()
    
    console.log(`🧚 动态分类调试: "${(title || '').substring(0, 40)}..."`, {
      tags: tags,
      title: title,
      extractedText: allText.substring(0, 120)
    })
    
    // 🎯 从标签中提取关键分类词（先检查tags，再检查title）
    const keywordMap = {
      'castle': ['castle', 'throne', 'palace'],
      'royal': ['crown', 'royal'],
      'butterfly': ['butterfly', 'wing'],
      'garden': ['garden', 'flower', 'plant', 'rose', 'bloom'],
      'woodland': ['forest', 'woodland', 'tree', 'nature'],
      'dancing': ['dancing', 'dance', 'ballet'],
      'sea': ['sea', 'ocean', 'water', 'mermaid'],
      'ice': ['ice', 'snow', 'winter', 'frozen'],
      'fire': ['fire', 'flame', 'phoenix'],
      'moon': ['moon', 'night', 'star'],
      'sun': ['sun', 'light', 'golden']
    }
    
    // 逐一检查关键词组
    for (const [category, keywords] of Object.entries(keywordMap)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword)) {
          console.log(`✅ 提取到分类: ${category} (关键词: ${keyword})`)
          return category
        }
      }
    }
    
    // 🎯 如果没找到匹配，使用通用的"fairy"分类
    console.log(`✅ 使用通用分类: fairy`)
    return 'fairy'
  }
  
  // 🎯 动态生成分类列表
  const fairyCategories = React.useMemo(() => {
    // 统计所有不同的类型
    const typeCounts = fairyImages.reduce((acc, img) => {
      acc[img.fairyType] = (acc[img.fairyType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // 为每个类型定义显示信息
    const typeConfig: Record<string, { name: string; description: string; emoji: string; color: string }> = {
      'castle': {
        name: 'Castle Fairies',
        description: 'Enchanting fairy princesses in magical castle settings',
        emoji: '🏰',
        color: 'bg-indigo-100 text-indigo-800'
      },
      'royal': {
        name: 'Royal Fairies',
        description: 'Majestic fairies with crowns and royal elements',
        emoji: '👑',
        color: 'bg-yellow-100 text-yellow-800'
      },
      'butterfly': {
        name: 'Butterfly Fairies',
        description: 'Graceful fairies with delicate butterfly wings',
        emoji: '🦋',
        color: 'bg-purple-100 text-purple-800'
      },
      'garden': {
        name: 'Garden Fairies',
        description: 'Magical fairies tending to beautiful gardens',
        emoji: '🌺',
        color: 'bg-yellow-100 text-yellow-800'
      },
      'woodland': {
        name: 'Woodland Fairies',
        description: 'Enchanting forest sprites and woodland fairy adventures',
        emoji: '🧚‍♀️',
        color: 'bg-green-100 text-green-800'
      },
      'dancing': {
        name: 'Dancing Fairies',
        description: 'Graceful fairies in elegant dance poses',
        emoji: '💃',
        color: 'bg-pink-100 text-pink-800'
      },
      'sea': {
        name: 'Sea Fairies',
        description: 'Mystical water fairies and mermaids',
        emoji: '🧜‍♀️',
        color: 'bg-cyan-100 text-cyan-800'
      },
      'ice': {
        name: 'Ice Fairies',
        description: 'Beautiful winter and snow fairies',
        emoji: '❄️',
        color: 'bg-blue-100 text-blue-800'
      },
      'fire': {
        name: 'Fire Fairies',
        description: 'Powerful flame and phoenix fairies',
        emoji: '🔥',
        color: 'bg-red-100 text-red-800'
      },
      'moon': {
        name: 'Moon Fairies',
        description: 'Mystical night and star fairies',
        emoji: '🌙',
        color: 'bg-slate-100 text-slate-800'
      },
      'sun': {
        name: 'Sun Fairies',
        description: 'Radiant golden and light fairies',
        emoji: '☀️',
        color: 'bg-orange-100 text-orange-800'
      },
      'fairy': {
        name: 'General Fairies',
        description: 'Beautiful general fairy designs',
        emoji: '✨',
        color: 'bg-violet-100 text-violet-800'
      }
    }
    
    // 只返回有图片的类型
    return Object.entries(typeCounts)
      .filter(([type, count]) => count > 0) // 只显示有图片的分类
      .map(([type, count]) => ({
        id: type,
        name: typeConfig[type]?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} Fairies`,
        description: typeConfig[type]?.description || `Beautiful ${type} fairy designs`,
        emoji: typeConfig[type]?.emoji || '🧚‍♀️',
        color: typeConfig[type]?.color || 'bg-gray-100 text-gray-800',
        count
      }))
      .sort((a, b) => b.count - a.count) // 按数量排序
  }, [fairyImages])
  
  return (
    <>
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaData().collection) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaData().faq) }}
      />
      
      <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 relative overflow-hidden">
        {/* Magical background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-4 h-4 bg-pink-300 rounded-full opacity-60 animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-purple-300 rounded-full opacity-40 animate-bounce" />
          <div className="absolute bottom-32 left-32 w-2 h-2 bg-blue-300 rounded-full opacity-50 animate-ping" />
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-yellow-300 rounded-full opacity-30 animate-pulse" />
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="h-8 w-8 text-pink-500" />
                <Badge variant="outline" className="bg-white/80 text-pink-700 border-pink-200">
                  Featured Theme Collection
                </Badge>
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Fairy Coloring Pages Printable
              </h1>
              
              <p className="mx-auto max-w-[800px] text-gray-700 dark:text-gray-300 md:text-xl/relaxed">
                Enter a magical world where fairies dance among flowers and butterflies flutter through enchanted gardens. 
                Discover our premium collection of <strong>fairy coloring pages printable</strong> featuring woodland fairies, flower fairies, 
                butterfly fairies, and fairy princess adventures. Perfect for sparking imagination and creativity in colorists of all ages.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                <Link href="#specialized-collections">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Explore Specialized Collections
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                <Link href="/library?category=fairy">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Browse All Fairy Pages
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                <Link href="/create?theme=fairy">
                  Create Custom Fairy
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Fairy Categories - Enhanced with magical styling */}
      <section className="w-full py-16 bg-gradient-to-br from-purple-50/60 via-pink-50/60 to-blue-50/60 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 relative overflow-hidden">
        {/* Floating magical elements background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-32 right-16 w-16 h-16 bg-purple-200/30 rounded-full blur-lg animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-32 right-12 w-14 h-14 bg-yellow-200/30 rounded-full blur-lg animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-pink-300/50 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-purple-300/50 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Explore Fairy Coloring Themes
              </h2>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
                <Wand2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Each <strong>fairy coloring pages</strong> category offers unique magical adventures perfect for creative experiences. 
              From woodland sprites to butterfly fairies, find the perfect <em>printable fairy coloring sheets</em> for every mood.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fairyCategories.map((category, index) => {
              // Create unique gradient combinations for each category
              const gradients = [
                'from-purple-100 via-pink-50 to-purple-100',
                'from-blue-100 via-purple-50 to-blue-100', 
                'from-pink-100 via-rose-50 to-pink-100',
                'from-indigo-100 via-blue-50 to-indigo-100',
                'from-emerald-100 via-green-50 to-emerald-100',
                'from-yellow-100 via-amber-50 to-yellow-100',
                'from-rose-100 via-pink-50 to-rose-100',
                'from-cyan-100 via-blue-50 to-cyan-100',
              ]
              
              const shadowColors = [
                'shadow-purple-200/50 hover:shadow-purple-300/60',
                'shadow-blue-200/50 hover:shadow-blue-300/60',
                'shadow-pink-200/50 hover:shadow-pink-300/60', 
                'shadow-indigo-200/50 hover:shadow-indigo-300/60',
                'shadow-emerald-200/50 hover:shadow-emerald-300/60',
                'shadow-yellow-200/50 hover:shadow-yellow-300/60',
                'shadow-rose-200/50 hover:shadow-rose-300/60',
                'shadow-cyan-200/50 hover:shadow-cyan-300/60',
              ]
              
              const hoverGradients = [
                'group-hover:from-purple-200 group-hover:via-pink-100 group-hover:to-purple-200',
                'group-hover:from-blue-200 group-hover:via-purple-100 group-hover:to-blue-200',
                'group-hover:from-pink-200 group-hover:via-rose-100 group-hover:to-pink-200',
                'group-hover:from-indigo-200 group-hover:via-blue-100 group-hover:to-indigo-200',
                'group-hover:from-emerald-200 group-hover:via-green-100 group-hover:to-emerald-200',
                'group-hover:from-yellow-200 group-hover:via-amber-100 group-hover:to-yellow-200',
                'group-hover:from-rose-200 group-hover:via-pink-100 group-hover:to-rose-200',
                'group-hover:from-cyan-200 group-hover:via-blue-100 group-hover:to-cyan-200',
              ]
              
              return (
                <Card 
                  key={category.id} 
                  className={`group cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:rotate-1 border-2 border-white/80 backdrop-blur-sm ${shadowColors[index % shadowColors.length]} hover:shadow-2xl overflow-hidden relative`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} ${hoverGradients[index % hoverGradients.length]} transition-all duration-500 opacity-80`} />
                  
                  {/* Floating sparkles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-ping" style={{ animationDelay: `${index * 0.5}s` }} />
                    <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: `${index * 0.3}s` }} />
                    <div className="absolute top-1/2 right-8 w-1 h-1 bg-white/50 rounded-full animate-ping" style={{ animationDelay: `${index * 0.7}s` }} />
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-md" />
                        <span className="text-4xl relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                          {category.emoji}
                        </span>
                      </div>
                      <Badge className={`${category.color} shadow-sm border-white/20 transition-all duration-300 group-hover:scale-110`}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        {category.count} pages
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-700 transition-colors duration-300 drop-shadow-sm">
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-white/80 backdrop-blur-sm border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 group-hover:border-purple-300 group-hover:text-purple-700 font-medium"
                    >
                      <Link href={`/library?category=fairy&type=${category.id}`}>
                        <Wand2 className="w-4 h-4 mr-2" />
                        View {category.name} →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* Bottom decorative elements */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/40 shadow-lg">
              <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                {fairyCategories.length} Magical Categories • {fairyImages.length} Enchanting Pages
              </span>
              <Heart className="w-4 h-4 text-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fairy Coloring Pages */}
      <section className="w-full py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured Fairy Coloring Pages Printable
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hand-selected magical <strong>fairy printable coloring pages</strong> perfect for creating beautiful artwork. 
              Each design features enchanting fairies with intricate details ideal for both kids and adults who love fairy magic.
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {fairyImages.map((image) => (
                <LibraryImageCard
                  key={`fairy-${image.id}`}
                  image={image}
                  showDifficulty={true}
                  showCategory={false}
                  className="hover:scale-105 transition-transform duration-300"
                />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/library?category=fairy">
                <Star className="mr-2 h-5 w-5" />
                View All Fairy Coloring Pages
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits & Features */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose Coloreveal Fairy Pages?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Download</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get your <strong>fairy coloring pages printable</strong> instantly. No waiting, no delays - just pure creative magic ready to print at home.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Print Ready</h3>
              <p className="text-gray-600 dark:text-gray-400">
                High-quality <em>printable fairy coloring sheets</em> optimized for home printing. Perfect lines and magical details in every fairy design.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Family Friendly</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Safe, appropriate fairy themes perfect for children and adults to enjoy together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Long-tail Keywords Section */}
      <section id="specialized-collections" className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Specialized Fairy Coloring Collections
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore our targeted fairy coloring themes, each designed for specific creative interests and skill levels
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/fairy-princess-coloring-pages" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">👑🧚‍♀️</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                    Fairy Princess Coloring Pages
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Magical princesses with fairy wings, crowns, and enchanted castles
                  </p>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                    Long-tail: "fairy princess coloring pages printable"
                  </Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/tooth-fairy-coloring-pages" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">🦷🧚‍♀️</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    Tooth Fairy Coloring Pages
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Magical tooth fairies for kids losing their baby teeth
                  </p>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Long-tail: "tooth fairy coloring pages printable"
                  </Badge>
                </CardContent>
              </Card>
            </Link>
            
            <div className="group opacity-60">
              <Card className="overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🦋🧚‍♀️</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">
                    Butterfly Fairy Coloring Pages
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Graceful fairies with delicate butterfly wings and patterns
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="w-full py-12 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              More Magical Collections
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/princess-coloring-pages" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">
                Princess Coloring Pages
              </Link>
              <Link href="/butterfly-coloring-pages" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                Butterfly Designs
              </Link>
              <Link href="/garden-coloring-pages" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                Garden Themes
              </Link>
              <Link href="/castle-coloring-pages" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Castle Adventures
              </Link>
              <Link href="/library" className="text-gray-600 hover:text-gray-700 font-medium hover:underline">
                All Coloreveal Collections
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}