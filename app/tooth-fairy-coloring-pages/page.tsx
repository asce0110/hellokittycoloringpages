"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, Wand2, Download, Printer, Star, Palette, Smile } from "lucide-react"
import { supabaseAdmin } from '@/lib/supabase'

// Database Library Image interface
interface LibraryImage {
  id: string
  title: string
  description: string
  image_url: string
  thumbnail_url?: string
  tags: string[]
  category: string
  difficulty: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// SEO slug generation helper
function generateSEOSlug(title: string, id: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 60)
  
  return `${baseSlug}-coloring-pages`.replace(/^-+|-+$/g, '')
}

export default function ToothFairyColoringPagesPage() {
  const [loading, setLoading] = React.useState(true)
  const [fairyImages, setFairyImages] = React.useState<LibraryImage[]>([])
  
  // FAQ Schema for tooth fairy coloring questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are tooth fairy coloring pages free to print?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All our tooth fairy coloring pages are completely free to download and print at home. We offer 10+ unique designs including lost tooth adventures, fairy pillows, tooth castles, and magical tooth fairy scenes."
        }
      },
      {
        "@type": "Question", 
        "name": "What tooth fairy themes are available for coloring?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our tooth fairy collection includes: Lost Tooth Adventures, Fairy Pillow Magic, Tooth Fairy Castles, Magic Wand Fairies, Tooth Collection Bags, and Flying Tooth Fairies. Perfect for kids who are losing their teeth!"
        }
      },
      {
        "@type": "Question",
        "name": "What age group are tooth fairy coloring pages suitable for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our tooth fairy coloring pages are designed for ages 4-12, especially kids who are losing their baby teeth. We offer easy designs for young children (4-7 years), medium complexity for kids (8-10 years), and complex designs for older children (10-12 years)."
        }
      }
    ]
  }
  
  // Collection Schema  
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries", 
    "name": "Tooth Fairy Coloring Pages Collection",
    "description": "A magical collection of printable tooth fairy coloring pages featuring lost tooth adventures, fairy pillows, tooth castles, and cute tooth fairy designs for kids.",
    "creator": {
      "@type": "Organization",
      "name": "Coloreveal"
    },
    "about": "tooth fairy coloring pages printable",
    "genre": "Children's Coloring Pages",
    "audience": {
      "@type": "Audience",
      "audienceType": "Children ages 4-12"
    }
  }
  
  // 从数据库获取fairy相关的图片
  React.useEffect(() => {
    async function fetchFairyImages() {
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from('library_images')
            .select('id, title, description, image_url, thumbnail_url, tags, category, difficulty, is_active, created_at, updated_at')
            .eq('is_active', true)
            .eq('category', 'fairy')
            .order('created_at', { ascending: false })
            .limit(10)

          if (!error && data) {
            setFairyImages(data)
          }
        }
      } catch (error) {
        console.error('Error fetching fairy images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFairyImages()
  }, [])
  
  // 获取难度对应的颜色和图标
  const getDifficultyBadge = (difficulty: 'easy' | 'medium' | 'complex') => {
    const badges = {
      easy: { color: 'bg-green-100 text-green-700', icon: '⭐', label: 'Easy' },
      medium: { color: 'bg-yellow-100 text-yellow-700', icon: '⭐⭐', label: 'Medium' },
      complex: { color: 'bg-red-100 text-red-700', icon: '⭐⭐⭐', label: 'Complex' }
    }
    return badges[difficulty]
  }
  
  // 获取分类对应的emoji
  const getCategoryEmoji = (category: string) => {
    const emojis = {
      'lost-tooth': '🦷',
      'fairy-pillow': '🛏️',
      'tooth-castle': '🏰',
      'fairy-wand': '🪄',
      'tooth-collection': '💰',
      'magical': '✨'
    }
    return emojis[category as keyof typeof emojis] || '🧚‍♀️'
  }
  
  const toothFairyCategories = [
    {
      id: 'lost-tooth',
      name: 'Lost Tooth Adventures',
      description: 'Magical moments when the tooth fairy collects lost baby teeth',
      emoji: '🦷',
      color: 'bg-blue-100 text-blue-800',
      longTail: 'lost tooth fairy coloring pages'
    },
    {
      id: 'fairy-pillow',
      name: 'Fairy Pillow Magic', 
      description: 'Tooth fairy placing coins under pillows while children sleep',
      emoji: '🛏️',
      color: 'bg-purple-100 text-purple-800',
      longTail: 'tooth fairy pillow coloring pages'
    },
    {
      id: 'tooth-castle',
      name: 'Tooth Fairy Castles',
      description: 'Enchanted castles and doorways in the magical tooth fairy realm',
      emoji: '🏰',
      color: 'bg-pink-100 text-pink-800',
      longTail: 'tooth fairy castle coloring pages'
    },
    {
      id: 'magical',
      name: 'Magical Tooth Fairies',
      description: 'Flying tooth fairies with sparkly wings and magical powers',
      emoji: '✨',
      color: 'bg-yellow-100 text-yellow-800',
      longTail: 'magical tooth fairy coloring pages'
    }
  ]
  
  return (
    <div className="flex flex-col">
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      
      {/* SEO Optimized Hero Section */}
      <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
        {/* Magical floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-6 h-6 text-blue-300 animate-pulse">🦷</div>
          <div className="absolute top-32 right-20 w-5 h-5 text-purple-300 animate-bounce">🧚‍♀️</div>
          <div className="absolute bottom-40 left-32 w-4 h-4 text-pink-300 animate-ping">✨</div>
          <div className="absolute bottom-24 right-16 w-7 h-7 text-yellow-300 animate-pulse">💰</div>
          <div className="absolute top-1/2 left-1/4 w-5 h-5 text-blue-400 opacity-60 animate-bounce delay-75">🪄</div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Smile className="h-8 w-8 text-blue-500" />
                <Badge variant="outline" className="bg-white/90 text-blue-700 border-blue-200 font-semibold">
                  Premium Long-tail Collection
                </Badge>
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tooth Fairy Coloring Pages Printable
              </h1>
              
              <p className="mx-auto max-w-[900px] text-gray-700 dark:text-gray-300 md:text-xl/relaxed leading-relaxed">
                Make losing baby teeth magical with our enchanting collection of <strong>tooth fairy coloring pages printable</strong>! 
                Each <em>tooth fairy coloring page</em> features adorable tooth fairies, lost tooth adventures, fairy pillows, and magical tooth castles. 
                Perfect for kids who are losing their teeth - download and print instantly at home!
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <Badge variant="secondary">10+ Unique Designs</Badge>
                <Badge variant="secondary">Lost Tooth Adventures</Badge>
                <Badge variant="secondary">Instant Download</Badge>
                <Badge variant="secondary">Ages 4-12</Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8">
                <Link href="/library?category=fairy">
                  <Star className="mr-2 h-5 w-5" />
                  Browse Available Fairy Pages
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8">
                <Link href="/fairy">
                  <Wand2 className="mr-2 h-5 w-5" />
                  More Fairy Collections
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Long-tail Keyword Categories */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Explore Tooth Fairy Coloring Themes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Each category captures the magic of losing baby teeth with special <strong>tooth fairy coloring pages</strong> themes. 
              Find the perfect <em>printable tooth fairy designs</em> for every lost tooth milestone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {toothFairyCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{category.emoji}</span>
                    <Badge className={category.color}>
                      Magical Collection
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mb-6">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      Long-tail: "{category.longTail}"
                    </Badge>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Link href={`/tooth-fairy-coloring-pages/${category.id}`}>
                      <Smile className="mr-2 h-4 w-4" />
                      View {category.name} →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tooth Fairy Coloring Pages Grid */}
      <section className="w-full py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured Tooth Fairy Coloring Pages Printable
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Hand-selected <strong>tooth fairy printable coloring pages</strong> perfect for kids losing their baby teeth. 
              Each design features magical tooth fairies with intricate details ideal for making tooth loss a fun adventure.
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full aspect-square bg-gradient-to-br from-blue-200 to-purple-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="flex gap-1">
                        <div className="h-5 bg-gray-200 rounded w-12" />
                        <div className="h-5 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {fairyImages.length > 0 ? fairyImages.map((image, index) => {
                const slug = generateSEOSlug(image.title, image.id)
                const difficultyBadge = getDifficultyBadge(image.difficulty as 'easy' | 'medium' | 'complex')
                const categoryEmoji = getCategoryEmoji(image.category)
                
                return (
                  <Link 
                    key={`tooth-fairy-${image.id}`} 
                    href={`/${slug}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                      <CardContent className="p-0">
                        {/* 真实的tooth fairy图片 */}
                        <div className="w-full aspect-square relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                          <Image
                            src={image.thumbnail_url || image.image_url}
                            alt={`${image.title} - Free printable tooth fairy coloring page for kids | Coloreveal`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            loading={index < 4 ? "eager" : "lazy"}
                          />
                          
                          {/* 悬浮标签和装饰 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-white/90 text-xs font-semibold">
                              {categoryEmoji} {image.category}
                            </Badge>
                          </div>
                          
                          <div className="absolute top-2 right-2">
                            <Badge className={`text-xs ${difficultyBadge.color}`}>
                              {difficultyBadge.icon}
                            </Badge>
                          </div>
                          
                          {/* 点击着色提示 */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg">
                              <Palette className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-bold text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {image.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {image.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`text-xs ${difficultyBadge.color}`}>
                              {difficultyBadge.label}
                            </Badge>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Palette className="w-3 h-3 mr-1" />
                              Click to Color
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              }) : (
                // 没有数据时显示空状态
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🦷</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tooth Fairy Images Available</h3>
                  <p className="text-gray-500 mb-4">We're working on adding more magical tooth fairy coloring pages!</p>
                  <Button asChild variant="outline">
                    <Link href="/library">
                      Browse All Coloring Pages
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/library?category=fairy&subcategory=tooth-fairy">
                <Star className="mr-2 h-5 w-5" />
                View All Tooth Fairy Coloring Pages
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6">Why Choose Our Tooth Fairy Coloring Pages Printable?</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Smile className="mr-2 h-5 w-5 text-blue-500" />
                  Make Losing Teeth Fun
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every <strong>tooth fairy coloring page</strong> is designed to make losing baby teeth an exciting adventure. 
                  Turn what can be scary into a magical experience with adorable tooth fairy characters.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                  Educational & Comforting
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our <em>printable tooth fairy coloring pages</em> help children understand the tooth fairy tradition while providing 
                  comfort during the tooth-losing phase. Perfect for bedtime stories and quiet activities.
                </p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Popular Tooth Fairy Coloring Themes</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Lost Tooth Adventure Coloring Pages:</strong> Magical moments when teeth fall out</li>
              <li><strong>Fairy Pillow Magic Designs:</strong> Tooth fairy placing coins under pillows</li>
              <li><strong>Tooth Fairy Castle Art:</strong> Enchanted castles in the fairy realm</li>
              <li><strong>Magic Wand Tooth Fairies:</strong> Fairies with sparkly tooth-themed wands</li>
            </ul>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-lg mt-8">
              <h4 className="text-lg font-semibold mb-3 text-center">🦷 Coloreveal Promise 🦷</h4>
              <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
                All our <strong>tooth fairy coloring pages printable</strong> are 100% free to download and print for personal use. 
                High-resolution PDF files ensure crisp, clear lines perfect for making losing teeth a magical experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Collections & Internal Links */}
      <section className="w-full py-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              More Magical Coloring Collections
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore related themes and expand your <strong>printable coloring pages</strong> collection
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-center">
            <Link href="/fairy" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-pink-200 transition-colors">
                <span className="text-2xl">🧚‍♀️</span>
              </div>
              <span className="text-sm font-medium text-pink-600 hover:text-pink-700">All Fairy Themes</span>
            </Link>
            <Link href="/fairy-princess-coloring-pages" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">👑</span>
              </div>
              <span className="text-sm font-medium text-purple-600 hover:text-purple-700">Fairy Princess</span>
            </Link>
            <Link href="/magical-coloring-pages" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">✨</span>
              </div>
              <span className="text-sm font-medium text-blue-600 hover:text-blue-700">Magical Designs</span>
            </Link>
            <Link href="/castle-coloring-pages" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-200 transition-colors">
                <span className="text-2xl">🏰</span>
              </div>
              <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Castle Adventures</span>
            </Link>
            <Link href="/library" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                <span className="text-2xl">🎨</span>
              </div>
              <span className="text-sm font-medium text-gray-600 hover:text-gray-700">All Collections</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}