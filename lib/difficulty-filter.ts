import { getLibraryImages } from './database'
import { getDemoLibraryImages } from './demo-data'
import { LibraryImage } from './types'

export type DifficultyLevel = 'easy' | 'medium' | 'complex'

/**
 * 根据难度级别获取图书馆图片 - 使用真实数据库数据
 */
export async function getImagesByDifficulty(difficulty: DifficultyLevel): Promise<{
  images: LibraryImage[]
  total: number
  success: boolean
  error?: string
}> {
  try {
    console.log(`🔍 Fetching ${difficulty} difficulty images from database...`)
    
    // 尝试从数据库获取
    const result = await getLibraryImages({
      difficulty,
      active: true,
      page: 1,
      limit: 100 // 获取更多图片用于展示
    })
    
    console.log(`🔍 Database query result:`, {
      success: result.success,
      dataLength: result.data?.length || 0,
      total: result.pagination?.total || 0
    })
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ Found ${result.data.length} ${difficulty} images from database`)
      return {
        images: result.data,
        total: result.pagination.total,
        success: true
      }
    }
    
    // 如果数据库查询失败或没有数据，使用demo数据作为回退
    console.log(`⚠️ Database query failed or no data found for ${difficulty}, using demo data`)
    console.log(`Database query not successful: ${!result.success}`)
    
    const demoResult = await getDemoLibraryImages()
    const filteredDemoImages = demoResult.data.filter(img => img.difficulty === difficulty)
    
    return {
      images: filteredDemoImages,
      total: filteredDemoImages.length,
      success: result.success, // 保持原始success状态
      error: 'Using demo data as fallback'
    }
    
  } catch (error) {
    console.error(`❌ Unexpected error fetching ${difficulty} images:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    
    // 错误时使用demo数据作为最后的回退
    try {
      const demoResult = await getDemoLibraryImages()
      const filteredDemoImages = demoResult.data.filter(img => img.difficulty === difficulty)
      
      return {
        images: filteredDemoImages,
        total: filteredDemoImages.length,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } catch (demoError) {
      console.error(`❌ Demo data also failed:`, demoError)
      // 如果连demo数据都无法加载，返回空结果
      return {
        images: [],
        total: 0,
        success: false,
        error: `Database and demo data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

/**
 * 获取所有Hello Kitty图片 - 使用真实数据库数据
 */
export async function getAllHelloKittyImages(): Promise<{
  images: LibraryImage[]
  totalCount: number
  difficultyStats: {
    easy: number
    medium: number
    complex: number
  }
  success: boolean
  error?: string
}> {
  try {
    console.log('🔍 Fetching all Hello Kitty images from database...')
    
    // 并行获取所有难度级别的图片
    const [easyResult, mediumResult, complexResult] = await Promise.all([
      getImagesByDifficulty('easy'),
      getImagesByDifficulty('medium'),
      getImagesByDifficulty('complex')
    ])
    
    console.log('🔍 Difficulty results:', {
      easy: { success: easyResult.success, count: easyResult.images.length, error: easyResult.error },
      medium: { success: mediumResult.success, count: mediumResult.images.length, error: mediumResult.error },
      complex: { success: complexResult.success, count: complexResult.images.length, error: complexResult.error }
    })
    
    // 合并所有图片
    const allImages = [
      ...easyResult.images,
      ...mediumResult.images,
      ...complexResult.images
    ]
    
    const stats = {
      easy: easyResult.images.length,
      medium: mediumResult.images.length,
      complex: complexResult.images.length
    }
    
    const overallSuccess = easyResult.success && mediumResult.success && complexResult.success
    const errors = [easyResult.error, mediumResult.error, complexResult.error].filter(Boolean)
    
    console.log(`✅ Found ${allImages.length} total Hello Kitty images:`, stats)
    console.log(`Overall success: ${overallSuccess}, Errors: ${errors.length > 0 ? errors.join(', ') : 'None'}`)
    
    return {
      images: allImages,
      totalCount: allImages.length,
      difficultyStats: stats,
      success: overallSuccess,
      error: errors.length > 0 ? errors.join(', ') : undefined
    }
    
  } catch (error) {
    console.error('❌ Error fetching all Hello Kitty images:', error)
    
    // 错误时使用demo数据作为回退
    try {
      const demoResult = await getDemoLibraryImages()
      const demoStats = {
        easy: demoResult.data.filter(img => img.difficulty === 'easy').length,
        medium: demoResult.data.filter(img => img.difficulty === 'medium').length,
        complex: demoResult.data.filter(img => img.difficulty === 'complex').length
      }
      
      return {
        images: demoResult.data,
        totalCount: demoResult.data.length,
        difficultyStats: demoStats,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } catch (demoError) {
      return {
        images: [],
        totalCount: 0,
        difficultyStats: { easy: 0, medium: 0, complex: 0 },
        success: false,
        error: `Database and demo data unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

/**
 * 获取特色Hello Kitty图片
 */
export async function getFeaturedHelloKittyImages(): Promise<{
  images: LibraryImage[]
  success: boolean
  error?: string
}> {
  try {
    console.log('🌟 Fetching featured Hello Kitty images...')
    
    // 获取所有图片然后筛选特色的
    const allResult = await getAllHelloKittyImages()
    
    if (!allResult.success) {
      return {
        images: allResult.images.slice(0, 8), // 取前8个作为特色
        success: false,
        error: allResult.error
      }
    }
    
    // 优先选择有高质量描述或者特定关键词的图片作为特色
    const featuredImages = allResult.images
      .filter(img => 
        img.title.toLowerCase().includes('hello kitty') ||
        img.description?.toLowerCase().includes('hello kitty') ||
        img.category?.toLowerCase().includes('hello') ||
        img.tags?.some(tag => tag.toLowerCase().includes('hello'))
      )
      .slice(0, 8) // 限制为8个特色图片
    
    return {
      images: featuredImages,
      success: true
    }
    
  } catch (error) {
    console.error('❌ Error fetching featured images:', error)
    return {
      images: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 获取所有难度级别的统计信息
 */
export async function getDifficultyStats(): Promise<{
  easy: number
  medium: number
  complex: number
  total: number
  success: boolean
}> {
  try {
    const result = await getAllHelloKittyImages()
    
    return {
      easy: result.difficultyStats.easy,
      medium: result.difficultyStats.medium,
      complex: result.difficultyStats.complex,
      total: result.totalCount,
      success: result.success
    }
  } catch (error) {
    console.error('❌ Error getting difficulty stats:', error)
    return {
      easy: 0,
      medium: 0,
      complex: 0,
      total: 0,
      success: false
    }
  }
}

/**
 * 根据难度获取SEO优化的metadata
 */
export function getDifficultyMetadata(difficulty: DifficultyLevel, imageCount: number) {
  const difficultyConfig = {
    easy: {
      title: 'Easy Hello Kitty Drawings - Simple Coloring Pages for Beginners | AI Kitty Creator',
      description: 'Download easy hello kitty drawings perfect for beginners and young children. Simple coloring pages with large areas and minimal details. Free printable!',
      keywords: 'easy hello kitty drawings, simple hello kitty coloring, beginner coloring pages, kids hello kitty, easy coloring sheets',
      openGraphTitle: 'Easy Hello Kitty Drawings - Simple Coloring Pages for Beginners',
      openGraphDescription: 'Simple hello kitty drawings perfect for beginners and young children. Free and easy to color!',
      heroColor: 'from-green-600 via-emerald-500 to-teal-700',
      bgColor: 'from-green-50 via-white to-blue-50',
      badgeColor: 'bg-green-600 hover:bg-green-700',
      iconColor: 'bg-green-100 group-hover:bg-green-200',
      breadcrumbColor: 'text-green-200',
      icon: '🌟',
      ageGroup: 'Ages 3-7',
      characteristics: 'Beginner Friendly',
      audience: 'Children, Beginners'
    },
    medium: {
      title: 'Medium Hello Kitty Drawings - Intermediate Coloring Pages | AI Kitty Creator',
      description: 'Perfect medium difficulty hello kitty drawings for developing coloring skills. Balanced detail and complexity for intermediate colorists.',
      keywords: 'medium hello kitty drawings, intermediate hello kitty coloring, balanced coloring pages, skill building drawings',
      openGraphTitle: 'Medium Hello Kitty Drawings - Intermediate Coloring Pages',
      openGraphDescription: 'Intermediate level hello kitty drawings perfect for building coloring skills and confidence.',
      heroColor: 'from-blue-600 via-indigo-500 to-blue-800',
      bgColor: 'from-blue-50 via-white to-purple-50',
      badgeColor: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'bg-blue-100 group-hover:bg-blue-200',
      breadcrumbColor: 'text-blue-200',
      icon: '🎯',
      ageGroup: 'Ages 7-12',
      characteristics: 'Intermediate',
      audience: 'Children, Developing Skills'
    },
    complex: {
      title: 'Complex Hello Kitty Drawings - Advanced Coloring Pages for Experts | AI Kitty Creator',
      description: 'Challenging complex hello kitty drawings for advanced colorists. Intricate designs with detailed patterns and sophisticated layouts.',
      keywords: 'complex hello kitty drawings, advanced hello kitty coloring, detailed coloring pages, expert level drawings, intricate designs',
      openGraphTitle: 'Complex Hello Kitty Drawings - Advanced Coloring Pages',
      openGraphDescription: 'Intricate designs for advanced colorists. Detailed patterns and challenging layouts.',
      heroColor: 'from-purple-600 via-pink-500 to-purple-800',
      bgColor: 'from-purple-50 via-white to-pink-50',
      badgeColor: 'bg-purple-600 hover:bg-purple-700',
      iconColor: 'bg-purple-100 group-hover:bg-purple-200',
      breadcrumbColor: 'text-purple-200',
      icon: '🏆',
      ageGroup: 'Adults & Experts',
      characteristics: 'Advanced',
      audience: 'Adults, Expert Colorists'
    }
  }
  
  const config = difficultyConfig[difficulty]
  
  return {
    ...config,
    pageTitle: `${config.title} - ${imageCount} Drawings Available`,
    pageDescription: `${config.description} Browse ${imageCount} ${difficulty} difficulty coloring pages.`
  }
}