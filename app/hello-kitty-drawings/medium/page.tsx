import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { getImagesByDifficulty, getDifficultyMetadata } from "@/lib/difficulty-filter"
import { LibraryImageCard } from "@/components/library-image-card"

// 动态生成metadata
export async function generateMetadata(): Promise<Metadata> {
  const { images } = await getImagesByDifficulty('medium')
  const metaConfig = getDifficultyMetadata('medium', images.length)
  
  return {
    title: metaConfig.title,
    description: metaConfig.pageDescription,
    keywords: metaConfig.keywords,
    openGraph: {
      title: metaConfig.openGraphTitle,
      description: metaConfig.openGraphDescription,
      images: [
        {
          url: images.length > 0 ? images[0].thumbnailUrl || images[0].imageUrl : '/astronaut-cat-coloring-page.png',
          width: 1024,
          height: 1024,
          alt: 'Medium Hello Kitty Drawings for Intermediate Colorists',
        },
      ],
      type: 'website'
    },
  }
}

export default async function MediumHelloKittyDrawingsPage() {
  const { images: mediumDrawings, total, success, error } = await getImagesByDifficulty('medium')
  const metaConfig = getDifficultyMetadata('medium', mediumDrawings.length)
  
  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": metaConfig.openGraphTitle,
    "description": metaConfig.openGraphDescription,
    "url": "https://yoursite.com/hello-kitty-drawings/medium",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": mediumDrawings.length,
      "itemListElement": mediumDrawings.map((image, index) => ({
        "@type": "CreativeWork",
        "position": index + 1,
        "name": image.title,
        "description": image.description,
        "image": image.thumbnailUrl || image.imageUrl,
        "url": `https://yoursite.com/${image.id}`,
        "genre": "Medium Coloring Page",
        "difficulty": "medium",
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
          "name": "Medium",
          "item": "https://yoursite.com/hello-kitty-drawings/medium"
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
                <span className="text-white font-medium">Medium</span>
              </nav>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                Medium Hello Kitty Drawings
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90 drop-shadow-md">
                Intermediate Coloring Pages with Perfect Detail Balance
              </p>
              <p className="text-lg opacity-80 max-w-2xl mx-auto drop-shadow-sm">
                Challenge yourself with these medium difficulty hello kitty drawings! 
                Perfect balance of detail and simplicity for intermediate colorists.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  {metaConfig.icon} {mediumDrawings.length} Medium Drawings
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  ⚖️ {metaConfig.characteristics}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 backdrop-blur-sm">
                  🎯 {metaConfig.ageGroup}
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

          {/* Medium Hello Kitty Drawings网格 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Medium Hello Kitty Drawings</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                Intermediate level • {mediumDrawings.length} drawings
              </div>
            </div>
            
            {mediumDrawings.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mediumDrawings.map((image) => (
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
                  {error ? `Error loading medium drawings: ${error}` : 'No medium hello kitty drawings available yet.'}
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
          <section className="mt-16 bg-blue-50 rounded-lg p-8">
            {!success && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Currently showing demo data. Connect to database to see real medium drawings.
                </p>
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Medium Difficulty Hello Kitty Drawings?</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Our <strong>medium hello kitty drawings</strong> offer the perfect balance between simplicity and detail. 
                These intermediate-level coloring pages provide enough challenge to keep you engaged while remaining 
                enjoyable and not overwhelming. Perfect for those who have mastered easy drawings and want to progress.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Perfect for Intermediate Colorists:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Balanced detail levels keep you engaged</li>
                    <li>• Multiple small areas for color variation</li>
                    <li>• Moderate complexity builds skills</li>
                    <li>• Satisfying completion time (30-45 minutes)</li>
                    <li>• Great for developing technique</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🌟 Skill Development Benefits</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Improves fine motor control</li>
                    <li>• Enhances color planning skills</li>
                    <li>• Builds concentration endurance</li>
                    <li>• Encourages artistic choices</li>
                    <li>• Prepares for complex drawings</li>
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