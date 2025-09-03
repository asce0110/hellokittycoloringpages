// 简化的智能路由处理器
import { ColoringPageData } from './coloring-data'

/**
 * 简化的路由解析器 - 专注于解决Cold Start问题
 */
export async function resolveSimpleRoute(slug: string): Promise<ColoringPageData | null> {
  console.log(`🎯 简化路由解析: ${slug}`)

  try {
    // 首先尝试SEO缓存
    const { getSeoUrlMapping } = await import('./seo-url-storage')
    const seoData = await getSeoUrlMapping(slug)
    
    if (seoData) {
      console.log('✅ SEO缓存命中:', seoData.title)
      
      return {
        id: seoData.libraryImageId || slug,
        slug: slug,
        title: seoData.title,
        description: seoData.description,
        imageUrl: seoData.imageUrl,
        thumbnailUrl: seoData.imageUrl,
        printUrl: seoData.imageUrl,
        category: 'Custom',
        tags: seoData.title.toLowerCase().split(' ').filter(word => word.length > 2),
        difficulty: 'medium',
        featured: false,
        createdAt: new Date(),
        metaTitle: `${seoData.title} - Coloring Pages Printable`,
        metaDescription: seoData.description,
        libraryImageId: seoData.libraryImageId
      }
    }

    // 如果SEO缓存没有，尝试从slug重建内容
    const reconstructed = reconstructFromSlug(slug)
    if (reconstructed) {
      console.log('✅ 从slug重建成功:', reconstructed.title)
      
      // 创建SEO映射供后续使用
      const { storeSeoUrlMapping } = await import('./seo-url-storage')
      await storeSeoUrlMapping(slug, {
        imageUrl: reconstructed.imageUrl,
        title: reconstructed.title,
        description: reconstructed.description,
        libraryImageId: reconstructed.id,
        timestamp: Date.now()
      })
      
      return reconstructed
    }

  } catch (error) {
    console.warn('⚠️ 简化路由解析失败:', error)
  }

  return null
}

/**
 * 从slug重建着色页面数据
 */
function reconstructFromSlug(slug: string): ColoringPageData | null {
  // 移除后缀并提取关键词
  const cleanSlug = slug
    .replace(/-coloring-pages?$/, '')
    .replace(/-coloring$/, '')
  
  if (!cleanSlug || cleanSlug.length < 3) {
    return null
  }

  // 重建标题
  const keywords = cleanSlug.split('-')
  const title = keywords
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // 选择合适的图片
  const imageUrl = selectImageForKeywords(keywords)

  return {
    id: `reconstructed-${Date.now()}`,
    slug: slug,
    title: title,
    description: `Color the beautiful ${title.toLowerCase()} design`,
    imageUrl: imageUrl,
    thumbnailUrl: imageUrl,
    printUrl: imageUrl,
    category: 'Creative',
    tags: keywords,
    difficulty: 'medium',
    featured: false,
    createdAt: new Date(),
    metaTitle: `${title} - Coloring Pages Printable`,
    metaDescription: `Color the beautiful ${title.toLowerCase()} design! Free printable coloring page.`
  }
}

/**
 * 根据关键词选择合适的图片
 */
function selectImageForKeywords(keywords: string[]): string {
  // 简单的关键词匹配
  for (const keyword of keywords) {
    switch (keyword.toLowerCase()) {
      case 'space':
      case 'astronaut':
      case 'rocket':
        return '/astronaut-cat-coloring-page.png'
      case 'garden':
      case 'flower':
      case 'nature':
        return '/cute-kitty-coloring-page.png'
      default:
        continue
    }
  }

  // 默认图片
  return '/hello-kitty-coloring-page.png'
}

