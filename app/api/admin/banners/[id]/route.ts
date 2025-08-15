import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data: banner, error } = await supabaseAdmin
      .from('banner_images')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch banner: ' + error.message },
        { status: 500 }
      )
    }

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    const formattedBanner = {
      id: banner.id,
      title: banner.title,
      imageUrl: banner.image_url,
      linkUrl: banner.link_url,
      description: banner.description,
      position: banner.position,
      isActive: banner.is_active,
      showOnHomepage: banner.show_on_homepage,
      showOnLibrary: banner.show_on_library,
      showOnHero: banner.show_on_hero,
      heroRow: banner.hero_row,
      createdAt: new Date(banner.created_at),
      updatedAt: new Date(banner.updated_at)
    }

    return NextResponse.json({ success: true, data: formattedBanner })

  } catch (error) {
    console.error('❌ Admin banner get API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { 
      title,
      imageUrl,
      linkUrl,
      description,
      isActive,
      showOnHomepage,
      showOnLibrary,
      showOnHero,
      heroRow
    } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Only update provided fields
    if (title !== undefined) updateData.title = title
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (linkUrl !== undefined) updateData.link_url = linkUrl
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.is_active = isActive
    if (showOnHomepage !== undefined) updateData.show_on_homepage = showOnHomepage
    if (showOnLibrary !== undefined) updateData.show_on_library = showOnLibrary
    if (showOnHero !== undefined) updateData.show_on_hero = showOnHero
    if (heroRow !== undefined) updateData.hero_row = heroRow

    const { data: banner, error } = await supabaseAdmin
      .from('banner_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating banner:', error)
      return NextResponse.json(
        { error: 'Failed to update banner: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
      data: {
        id: banner.id,
        title: banner.title,
        imageUrl: banner.image_url,
        linkUrl: banner.link_url,
        description: banner.description,
        position: banner.position,
        isActive: banner.is_active,
        showOnHomepage: banner.show_on_homepage,
        showOnLibrary: banner.show_on_library,
        showOnHero: banner.show_on_hero,
        heroRow: banner.hero_row,
        createdAt: new Date(banner.created_at),
        updatedAt: new Date(banner.updated_at)
      }
    })

  } catch (error) {
    console.error('❌ Admin banner update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { error } = await supabaseAdmin
      .from('banner_images')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting banner:', error)
      return NextResponse.json(
        { error: 'Failed to delete banner: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    })

  } catch (error) {
    console.error('❌ Admin banner delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}