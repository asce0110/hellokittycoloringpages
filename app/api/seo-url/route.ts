import { NextRequest, NextResponse } from 'next/server'

// 安全导入 - 添加错误处理防止初始化失败
let seoStorageModule: typeof import('@/lib/seo-url-storage') | null = null
let storageError: Error | null = null

try {
  seoStorageModule = require('@/lib/seo-url-storage')
} catch (error) {
  storageError = error instanceof Error ? error : new Error('Unknown storage initialization error')
  console.error('❌ SEO存储模块加载失败:', error)
}

export async function POST(request: NextRequest) {
  try {
    // 检查存储模块是否可用
    if (!seoStorageModule) {
      console.error('⚠️ SEO存储模块不可用:', storageError?.message)
      return NextResponse.json(
        { 
          error: 'SEO storage service temporarily unavailable',
          details: 'Storage initialization failed',
          fallback: true
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { slug, imageUrl, title, description, libraryImageId } = body

    if (!slug || !imageUrl || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, imageUrl, title' },
        { status: 400 }
      )
    }

    seoStorageModule.storeSeoUrlMapping(slug, {
      imageUrl,
      title,
      description: description || '',
      libraryImageId: libraryImageId || null, // 🎯 添加真实图片ID字段
      timestamp: Date.now()
    })

    console.log('✅ API POST: SEO映射存储成功:', { slug, title })
    
    // 验证存储是否成功
    const verification = seoStorageModule.getSeoUrlMapping(slug)
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
    // 检查存储模块是否可用
    if (!seoStorageModule) {
      console.error('⚠️ SEO存储模块不可用:', storageError?.message)
      return NextResponse.json(
        { 
          error: 'SEO storage service temporarily unavailable',
          details: 'Storage initialization failed',
          fallback: true
        },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      )
    }

    console.log('🔍 API GET: 查询SEO映射:', slug)
    const data = seoStorageModule.getSeoUrlMapping(slug)
    
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