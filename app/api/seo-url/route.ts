import { NextRequest, NextResponse } from 'next/server'

// 动态导入以避免模块加载时的循环依赖
async function getSeoStorageModule() {
  try {
    const module = await import('@/lib/seo-url-storage')
    console.log('🚀 SEO API路由：存储模块动态加载成功')
    return module
  } catch (error) {
    console.error('❌ SEO存储模块动态加载失败:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // 动态加载存储模块
    const seoStorageModule = await getSeoStorageModule()

    const body = await request.json()
    const { slug, imageUrl, title, description, libraryImageId } = body

    if (!slug || !imageUrl || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, imageUrl, title' },
        { status: 400 }
      )
    }

    await seoStorageModule.storeSeoUrlMapping(slug, {
      imageUrl,
      title,
      description: description || '',
      libraryImageId: libraryImageId || null, // 🎯 添加真实图片ID字段
      timestamp: Date.now()
    })

    console.log('✅ API POST: SEO映射存储成功:', { slug, title })
    
    // 验证存储是否成功
    const verification = await seoStorageModule.getSeoUrlMapping(slug)
    if (!verification) {
      console.error('⚠️ API POST: 存储后立即查询失败!')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'SEO URL mapping stored successfully',
      slug,
      verified: !!verification
    })
  } catch (error) {
    console.error('SEO URL storage error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to store SEO URL mapping',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 动态加载存储模块
    const seoStorageModule = await getSeoStorageModule()

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      )
    }

    console.log('🔍 API GET: 查询SEO映射:', slug)
    const data = await seoStorageModule.getSeoUrlMapping(slug)
    
    if (!data) {
      console.log('❌ API GET: SEO映射未找到:', slug)
      // 获取存储统计信息用于调试
      const stats = seoStorageModule.getStorageStats()
      console.log('📊 当前存储状态:', stats)
      
      return NextResponse.json(
        { 
          error: 'SEO URL mapping not found',
          debug: {
            slug,
            totalMappings: stats.totalMappings,
            timestamp: Date.now()
          }
        },
        { status: 404 }
      )
    }

    console.log('✅ API GET: SEO映射找到:', { slug, title: data.title })

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('❌ API GET: SEO查询失败:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve SEO URL mapping',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}