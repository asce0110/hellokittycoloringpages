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
    const body = await request.json()
    const result = await createLibraryImage(body, 'admin')

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create library image' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating library image:', error)
    return NextResponse.json(
      { error: 'Failed to create library image' },
      { status: 500 }
    )
  }
}