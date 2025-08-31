// 受欢迎度排名系统
// 综合多个指标计算图片的受欢迎程度

import { LibraryImage, GenerationHistory } from './types'
import { demoLibraryImages, demoGenerations } from './demo-data'
import { getAllSeoMappings } from './seo-url-storage'

export interface PopularityScore {
  id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl?: string
  slug?: string
  category: string
  difficulty: 'easy' | 'medium' | 'complex'
  tags: string[]
  score: number
  downloadCount: number
  favoriteCount: number
  viewCount?: number
  recentActivity: boolean
  createdAt: Date
  // 详细指标
  metrics: {
    downloads: number
    favorites: number 
    views: number
    recency: number
    featured: number
  }
}

/**
 * 根据图片信息查找对应的SEO缓存slug
 */
function findMatchingSeoSlug(image: LibraryImage): string | null {
  try {
    const allMappings = getAllSeoMappings()
    console.log(`🔍 搜索SEO slug，库图片: "${image.title}", 缓存数量: ${allMappings.length}`)
    
    // 先尝试按标题完全匹配
    const titleMatch = allMappings.find(mapping => 
      mapping.data.title.toLowerCase().trim() === image.title.toLowerCase().trim()
    )
    
    if (titleMatch) {
      console.log(`✅ 找到标题匹配的SEO slug: ${titleMatch.slug}`)
      return titleMatch.slug
    }
    
    // 再尝试按图片URL匹配
    const urlMatch = allMappings.find(mapping => 
      mapping.data.imageUrl === image.imageUrl
    )
    
    if (urlMatch) {
      console.log(`✅ 找到图片URL匹配的SEO slug: ${urlMatch.slug}`)
      return urlMatch.slug
    }
    
    // 最后尝试部分标题匹配
    const partialMatch = allMappings.find(mapping => {
      const mappingTitle = mapping.data.title.toLowerCase().trim()
      const imageTitle = image.title.toLowerCase().trim()
      return mappingTitle.includes(imageTitle) || imageTitle.includes(mappingTitle)
    })
    
    if (partialMatch) {
      console.log(`✅ 找到部分匹配的SEO slug: ${partialMatch.slug}`)
      return partialMatch.slug
    }
    
    console.log(`❌ 未找到匹配的SEO slug，图片: "${image.title}"`)
    return null
    
  } catch (error) {
    console.error('❌ 查找SEO slug时出错:', error)
    return null
  }
}

/**
 * 基于字符串生成稳定的伪随机数（0-1之间）
 * 使用简单的哈希算法确保相同输入始终产生相同输出
 */
function stableRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转为32位整数
  }
  // 转换为0-1之间的数字
  return Math.abs(hash % 10000) / 10000
}

/**
 * 基于图片ID生成稳定的浏览量倍数（8-20倍）
 */
function getStableViewMultiplier(imageId: string): number {
  const randomValue = stableRandom(imageId + '_view_multiplier')
  return 8 + randomValue * 12 // 8到20之间的稳定倍数
}

/**
 * 计算单个图片的受欢迎度分数
 */
function calculatePopularityScore(image: LibraryImage, generationData: GenerationHistory[] = []): PopularityScore {
  // 基础权重配置
  const WEIGHTS = {
    downloads: 1.0,    // 下载数权重最高
    favorites: 0.8,    // 收藏数权重较高
    views: 0.3,        // 浏览数权重较低
    recency: 0.5,      // 时间新鲜度权重
    featured: 0.4      // 特色标记权重
  }
  
  // 🎯 修复：处理真实数据库数据，提供默认值
  const downloadCount = image.downloadCount ?? 0
  
  console.log(`📊 图片 "${image.title}" 下载统计:`, {
    originalDownloadCount: image.downloadCount,
    finalDownloadCount: downloadCount,
    hasDownloadCount: image.downloadCount !== undefined
  })
  
  // 计算各个指标分数（标准化到0-100）
  const downloadScore = Math.min(100, (downloadCount / 200) * 100) // 200下载 = 100分
  
  // 🎯 修复：处理真实数据库环境下的收藏数统计
  let favoriteCount = 0
  
  try {
    // 在浏览器环境中，尝试通过API获取收藏数
    if (typeof window !== 'undefined') {
      // 使用正确的localStorage键名获取收藏数据
      const storedFavorites = localStorage.getItem('ai-kitty-favorites-cache')
      if (storedFavorites) {
        const userFavorites = JSON.parse(storedFavorites)
        favoriteCount = userFavorites.filter((fav: any) => 
          fav.libraryImageId === image.id
        ).length
        
        console.log(`📊 图片 "${image.title}" (${image.id}) 浏览器收藏统计:`, {
          totalStoredFavorites: userFavorites.length,
          matchingFavorites: favoriteCount,
          matchingIds: userFavorites.filter((fav: any) => fav.libraryImageId === image.id).map((f: any) => f.id)
        })
      } else {
        // 如果没有localStorage数据，使用默认模拟数据
        const demoData = require('./demo-data')
        const demoUserFavorites = demoData.demoUserFavorites || []
        
        favoriteCount = demoUserFavorites.filter((fav: any) => 
          fav.libraryImageId === image.id
        ).length
        
        console.log(`📊 图片 "${image.title}" (${image.id}) Demo收藏统计:`, {
          totalDemoFavorites: demoUserFavorites.length,
          matchingFavorites: favoriteCount,
          matchingIds: demoUserFavorites.filter((fav: any) => fav.libraryImageId === image.id).map((f: any) => f.id)
        })
      }
    } else {
      // 服务器端环境，使用模拟数据
      const demoData = require('./demo-data')
      const demoUserFavorites = demoData.demoUserFavorites || []
      favoriteCount = demoUserFavorites.filter((fav: any) => 
        fav.libraryImageId === image.id
      ).length
      
      console.log(`📊 图片 "${image.title}" (${image.id}) 服务器收藏统计:`, {
        totalFavorites: demoUserFavorites.length,
        matchingFavorites: favoriteCount
      })
    }
  } catch (error) {
    console.warn(`❌ 无法获取图片 ${image.id} 的收藏数据，使用默认值0:`, error)
    favoriteCount = 0
  }
  const favoriteScore = Math.min(100, (favoriteCount / 20) * 100) // 20收藏 = 100分
  
  // 🎯 使用真实浏览量数据（优先使用localStorage缓存，避免"随机"数字）
  let realViewCount = 0
  
  // 1. 首先尝试从localStorage获取真实浏览量
  if (typeof window !== 'undefined') {
    try {
      const viewsKey = 'image_views_cache'
      const storedViews = localStorage.getItem(viewsKey)
      if (storedViews) {
        const views = JSON.parse(storedViews)
        const cachedViewCount = views[image.id]?.count || 0
        
        if (cachedViewCount > 0) {
          realViewCount = cachedViewCount
          console.log(`📱 使用localStorage真实浏览量: 图片 "${image.title}" 浏览 ${cachedViewCount} 次`)
        }
      }
    } catch (error) {
      console.warn('读取localStorage浏览量失败:', error)
    }
  }
  
  // 2. 如果localStorage没有，尝试数据库数据
  if (realViewCount === 0 && image.viewCount) {
    realViewCount = image.viewCount
    console.log(`📊 使用数据库浏览量: 图片 "${image.title}" 浏览 ${realViewCount} 次`)
  }
  
  // 3. 如果都没有，设为0（新图片）
  if (realViewCount === 0) {
    console.log(`📊 图片 "${image.title}" 暂无浏览记录，浏览量为0`)
  }
  
  const viewCount = realViewCount
  const viewScore = Math.min(100, (viewCount / 1000) * 100) // 1000浏览 = 100分
  
  // 时间新鲜度分数（越新分数越高）
  const daysSinceCreated = (Date.now() - new Date(image.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  const recencyScore = Math.max(0, 100 - (daysSinceCreated / 365) * 100) // 一年内满分递减
  
  // 特色标记分数
  const featuredScore = image.isFeatured ? 100 : 0
  
  // 计算加权总分
  const totalScore = 
    downloadScore * WEIGHTS.downloads +
    favoriteScore * WEIGHTS.favorites +
    viewScore * WEIGHTS.views +
    recencyScore * WEIGHTS.recency +
    featuredScore * WEIGHTS.featured
  
  // 标准化到0-100分
  const finalScore = totalScore / (
    WEIGHTS.downloads + WEIGHTS.favorites + WEIGHTS.views + WEIGHTS.recency + WEIGHTS.featured
  )
  
  // 获取真实的SEO slug
  const realSlug = findMatchingSeoSlug(image)
  // 🎯 修复：确保slug格式统一，与library页面保持一致
  const cleanTitle = image.title.toLowerCase()
    .replace(/^hello\s+kitty\s+/i, '') // 移除Hello Kitty前缀避免重复
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const slug = realSlug || `${cleanTitle}-coloring-pages`
  
  // 如果没有找到真实slug，记录警告
  if (!realSlug) {
    console.log(`⚠️ 图片 "${image.title}" 未找到SEO缓存，使用生成的slug: ${slug}`)
  }

  return {
    id: image.id,
    title: image.title,
    description: image.description || '',
    imageUrl: image.imageUrl,
    thumbnailUrl: image.thumbnailUrl,
    slug: slug,
    category: image.category,
    difficulty: image.difficulty,
    tags: image.tags,
    score: Math.round(finalScore),
    downloadCount: downloadCount,
    favoriteCount: favoriteCount,
    viewCount: viewCount,  // 使用真实浏览量，不再取整估算值
    recentActivity: daysSinceCreated < 30, // 30天内算新活跃
    createdAt: new Date(image.createdAt),
    metrics: {
      downloads: Math.round(downloadScore),
      favorites: Math.round(favoriteScore),
      views: Math.round(viewScore),
      recency: Math.round(recencyScore),
      featured: Math.round(featuredScore)
    }
  }
}

/**
 * 获取真实图库数据
 */
async function getLibraryImagesFromAPI(): Promise<LibraryImage[]> {
  try {
    // 如果在服务器环境中，直接使用数据库
    if (typeof window === 'undefined') {
      const { getLibraryImages } = await import('./database')
      const result = await getLibraryImages({ limit: 50 })
      return result.data || []
    }
    
    // 在浏览器环境中，通过API获取数据
    const response = await fetch('/api/library-images?limit=50')
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('❌ 无法获取真实图库数据，使用demo数据:', error)
    return demoLibraryImages
  }
}

/**
 * 获取热门图片列表 - 使用真实数据
 */
export async function getPopularColoringPages(count: number = 10): Promise<PopularityScore[]> {
  try {
    console.log(`🔍 获取热门图库数据 (需要: ${count}张)`)    
    
    // 获取真实的图库数据
    const availableImages = await getLibraryImagesFromAPI()
    
    console.log(`📊 找到 ${availableImages.length} 张图库图片`)    
    
    if (availableImages.length === 0) {
      console.log('⚠️ 没有找到图库图片，返回空结果')
      return []
    }
    
    // 过滤掉非活跃图片
    const activeImages = availableImages.filter(img => img.isActive)
    
    console.log(`✅ ${activeImages.length} 张活跃图片可用`)    
    
    // 计算每个图片的受欢迎度分数
    const scoredImages = activeImages.map(image => 
      calculatePopularityScore(image, demoGenerations)
    )
    
    // 按分数排序并返回指定数量
    const result = scoredImages
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      
    console.log(`🏆 返回前 ${result.length} 张热门图片`)    
    return result
    
  } catch (error) {
    console.error('❌ 获取热门图片失败:', error)
    return []
  }
}

/**
 * 获取分类热门图片
 */
export async function getPopularColoringPagesByCategory(
  category: string, 
  count: number = 5
): Promise<PopularityScore[]> {
  const popularPages = await getPopularColoringPages(50) // 获取更多数据用于过滤
  return popularPages
    .filter(page => page.category.toLowerCase() === category.toLowerCase())
    .slice(0, count)
}

/**
 * 获取难度级别热门图片
 */
export async function getPopularColoringPagesByDifficulty(
  difficulty: 'easy' | 'medium' | 'complex', 
  count: number = 5
): Promise<PopularityScore[]> {
  const popularPages = await getPopularColoringPages(50)
  return popularPages
    .filter(page => page.difficulty === difficulty)
    .slice(0, count)
}

/**
 * 获取最近热门图片（30天内的热门内容）
 */
export async function getRecentlyPopularColoringPages(count: number = 10): Promise<PopularityScore[]> {
  const popularPages = await getPopularColoringPages(50)
  return popularPages
    .filter(page => page.recentActivity)
    .slice(0, count)
}

/**
 * 根据标签获取相关热门图片
 */
export async function getPopularColoringPagesByTag(
  tag: string, 
  count: number = 5
): Promise<PopularityScore[]> {
  const popularPages = await getPopularColoringPages(50)
  return popularPages
    .filter(page => page.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())))
    .slice(0, count)
}

// 调试函数 - 显示受欢迎度分析
export async function debugPopularityScores(): Promise<void> {
  const popularPages = await getPopularColoringPages(10)
  
  console.log('🏆 受欢迎度排名分析:')
  console.log('==================')
  
  popularPages.forEach((page, index) => {
    console.log(`${index + 1}. ${page.title} (总分: ${page.score})`)
    console.log(`   📥 下载: ${page.downloadCount} (得分: ${page.metrics.downloads})`)
    console.log(`   ❤️  收藏: ${page.favoriteCount} (得分: ${page.metrics.favorites})`)
    console.log(`   👀 浏览: ${page.viewCount} (得分: ${page.metrics.views})`)
    console.log(`   🆕 新鲜度: ${page.metrics.recency}`)
    console.log(`   ⭐ 特色: ${page.metrics.featured}`)
    console.log(`   📅 创建: ${page.createdAt.toLocaleDateString()}`)
    console.log('---')
  })
}