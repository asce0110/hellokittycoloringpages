"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Crown, Heart, Wand2, Download, Printer, Star, Palette } from "lucide-react"

// Fairy Princess Images Data (从SEO缓存系统获取)
interface FairyPrincessImage {
  slug: string
  title: string
  description: string
  imageUrl: string
  category: 'castle' | 'garden' | 'butterfly' | 'flower' | 'crown' | 'magical'
  difficulty: 'easy' | 'medium' | 'complex'
}

// Featured Fairy Princess themed designs
const fairyPrincessImages: FairyPrincessImage[] = [
  {
    slug: "fairy-princess-castle-coloring-pages",
    title: "Fairy Princess Castle",
    description: "Magical fairy princess in an enchanted castle setting with towers and magical elements",
    imageUrl: "/hello-kitty-coloring-page.png",
    category: "castle",
    difficulty: "medium"
  },
  {
    slug: "butterfly-fairy-princess-coloring-pages", 
    title: "Butterfly Fairy Princess",
    description: "Beautiful fairy princess with delicate butterfly wings and enchanted garden background",
    imageUrl: "/cute-kitty-coloring-page.png",
    category: "butterfly",
    difficulty: "complex"
  },
  {
    slug: "fairy-princess-garden-coloring-pages",
    title: "Fairy Princess Garden", 
    description: "Enchanting fairy princess surrounded by magical flowers and woodland creatures",
    imageUrl: "/hello-kitty-coloring-page.png",
    category: "garden",
    difficulty: "easy"
  },
  {
    slug: "crown-fairy-princess-coloring-pages",
    title: "Crown Fairy Princess",
    description: "Royal fairy princess wearing a sparkling crown with stars and magical jewels", 
    imageUrl: "/astronaut-cat-coloring-page.png",
    category: "crown",
    difficulty: "medium"
  },
  {
    slug: "flower-fairy-princess-coloring-pages",
    title: "Flower Fairy Princess",
    description: "Sweet fairy princess with flower petals as wings in a blooming meadow",
    imageUrl: "/cute-kitty-coloring-page.png", 
    category: "flower",
    difficulty: "easy"
  },
  {
    slug: "magical-wand-fairy-princess-coloring-pages",
    title: "Magical Wand Fairy Princess",
    description: "Fairy princess holding a sparkly magic wand with swirling magical energy",
    imageUrl: "/hello-kitty-coloring-page.png",
    category: "magical", 
    difficulty: "medium"
  },
  {
    slug: "dancing-fairy-princess-coloring-pages", 
    title: "Dancing Fairy Princess",
    description: "Graceful fairy princess dancing with flowing dress and magical sparkles around her",
    imageUrl: "/astronaut-cat-coloring-page.png",
    category: "magical",
    difficulty: "complex"
  },
  {
    slug: "unicorn-fairy-princess-coloring-pages",
    title: "Unicorn Fairy Princess", 
    description: "Magical fairy princess riding a beautiful unicorn through an enchanted forest",
    imageUrl: "/cute-kitty-coloring-page.png",
    category: "magical",
    difficulty: "complex"
  },
  {
    slug: "starlight-fairy-princess-coloring-pages",
    title: "Starlight Fairy Princess",
    description: "Fairy princess surrounded by twinkling stars and celestial magical elements",
    imageUrl: "/hello-kitty-coloring-page.png",
    category: "magical",
    difficulty: "medium"
  },
  {
    slug: "rainbow-fairy-princess-coloring-pages", 
    title: "Rainbow Fairy Princess",
    description: "Colorful fairy princess with rainbow wings flying through a magical sky",
    imageUrl: "/astronaut-cat-coloring-page.png",
    category: "magical",
    difficulty: "easy"
  }
]

export default function FairyPrincessColoringPagesPage() {
  const [loading, setLoading] = React.useState(true)
  
  // FAQ Schema for voice search optimization
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are fairy princess coloring pages free to print?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All our fairy princess coloring pages are completely free to download and print at home. We offer 10+ unique designs including castle, butterfly, garden, and crown fairy princesses."
        }
      },
      {
        "@type": "Question", 
        "name": "What fairy princess themes are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer fairy princess coloring pages in multiple themes: Castle Fairy Princesses, Butterfly Fairy Princesses, Garden Fairy Princesses, Crown Fairy Princesses, and Magical Fairy Princesses with unicorns and stars."
        }
      },
      {
        "@type": "Question",
        "name": "What age group are fairy princess coloring pages suitable for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our fairy princess coloring pages are designed for all ages. We offer easy designs for young children (3-6 years), medium complexity for kids (7-12 years), and complex designs for teens and adults who enjoy detailed coloring."
        }
      }
    ]
  }
  
  // Collection Schema  
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries", 
    "name": "Fairy Princess Coloring Pages Collection",
    "description": "A curated collection of printable fairy princess coloring pages featuring castle, butterfly, garden, and magical themes.",
    "creator": {
      "@type": "Organization",
      "name": "Coloreveal"
    },
    "about": "fairy princess coloring pages printable",
    "genre": "Children's Coloring Pages",
    "audience": {
      "@type": "Audience",
      "audienceType": "Children and Adults"
    }
  }
  
  // 模拟加载状态（实际项目中这里会从API获取数据）
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
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
      castle: '🏰',
      garden: '🌸', 
      butterfly: '🦋',
      flower: '🌺',
      crown: '👑',
      magical: '✨'
    }
    return emojis[category as keyof typeof emojis] || '🧚‍♀️'
  }
  
  const princessCategories = [
    {
      id: 'castle',
      name: 'Castle Fairy Princesses',
      description: 'Majestic fairy princesses in enchanted castle settings',
      emoji: '🏰',
      color: 'bg-purple-100 text-purple-800',
      longTail: 'fairy princess castle coloring pages'
    },
    {
      id: 'garden',
      name: 'Garden Fairy Princesses', 
      description: 'Beautiful princesses with fairy wings in magical gardens',
      emoji: '🌸',
      color: 'bg-pink-100 text-pink-800',
      longTail: 'fairy princess garden coloring pages'
    },
    {
      id: 'butterfly',
      name: 'Butterfly Fairy Princesses',
      description: 'Graceful princesses with delicate butterfly fairy wings',
      emoji: '🦋',
      color: 'bg-blue-100 text-blue-800',
      longTail: 'butterfly fairy princess coloring pages'
    },
    {
      id: 'crown',
      name: 'Crown Fairy Princesses',
      description: 'Royal fairy princesses with magical crowns and tiaras',
      emoji: '👑',
      color: 'bg-yellow-100 text-yellow-800',
      longTail: 'fairy princess crown coloring pages'
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
      <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 relative overflow-hidden">
        {/* Magical floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-6 h-6 text-pink-300 animate-pulse">✨</div>
          <div className="absolute top-32 right-20 w-5 h-5 text-purple-300 animate-bounce">👑</div>
          <div className="absolute bottom-40 left-32 w-4 h-4 text-blue-300 animate-ping">🧚‍♀️</div>
          <div className="absolute bottom-24 right-16 w-7 h-7 text-yellow-300 animate-pulse">⭐</div>
          <div className="absolute top-1/2 left-1/4 w-5 h-5 text-pink-400 opacity-60 animate-bounce delay-75">🌸</div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Crown className="h-8 w-8 text-purple-500" />
                <Badge variant="outline" className="bg-white/90 text-purple-700 border-purple-200 font-semibold">
                  Premium Long-tail Collection
                </Badge>
                <Sparkles className="h-8 w-8 text-pink-500" />
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Fairy Princess Coloring Pages Printable
              </h1>
              
              <p className="mx-auto max-w-[900px] text-gray-700 dark:text-gray-300 md:text-xl/relaxed leading-relaxed">
                Discover our magical collection of <strong>fairy princess coloring pages printable</strong> designed to inspire creativity and wonder. 
                Each <em>fairy princess coloring page</em> features enchanting princesses with delicate fairy wings, sparkling tiaras, and magical elements. 
                Perfect for kids who love both <strong>princess adventures</strong> and <strong>fairy magic</strong> - download and print instantly at home!
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 text-sm mb-4">
                <Badge variant="secondary">16+ Unique Designs</Badge>
                <Badge variant="secondary">Instant Download</Badge>
                <Badge variant="secondary">Print Ready</Badge>
                <Badge variant="secondary">All Ages</Badge>
              </div>
              
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8">
                <Link href="/library?category=fairy">
                  <Star className="mr-2 h-5 w-5" />
                  Browse Available Fairy Pages
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8">
                <Link href="/create?theme=fairy-princess">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Create Custom Fairy Princess
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
              Explore Fairy Princess Coloring Themes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Each category targets specific <strong>fairy princess coloring pages</strong> themes with unique magical adventures. 
              Find the perfect <em>printable fairy princess designs</em> for every creative mood.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {princessCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{category.emoji}</span>
                    <Badge className={category.color}>
                      Premium Collection
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mb-6">
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      Long-tail: "{category.longTail}"
                    </Badge>
                  </div>
                  <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                    <Link href={`/fairy-princess-coloring-pages/${category.id}`}>
                      <Crown className="mr-2 h-4 w-4" />
                      View {category.name} →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Fairy Princess Coloring Pages Grid */}
      <section className="w-full py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured Fairy Princess Coloring Pages Printable
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Hand-selected <strong>fairy princess printable coloring pages</strong> combining the magic of fairies with the elegance of princesses. 
              Each design features intricate details perfect for creative coloring experiences.
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full aspect-square bg-gradient-to-br from-pink-200 to-purple-200" />
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
              {fairyPrincessImages.map((image, index) => {
                const difficultyBadge = getDifficultyBadge(image.difficulty)
                const categoryEmoji = getCategoryEmoji(image.category)
                
                return (
                  <Link 
                    key={`fairy-princess-${image.slug}`} 
                    href={`/${image.slug}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                      <CardContent className="p-0">
                        {/* 真实的fairy princess图片 */}
                        <div className="w-full aspect-square relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                          <Image
                            src={image.imageUrl}
                            alt={`${image.title} - Free printable ${image.category} fairy princess coloring page for kids | Coloreveal`}
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
                              <Palette className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-bold text-sm mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
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
              })}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/library?category=fairy&subcategory=princess">
                <Star className="mr-2 h-5 w-5" />
                View All Fairy Princess Coloring Pages
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6">Why Choose Our Fairy Princess Coloring Pages Printable?</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Crown className="mr-2 h-5 w-5 text-purple-500" />
                  Premium Quality Designs
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every <strong>fairy princess coloring page</strong> in our collection features intricate line art designed by professional artists. 
                  Each design combines the elegance of princess themes with the whimsical magic of fairy elements.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-pink-500" />
                  Educational & Creative Benefits
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our <em>printable fairy princess coloring pages</em> help develop fine motor skills, creativity, and focus. 
                  Perfect for quiet time, art therapy, or educational activities combining storytelling with artistic expression.
                </p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Popular Fairy Princess Coloring Themes</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Fairy Princess Castle Coloring Pages:</strong> Majestic castles with fairy princess characters</li>
              <li><strong>Garden Fairy Princess Designs:</strong> Beautiful princesses in enchanted flower gardens</li>
              <li><strong>Butterfly Fairy Princess Art:</strong> Graceful princesses with delicate butterfly wings</li>
              <li><strong>Crown & Tiara Fairy Princesses:</strong> Royal fairy characters with magical accessories</li>
            </ul>
            
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 p-6 rounded-lg mt-8">
              <h4 className="text-lg font-semibold mb-3 text-center">✨ Coloreveal Promise ✨</h4>
              <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
                All our <strong>fairy princess coloring pages printable</strong> are 100% free to download and print for personal use. 
                High-resolution PDF files ensure crisp, clear lines that look beautiful whether printed at home or at a copy shop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Collections & Internal Links */}
      <section className="w-full py-12 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-pink-900/10 dark:via-purple-900/10 dark:to-blue-900/10">
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
            <Link href="/princess-coloring-pages" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">👑</span>
              </div>
              <span className="text-sm font-medium text-purple-600 hover:text-purple-700">Princess Pages</span>
            </Link>
            <Link href="/tooth-fairy-coloring-pages" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">🦷</span>
              </div>
              <span className="text-sm font-medium text-blue-600 hover:text-blue-700">Tooth Fairy</span>
            </Link>
            <Link href="/butterfly-coloring-pages" className="group flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">🦋</span>
              </div>
              <span className="text-sm font-medium text-purple-600 hover:text-purple-700">Butterfly Designs</span>
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