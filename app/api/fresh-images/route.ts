import { NextRequest, NextResponse } from 'next/server'
import { getOptimalTimeRange, filterImagesByTimeRange } from '@/lib/time-filters'
import { getLibraryImages as fetchLibraryImages } from '@/lib/database'

// 直接从数据库获取图片数据，避免API调用循环
async function getLibraryImages() {
  try {
    console.log('🔍 Fresh Images API: 直接从数据库获取图片...')
    
    // 直接调用数据库函数而不是API
    const result = await fetchLibraryImages({
      page: 1,
      limit: 50,
      active: true
    })
    
    console.log('📊 数据库查询详细结果:', { 
      success: result?.success, 
      dataLength: result?.data?.length,
      hasData: result?.data && result?.data.length > 0
    })
    
    if (result.success && result.data && result.data.length > 0) {
      const dbImages = result.data
      console.log(`✅ 从数据库获取到 ${dbImages.length} 张图片`)
      console.log('📝 数据库图片预览:', dbImages.slice(0, 2).map(img => ({ id: img.id, title: img.title, createdAt: img.createdAt })))
      
      // 🎯 绝对优先使用数据库数据：只要有任何数据就使用，完全不使用模拟数据
      console.log(`✅ 强制使用数据库数据: ${dbImages.length} 张图片 (跳过模拟数据)`)
      return dbImages
    } else {
      console.log('⚠️ 数据库无数据或查询失败，使用模拟数据')
      console.log('📊 数据库查询失败详情:', { 
        success: result?.success, 
        dataLength: result?.data?.length,
        message: result?.success === false ? 'Database query failed' : 'No data returned'
      })
    }
  } catch (error) {
    console.log('⚠️ 数据库连接失败，使用模拟数据:', error)
    console.log('❌ 详细错误信息:', error instanceof Error ? error.message : String(error))
  }
  
  // 如果数据库不可用，返回模拟的新图片数据 (确保本周有足够的图片)
  const now = new Date()
  
  const mockImages = [
    {
      id: 'fresh-20001', // 使用更大的ID避免与数据库冲突
      title: 'Astronaut Hello Kitty',
      description: 'Hello Kitty exploring space in a cute astronaut suit',
      imageUrl: '/astronaut-cat-coloring-page.png',
      thumbnailUrl: '/astronaut-cat-coloring-page.png',
      category: 'Characters',
      difficulty: 'medium' as const,
      tags: ['astronaut', 'space', 'adventure'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1天前
      updatedAt: new Date()
    },
    {
      id: 'fresh-20002',
      title: 'Chef Hello Kitty',
      description: 'Hello Kitty cooking delicious treats in the kitchen',
      imageUrl: '/hello-kitty-coloring-page.png',
      thumbnailUrl: '/hello-kitty-coloring-page.png',
      category: 'Characters',
      difficulty: 'easy' as const,
      tags: ['chef', 'cooking', 'kitchen'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2天前
      updatedAt: new Date()
    },
    {
      id: 'fresh-20003',
      title: 'Fairy Princess Kitty',
      description: 'Hello Kitty as a magical fairy princess with wings',
      imageUrl: '/cute-kitty-coloring-page.png',
      thumbnailUrl: '/cute-kitty-coloring-page.png',
      category: 'Characters',
      difficulty: 'complex' as const,
      tags: ['fairy', 'princess', 'magic', 'wings'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3天前
      updatedAt: new Date()
    },
    {
      id: 'fresh-20004',
      title: 'Pirate Adventure Kitty',
      description: 'Hello Kitty on a pirate ship seeking treasure',
      imageUrl: '/hello-kitty-coloring-page.png',
      thumbnailUrl: '/hello-kitty-coloring-page.png',
      category: 'Characters',
      difficulty: 'medium' as const,
      tags: ['pirate', 'adventure', 'treasure', 'ship'],
      isActive: true,
      isFeatured: true,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4天前
      updatedAt: new Date()
    },
    {
      id: 'fresh-20005',
      title: 'Garden Party Kitty',
      description: 'Hello Kitty hosting a beautiful garden tea party',
      imageUrl: '/hello-kitty-coloring-page.png',
      thumbnailUrl: '/hello-kitty-coloring-page.png',
      category: 'Scenes',
      difficulty: 'easy' as const,
      tags: ['garden', 'party', 'tea', 'flowers'],
      isActive: true,
      isFeatured: false,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5天前
      updatedAt: new Date()
    },
    {
      id: 'fresh-20006',
      title: 'Summer Beach Kitty',
      description: 'Hello Kitty enjoying a fun day at the beach',
      imageUrl: '/cute-kitty-coloring-page.png',
      thumbnailUrl: '/cute-kitty-coloring-page.png',
      category: 'Seasons',
      difficulty: 'medium' as const,
      tags: ['summer', 'beach', 'fun', 'seasonal'],
      isActive: true,
      isFeatured: false,
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6天前
      updatedAt: new Date()
    },
    {
      id: 'fresh-20007',
      title: 'Winter Wonderland Kitty',
      description: 'Hello Kitty playing in a snowy winter wonderland',
      imageUrl: '/cute-kitty-coloring-page.png',
      thumbnailUrl: '/cute-kitty-coloring-page.png',
      category: 'Seasons',
      difficulty: 'medium' as const,
      tags: ['winter', 'snow', 'wonderland', 'seasonal'],
      isActive: true,
      isFeatured: false,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15天前 (上月)
      updatedAt: new Date()
    }
  ]
  
  console.log(`📊 生成模拟数据: 共${mockImages.length}张图片，本周内有${mockImages.filter(img => img.createdAt.getTime() >= now.getTime() - 7 * 24 * 60 * 60 * 1000).length}张`)
  
  return mockImages
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedCount = parseInt(searchParams.get('count') || '4')
    const minCount = Math.max(1, Math.min(requestedCount, 12)) // 限制在1-12之间
    
    console.log(`🎯 Fresh Images API 开始处理，请求 ${minCount} 张图片`)
    
    // 获取所有库图片数据
    const allImages = await getLibraryImages()
    
    console.log(`📋 原始数据源信息:`, {
      总图片数: allImages.length,
      数据类型: Array.isArray(allImages) ? 'Array' : typeof allImages,
      前两个图片: allImages.slice(0, 2).map((img: any) => ({ 
        id: img.id, 
        title: img.title, 
        createdAt: img.createdAt,
        isActive: img.isActive 
      }))
    })
    
    // 只考虑活跃的图片
    const activeImages = allImages.filter((img: any) => img.isActive)
    
    console.log(`📊 Fresh Images API: 总共${allImages.length}张图片，活跃${activeImages.length}张`)
    
    // 🎯 检查数据源类型并决定处理策略
    const isRealData = activeImages.length > 0 && activeImages[0].id && 
                      !activeImages[0].id.toString().startsWith('fresh-') && 
                      !activeImages[0].id.toString().startsWith('10001')
    
    console.log('🔍 数据源类型检查:', {
      有活跃图片: activeImages.length > 0,
      第一张图片ID: activeImages[0]?.id,
      ID类型: typeof activeImages[0]?.id,
      是否以fresh开头: activeImages[0]?.id?.toString().startsWith('fresh-'),
      是否以10001开头: activeImages[0]?.id?.toString().startsWith('10001'),
      判定为真实数据: isRealData
    })
    
    if (isRealData) {
      console.log('✅ 检测到真实数据库数据，直接使用不进行时间过滤')
      
      // 取前N张图片，直接返回数据库中的真实图片
      const selectedImages = activeImages.slice(0, minCount)
      
      const timeRange = {
        label: 'Latest Additions',
        description: 'Fresh coloring pages from our database',
        filterDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 默认一周
        period: 'week' as const
      }
      
      console.log(`✅ 直接返回数据库数据: ${selectedImages.length} 张图片`)
      console.log('📋 返回的图片预览:', selectedImages.slice(0, 2).map(img => ({ 
        id: img.id, 
        title: img.title 
      })))
      
      return NextResponse.json({
        success: true,
        timeRange,
        images: selectedImages,
        totalCount: activeImages.length,
        metadata: {
          requestedCount: minCount,
          period: 'week',
          filterDate: timeRange.filterDate.toISOString(),
          dataSource: 'database'
        }
      })
    }
    
    // 如果是模拟数据，使用原有的时间过滤逻辑
    console.log('⚠️ 使用模拟数据，应用时间过滤逻辑')
    
    // 使用智能时间过滤器找到最合适的时间范围
    const optimalTimeRange = getOptimalTimeRange(activeImages, minCount)
    
    // 过滤指定时间范围内的图片
    const freshImages = filterImagesByTimeRange(activeImages, optimalTimeRange)
    
    // 取前N张图片
    const selectedImages = freshImages.slice(0, minCount)
    
    console.log(`✅ Fresh Images API: 选择${optimalTimeRange.label}，返回${selectedImages.length}张图片`)
    
    return NextResponse.json({
      success: true,
      timeRange: optimalTimeRange,
      images: selectedImages,
      totalCount: freshImages.length,
      metadata: {
        requestedCount: minCount,
        period: optimalTimeRange.period,
        filterDate: optimalTimeRange.filterDate instanceof Date 
          ? optimalTimeRange.filterDate.toISOString()
          : optimalTimeRange.filterDate,
        dataSource: 'mock'
      }
    })
    
  } catch (error) {
    console.error('Fresh Images API Error:', error)
    
    // 发生错误时返回基本的备用数据
    const fallbackTimeRange = {
      label: 'Featured Pages',
      description: 'Discover amazing Hello Kitty coloring pages.',
      filterDate: new Date(0), // 1970年，匹配所有图片
      period: 'year' as const
    }
    
    const fallbackImages = [
      {
        id: 'fallback-1',
        title: 'Hello Kitty Adventure',
        description: 'A wonderful coloring page featuring Hello Kitty',
        imageUrl: '/hello-kitty-coloring-page.png',
        thumbnailUrl: '/hello-kitty-coloring-page.png',
        category: 'Characters',
        difficulty: 'medium' as const,
        tags: ['hello-kitty', 'adventure'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    return NextResponse.json({
      success: true,
      timeRange: fallbackTimeRange,
      images: fallbackImages,
      totalCount: 1,
      error: 'Using fallback data',
      metadata: {
        requestedCount: 1,
        period: 'year',
        filterDate: fallbackTimeRange.filterDate instanceof Date 
          ? fallbackTimeRange.filterDate.toISOString()
          : fallbackTimeRange.filterDate
      }
    })
  }
}

// 支持CORS预检请求
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    { message: 'Fresh Images API is available' },
    { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  )
}