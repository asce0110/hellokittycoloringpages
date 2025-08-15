import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { data: banners, error } = await supabaseAdmin
      .from('banner_images')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch banners: ' + error.message },
        { status: 500 }
      )
    }

    const formattedBanners = (banners || []).map((banner: any) => ({
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
    }))

    return NextResponse.json({ success: true, data: formattedBanners })

  } catch (error) {
    console.error('❌ Admin banners API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      position,
      showOnHomepage,
      showOnLibrary,
      showOnHero,
      heroRow
    } = body

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    const { data: banner, error } = await supabaseAdmin
      .from('banner_images')
      .insert({
        title,
        image_url: imageUrl,
        link_url: linkUrl || null,
        description: description || '',
        position: position || Math.floor(Math.random() * 1000) + 1, // 使用提供的position或生成1-1000的随机数
        is_active: true,
        show_on_homepage: showOnHomepage || false,
        show_on_library: showOnLibrary || false,
        show_on_hero: showOnHero || false,
        hero_row: heroRow || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating banner:', error)
      return NextResponse.json(
        { error: 'Failed to create banner: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Banner created successfully',
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
    console.error('❌ Admin banner create API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}