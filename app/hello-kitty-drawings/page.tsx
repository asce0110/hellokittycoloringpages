import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Search, Filter, ArrowRight, Users, Download, Palette } from "lucide-react"
import { 
  getAllHelloKittyImages,
  getFeaturedHelloKittyImages,
  getDifficultyStats
} from "@/lib/difficulty-filter"
import { LibraryImageCard } from "@/components/library-image-card"

// 动态生成SEO优化的metadata
export async function generateMetadata(): Promise<Metadata> {
  const { totalCount } = await getAllHelloKittyImages()
  
  return {
    title: `Hello Kitty Drawings - ${totalCount} Free Printable Coloring Pages | AI Kitty Creator`,
    description: `Discover ${totalCount} beautiful hello kitty drawings for free! Download and print adorable Hello Kitty coloring pages. Perfect for kids and Hello Kitty fans of all ages.`,
    keywords: 'hello kitty drawings, free hello kitty coloring pages, printable hello kitty, hello kitty coloring sheets, kids coloring pages',
    openGraph: {
      title: 'Hello Kitty Drawings - Free Printable Coloring Pages',
      description: `Discover ${totalCount} beautiful hello kitty drawings for free! Perfect for kids and Hello Kitty fans.`,
      images: [
        {
          url: '/hello-kitty-coloring-page.png',
          width: 1024,
          height: 1024,
          alt: 'Hello Kitty Drawings Collection',
        },
      ],
      type: 'website',
      siteName: 'AI Kitty Creator - Hello Kitty Drawings'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hello Kitty Drawings - Free Printable Coloring Pages',
      description: `Discover ${totalCount} beautiful hello kitty drawings for free! Perfect for kids and Hello Kitty fans.`,
      images: ['/hello-kitty-coloring-page.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  }
}

export default async function HelloKittyDrawingsPage() {
  // 获取真实数据库数据
  const { images: allImages, totalCount, difficultyStats, success, error } = await getAllHelloKittyImages()
  const { images: featuredImages, success: featuredSuccess } = await getFeaturedHelloKittyImages()
  
  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Hello Kitty Drawings - Free Printable Coloring Pages",
    "description": `Collection of ${totalCount} beautiful hello kitty drawings for free download and printing`,
    "url": "https://yoursite.com/hello-kitty-drawings",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalCount,
      "itemListElement": allImages.slice(0, 20).map((image, index) => ({
        "@type": "CreativeWork",
        "position": index + 1,
        "name": image.title,
        "description": image.description,
        "image": image.thumbnailUrl || image.imageUrl,
        "url": `https://yoursite.com/${image.id}`,
        "genre": "Coloring Page",
        "difficulty": image.difficulty,
        "isAccessibleForFree": true,
        "audience": {
          "@type": "Audience",
          "audienceType": "Children"
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://yoursite.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Hello Kitty Drawings",
          "item": "https://yoursite.com/hello-kitty-drawings"
        }
      ]
    }
  }

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
        {/* 顶部Hero区域 - 升级设计 */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white py-20 relative overflow-hidden">
          {/* 背景装饰元素 */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/30" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="mb-6">
              <nav className="flex items-center justify-center space-x-2 text-sm text-pink-100">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <span className="text-white font-medium">Hello Kitty Drawings</span>
              </nav>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Hello Kitty Drawings
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90 drop-shadow-md">
              {totalCount} Free Printable Coloring Pages for Kids & Hello Kitty Fans
            </p>
            <p className="text-lg opacity-80 max-w-3xl mx-auto drop-shadow-sm mb-8">
              Discover our amazing collection of beautiful hello kitty drawings! Download, print, or color online. 
              Perfect for kids, educators, and Hello Kitty enthusiasts of all ages. All drawings are completely free!
            </p>
            
            {/* 统计徽章 */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                🎨 {totalCount} Free Drawings
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                🌟 Easy: {difficultyStats.easy}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                🎯 Medium: {difficultyStats.medium}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                🏆 Complex: {difficultyStats.complex}
              </Badge>
              {!success && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-white border-yellow-300 text-sm px-4 py-2 backdrop-blur-sm">
                  ⚠️ Demo Data Mode
                </Badge>
              )}
            </div>
            
            {/* 行动按钮 */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
                <Link href="#browse-all">
                  <Palette className="mr-2 h-4 w-4" />
                  Browse All Drawings
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white bg-white/10 text-white hover:bg-white hover:text-pink-600 hover:border-pink-200 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl">
                <Link href="/library">
                  <Download className="mr-2 h-4 w-4" />
                  Visit Full Library
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* 难度级别快速导航 */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Difficulty Level</h2>
              <p className="text-lg text-gray-600">Choose the perfect difficulty level for your coloring adventure</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/hello-kitty-drawings/easy" className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-green-200 group-hover:border-green-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                      <span className="text-2xl">🌟</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Easy</h3>
                    <p className="text-gray-600 mb-4">Perfect for beginners and young children</p>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white mb-4">
                      {difficultyStats.easy} drawings
                    </Badge>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      Ages 3-7
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/hello-kitty-drawings/medium" className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-blue-200 group-hover:border-blue-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Medium</h3>
                    <p className="text-gray-600 mb-4">Great for building coloring skills</p>
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white mb-4">
                      {difficultyStats.medium} drawings
                    </Badge>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      Ages 7-12
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/hello-kitty-drawings/complex" className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-purple-200 group-hover:border-purple-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 group-hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Complex</h3>
                    <p className="text-gray-600 mb-4">Challenging designs for advanced colorists</p>
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white mb-4">
                      {difficultyStats.complex} drawings
                    </Badge>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      Adults & Experts
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* 特色Hello Kitty Drawings */}
          {featuredImages.length > 0 && (
            <section className="mb-16">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-3xl font-bold text-gray-900">Featured Hello Kitty Drawings</h2>
                </div>
                <p className="text-lg text-gray-600">Our most popular and beloved coloring pages</p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredImages.map((image) => (
                  <LibraryImageCard 
                    key={image.id} 
                    image={image} 
                    showDifficulty={true}
                    showCategory={true}
                  />
                ))}
              </div>
              
              {!featuredSuccess && (
                <div className="text-center mt-6">
                  <p className="text-yellow-600 bg-yellow-50 rounded-lg p-4 inline-block">
                    ⚠️ Featured images currently using demo data
                  </p>
                </div>
              )}
            </section>
          )}

          {/* 所有Hello Kitty Drawings */}
          <section id="browse-all" className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">All Hello Kitty Drawings</h2>
              <div className="flex items-center justify-center gap-2 text-lg text-gray-600 mb-4">
                <Filter className="h-5 w-5" />
                {totalCount} drawings available for you to enjoy
              </div>
              {!success && error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Currently showing demo data. {error}
                  </p>
                </div>
              )}
            </div>
            
            {allImages.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allImages.map((image) => (
                  <LibraryImageCard 
                    key={image.id} 
                    image={image} 
                    showDifficulty={true}
                    showCategory={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">😔</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Drawings Found</h3>
                  <p className="text-gray-600 mb-6">
                    {error ? `Error loading drawings: ${error}` : 'No hello kitty drawings are available right now.'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild variant="outline" className="border-kitty-pink text-kitty-pink hover:bg-kitty-pink hover:text-white transition-all duration-300">
                      <Link href="/library">
                        Visit Main Library
                      </Link>
                    </Button>
                    <Button asChild className="bg-kitty-pink hover:bg-kitty-pink-dark text-white">
                      <Link href="/create">
                        Create Custom Drawing
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 快速行动区域 */}
          <section className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Coloring?</h3>
            <p className="text-gray-600 mb-6">Explore our full collection or create your own custom Hello Kitty drawing</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-kitty-pink hover:bg-kitty-pink-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link href="/library">
                  <Palette className="mr-2 h-4 w-4" />
                  Browse Full Library
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/create">
                  <Star className="mr-2 h-4 w-4" />
                  Create Custom Drawing
                </Link>
              </Button>
            </div>
          </section>

          {/* SEO内容区域 */}
          <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
            {!success && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Currently displaying demo data. Connect to database to access the full collection of hello kitty drawings.
                </p>
              </div>
            )}
            
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">About Our Hello Kitty Drawings Collection</h3>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
                Welcome to our amazing collection of <strong>{totalCount} hello kitty drawings</strong>! We offer the most comprehensive 
                library of free printable coloring pages featuring everyone's favorite feline character. Whether you're a parent 
                looking for fun activities, a teacher planning classroom projects, or simply a Hello Kitty enthusiast, 
                our collection has been carefully curated to provide hours of creative enjoyment.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3">Why Choose Our Collection?</h4>
                  <ul className="text-sm text-gray-700 space-y-2 text-left">
                    <li>• {totalCount} high-quality, printable designs</li>
                    <li>• {Object.values(difficultyStats).length} difficulty levels for all ages</li>
                    <li>• Interactive online coloring tool</li>
                    <li>• Completely free to download and use</li>
                    <li>• New drawings added regularly</li>
                    <li>• Optimized for home and classroom printing</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3">Educational Benefits</h4>
                  <ul className="text-sm text-gray-700 space-y-2 text-left">
                    <li>• Improves fine motor skills and coordination</li>
                    <li>• Enhances creativity and artistic expression</li>
                    <li>• Develops color recognition and theory</li>
                    <li>• Provides stress relief and mindfulness</li>
                    <li>• Encourages focus and concentration</li>
                    <li>• Builds patience and attention to detail</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3">Perfect For Everyone</h4>
                  <ul className="text-sm text-gray-700 space-y-2 text-left">
                    <li>• Ages 3+ with easy difficulty options</li>
                    <li>• Parents seeking quality family activities</li>
                    <li>• Teachers and educational settings</li>
                    <li>• Hello Kitty fans of all ages</li>
                    <li>• Art therapy and stress relief</li>
                    <li>• Birthday parties and special events</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 italic">
                  "Every hello kitty drawing in our collection is designed with love and attention to detail, 
                  ensuring a delightful coloring experience that sparks creativity and brings joy to colorists of all ages."
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}