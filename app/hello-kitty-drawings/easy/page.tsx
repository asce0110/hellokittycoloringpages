import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { getImagesByDifficulty, getDifficultyMetadata } from "@/lib/difficulty-filter"
import { LibraryImageCard } from "@/components/library-image-card"

// 动态生成metadata
export async function generateMetadata(): Promise<Metadata> {
  const { images } = await getImagesByDifficulty('easy')
  const metaConfig = getDifficultyMetadata('easy', images.length)
  
  return {
    title: metaConfig.title,
    description: metaConfig.pageDescription,
    keywords: metaConfig.keywords,
    openGraph: {
      title: metaConfig.openGraphTitle,
      description: metaConfig.openGraphDescription,
      images: [
        {
          url: images.length > 0 ? images[0].thumbnailUrl || images[0].imageUrl : '/hello-kitty-coloring-page.png',
          width: 1024,
          height: 1024,
          alt: 'Easy Hello Kitty Drawings for Beginners',
        },
      ],
      type: 'website'
    },
  }
}

export default async function EasyHelloKittyDrawingsPage() {
  const { images: easyDrawings, total, success, error } = await getImagesByDifficulty('easy')
  const metaConfig = getDifficultyMetadata('easy', easyDrawings.length)
  
  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": metaConfig.openGraphTitle,
    "description": metaConfig.openGraphDescription,
    "url": "https://yoursite.com/hello-kitty-drawings/easy",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": easyDrawings.length,
      "itemListElement": easyDrawings.map((image, index) => ({
        "@type": "CreativeWork",
        "position": index + 1,
        "name": image.title,
        "description": image.description,
        "image": image.thumbnailUrl || image.imageUrl,
        "url": `https://yoursite.com/${image.id}`,
        "genre": "Easy Coloring Page",
        "difficulty": "easy",
        "isAccessibleForFree": true,
        "audience": {
          "@type": "Audience",
          "audienceType": metaConfig.audience
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
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Easy",
          "item": "https://yoursite.com/hello-kitty-drawings/easy"
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
      
      <div className={`min-h-screen bg-gradient-to-br ${metaConfig.bgColor}`}>
        {/* Hero区域 - 参考首页设计增加视觉层次 */}
        <div className={`bg-gradient-to-r ${metaConfig.heroColor} text-white py-16 relative overflow-hidden`}>
          {/* 背景层增强 */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/30" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* 面包屑导航 */}
            <div className="mb-6">
              <nav className={`flex items-center space-x-2 text-sm ${metaConfig.breadcrumbColor || 'text-white/70'}`}>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/hello-kitty-drawings" className="hover:text-white transition-colors">Hello Kitty Drawings</Link>
                <span>/</span>
                <span className="text-white font-medium">Easy</span>
              </nav>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                Easy Hello Kitty Drawings
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90 drop-shadow-md">
                Simple Coloring Pages Perfect for Beginners
              </p>
              <p className="text-lg opacity-80 max-w-2xl mx-auto drop-shadow-sm">
                Start your coloring journey with these easy hello kitty drawings! 
                Perfect for young children and beginners with large areas and simple details.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  {metaConfig.icon} {easyDrawings.length} Easy Drawings
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  👶 {metaConfig.characteristics}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  📏 {metaConfig.ageGroup}
                </Badge>
                {!success && error && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-white border-yellow-300 text-sm px-4 py-2 backdrop-blur-sm">
                    ⚠️ Using Demo Data
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Button asChild variant="outline">
              <Link href="/hello-kitty-drawings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Hello Kitty Drawings
              </Link>
            </Button>
          </div>

          {/* Easy Hello Kitty Drawings网格 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Easy Hello Kitty Drawings</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                Perfect for beginners • {easyDrawings.length} drawings
              </div>
            </div>
            
            {easyDrawings.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {easyDrawings.map((image) => (
                  <LibraryImageCard 
                    key={image.id} 
                    image={image} 
                    showDifficulty={false}
                    showCategory={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-4">
                  {error ? `Error loading easy drawings: ${error}` : 'No easy hello kitty drawings available yet.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/hello-kitty-drawings">
                      Browse All Drawings
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/library">
                      Visit Library
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* SEO内容区域 */}
          <section className="mt-16 bg-green-50 rounded-lg p-8">
            {!success && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Currently showing demo data. Connect to database to see real easy drawings.
                </p>
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Easy Hello Kitty Drawings?</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Our <strong>easy hello kitty drawings</strong> are specially designed for beginners, young children, 
                and anyone new to coloring. These simple coloring pages feature larger areas to color, fewer small 
                details, and clear, bold outlines that make coloring enjoyable and stress-free.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Perfect for Beginners Because:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Large coloring areas reduce frustration</li>
                    <li>• Simple designs build confidence</li>
                    <li>• Clear outlines are easy to follow</li>
                    <li>• Quick to complete for instant satisfaction</li>
                    <li>• Age-appropriate for young children</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🌟 Educational Benefits</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Develops basic motor skills</li>
                    <li>• Introduces color recognition</li>
                    <li>• Builds patience and focus</li>
                    <li>• Encourages creativity</li>
                    <li>• Provides calming activity</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}