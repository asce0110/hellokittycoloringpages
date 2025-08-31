import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { getImagesByDifficulty, getDifficultyMetadata } from "@/lib/difficulty-filter"
import { LibraryImageCard } from "@/components/library-image-card"

// 动态生成metadata
export async function generateMetadata(): Promise<Metadata> {
  const { images } = await getImagesByDifficulty('complex')
  const metaConfig = getDifficultyMetadata('complex', images.length)
  
  return {
    title: metaConfig.title,
    description: metaConfig.pageDescription,
    keywords: metaConfig.keywords,
    openGraph: {
      title: metaConfig.openGraphTitle,
      description: metaConfig.openGraphDescription,
      images: [
        {
          url: images.length > 0 ? images[0].thumbnailUrl || images[0].imageUrl : '/cute-kitty-coloring-page.png',
          width: 1024,
          height: 1024,
          alt: 'Complex Hello Kitty Drawings for Advanced Colorists',
        },
      ],
      type: 'website'
    },
  }
}

export default async function ComplexHelloKittyDrawingsPage() {
  const { images: complexDrawings, total, success, error } = await getImagesByDifficulty('complex')
  const metaConfig = getDifficultyMetadata('complex', complexDrawings.length)
  
  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": metaConfig.openGraphTitle,
    "description": metaConfig.openGraphDescription,
    "url": "https://yoursite.com/hello-kitty-drawings/complex",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": complexDrawings.length,
      "itemListElement": complexDrawings.map((image, index) => ({
        "@type": "CreativeWork",
        "position": index + 1,
        "name": image.title,
        "description": image.description,
        "image": image.thumbnailUrl || image.imageUrl,
        "url": `https://yoursite.com/${image.id}`,
        "genre": "Complex Coloring Page",
        "difficulty": "complex",
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
          "name": "Complex",
          "item": "https://yoursite.com/hello-kitty-drawings/complex"
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
                <span className="text-white font-medium">Complex</span>
              </nav>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                Complex Hello Kitty Drawings
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90 drop-shadow-md">
                Advanced Detailed Coloring Pages for Expert Colorists
              </p>
              <p className="text-lg opacity-80 max-w-2xl mx-auto drop-shadow-sm">
                Challenge yourself with these intricate hello kitty drawings! 
                Complex designs with detailed patterns perfect for advanced colorists and artists.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  {metaConfig.icon} {complexDrawings.length} Complex Drawings
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  🔍 {metaConfig.characteristics}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  🏆 {metaConfig.ageGroup}
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

          {/* Complex Hello Kitty Drawings网格 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Complex Hello Kitty Drawings</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                Expert level • {complexDrawings.length} drawings
              </div>
            </div>
            
            {complexDrawings.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {complexDrawings.map((image) => (
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
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {error ? 'Error Loading Complex Drawings' : 'Complex Drawings Coming Soon!'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {error 
                      ? `Unable to load complex drawings: ${error}. Currently showing demo data if available.`
                      : "We're working on intricate, detailed hello kitty drawings for advanced colorists. Check back soon for challenging designs!"
                    }
                  </p>
                  <div className="space-y-2">
                    <Button asChild>
                      <Link href="/hello-kitty-drawings/medium">
                        Try Medium Drawings
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/hello-kitty-drawings">
                        Browse All Drawings
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/library">
                        Visit Library
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SEO内容区域 */}
          <section className="mt-16 bg-purple-50 rounded-lg p-8">
            {!success && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Currently showing demo data. Connect to database to see real complex drawings.
                </p>
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Master Complex Hello Kitty Drawings</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Our <strong>complex hello kitty drawings</strong> are designed for advanced colorists who crave intricate 
                details and challenging patterns. These sophisticated coloring pages feature elaborate designs with 
                numerous small areas, decorative elements, and complex backgrounds that will test your skills and patience.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Perfect for Advanced Colorists:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Intricate patterns and detailed backgrounds</li>
                    <li>• Hundreds of small coloring areas</li>
                    <li>• Complex geometric and organic elements</li>
                    <li>• Extended coloring sessions (1-3 hours)</li>
                    <li>• Professional-level artistic challenges</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🌟 Advanced Benefits</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Master precision and control</li>
                    <li>• Develop advanced color theory</li>
                    <li>• Experience meditative focus states</li>
                    <li>• Create gallery-worthy artwork</li>
                    <li>• Ultimate stress relief and mindfulness</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">💡 Pro Tips for Complex Drawings:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Use high-quality colored pencils or fine-tip markers</li>
                  <li>• Plan your color scheme before starting</li>
                  <li>• Work in good lighting to see fine details</li>
                  <li>• Take breaks to prevent eye strain</li>
                  <li>• Consider framing your completed masterpiece!</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}