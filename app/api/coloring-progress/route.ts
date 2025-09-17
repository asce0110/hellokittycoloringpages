import { NextRequest, NextResponse } from 'next/server'
import { 
  saveColoringProgress, 
  getColoringProgress, 
  deleteColoringProgress,
  getUserColoringProgress 
} from '@/lib/database'
import { supabase } from '@/lib/supabase'

// GET - 获取用户的着色进度
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // 如果指定了图片URL，获取特定图片的进度
    if (imageUrl) {
      const progress = await getColoringProgress(userId, imageUrl)
      return NextResponse.json({
        success: true,
        data: progress
      })
    }

    // 否则获取用户所有进度
    const result = await getUserColoringProgress(userId, page, limit)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching coloring progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coloring progress' },
      { status: 500 }
    )
  }
}

// POST - 保存着色进度
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      imageUrl, 
      imageSlug, 
      progressData, 
      progressType = "dataURL", 
      deviceType = "desktop" 
    } = body

    if (!userId || !imageUrl || !imageSlug || !progressData) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, imageUrl, imageSlug, progressData' },
        { status: 400 }
      )
    }

    // 验证用户权限
    const { data: user } = await supabase.auth.getUser()
    if (!user || user.user?.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const progress = await saveColoringProgress(
      userId,
      imageUrl,
      imageSlug,
      progressData,
      progressType,
      deviceType
    )

    if (!progress) {
      return NextResponse.json(
        { error: 'Failed to save coloring progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: progress
    })

  } catch (error) {
    console.error('Error saving coloring progress:', error)
    return NextResponse.json(
      { error: 'Failed to save coloring progress' },
      { status: 500 }
    )
  }
}

// DELETE - 删除着色进度
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')
    const userId = searchParams.get('userId')

    if (!userId || !imageUrl) {
      return NextResponse.json(
        { error: 'User ID and image URL are required' },
        { status: 400 }
      )
    }

    // 验证用户权限
    const { data: user } = await supabase.auth.getUser()
    if (!user || user.user?.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const success = await deleteColoringProgress(userId, imageUrl)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete coloring progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Coloring progress deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting coloring progress:', error)
    return NextResponse.json(
      { error: 'Failed to delete coloring progress' },
      { status: 500 }
    )
  }
}