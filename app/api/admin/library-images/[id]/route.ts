import { NextRequest, NextResponse } from 'next/server'
import { updateLibraryImage, deleteLibraryImage } from '@/lib/database'

// PUT /api/admin/library-images/[id] - 更新图库图片
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const result = await updateLibraryImage(id, body)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update library image' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating library image:', error)
    return NextResponse.json(
      { error: 'Failed to update library image' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/library-images/[id] - 删除图库图片
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteLibraryImage(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete library image' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting library image:', error)
    return NextResponse.json(
      { error: 'Failed to delete library image' },
      { status: 500 }
    )
  }
}