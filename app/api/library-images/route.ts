import { NextRequest, NextResponse } from 'next/server'
import { getLibraryImages } from '@/lib/database'

// GET /api/library-images - 公开获取图库图片列表 (用户可见)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category') || undefined
    const difficulty = searchParams.get('difficulty') || undefined
    const featured = searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined

    console.log('🔍 Fetching library images for public view:', {
      page, limit, category, difficulty, featured
    })

    // 只获取激活的图片 (is_active = true)
    const result = await getLibraryImages({
      page,
      limit,
      category,
      difficulty,
      featured,
      active: true // 强制只显示激活的图片
    })

    if (!result || !result.data) {
      console.log('⚠️ No library images found')
      return NextResponse.json({
        data: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    console.log(`✅ Found ${result.data.length} library images`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error fetching public library images:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch library images',
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        }
      },
      { status: 500 }
    )
  }
}