import { NextRequest, NextResponse } from 'next/server'
import { getLibraryImages, updateLibraryImage, deleteLibraryImage, createLibraryImage } from '@/lib/database'

// GET /api/admin/library-images - 获取图库图片列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category') || undefined
    const difficulty = searchParams.get('difficulty') || undefined
    const featured = searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined
    const active = searchParams.get('active') ? searchParams.get('active') === 'true' : undefined

    const result = await getLibraryImages({
      page,
      limit,
      category,
      difficulty,
      featured,
      active
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching library images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch library images' },
      { status: 500 }
    )
  }
}

// POST /api/admin/library-images - 创建新的图库图片
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received POST request to create library image')
    
    const body = await request.json()
    console.log('📝 Request body:', JSON.stringify(body, null, 2))
    
    // 验证必需字段
    if (!body.title || !body.imageUrl) {
      console.error('❌ Missing required fields:', { title: !!body.title, imageUrl: !!body.imageUrl })
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'Title and imageUrl are required',
          received: Object.keys(body)
        },
        { status: 400 }
      )
    }
    
    const result = await createLibraryImage(body, 'admin')
    console.log('📊 Create result:', result ? 'Success' : 'Failed')

    if (!result) {
      console.error('❌ Database function returned null')
      return NextResponse.json(
        { 
          error: 'Failed to create library image',
          details: 'Database operation returned null - check server logs for database connection issues',
          suggestion: 'This might be due to missing environment variables or database connectivity issues'
        },
        { status: 500 }
      )
    }

    console.log('✅ Library image created successfully:', result.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ API Error creating library image:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}