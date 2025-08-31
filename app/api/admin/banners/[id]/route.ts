import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { deleteMultipleFromR2, extractR2KeyFromUrl } from '@/lib/r2-storage'

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
      imageType: banner.image_type,
      pairedImageId: banner.paired_image_id,
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
      heroRow,
      imageType,
      pairedImageId
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
    if (imageType !== undefined) updateData.image_type = imageType
    if (pairedImageId !== undefined) updateData.paired_image_id = pairedImageId

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
        imageType: banner.image_type,
        pairedImageId: banner.paired_image_id,
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

    // 1. 首先获取banner数据以获取图片URL
    const { data: banner, error: fetchError } = await supabaseAdmin
      .from('banner_images')
      .select('image_url, title')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching banner for deletion:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch banner: ' + fetchError.message },
        { status: 500 }
      )
    }

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    console.log(`🗑️ Deleting banner: "${banner.title}" (ID: ${id})`)

    // 2. 从数据库删除banner记录
    const { error: deleteError } = await supabaseAdmin
      .from('banner_images')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Error deleting banner from database:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete banner: ' + deleteError.message },
        { status: 500 }
      )
    }

    console.log('✅ Banner deleted from database successfully')

    // 3. 同步删除R2中的文件
    const r2Keys: string[] = []
    let r2DeleteResult: { success: boolean; failed: string[] } | null = null
    
    if (banner.image_url) {
      // 提取主图片的R2 key
      const mainImageKey = extractR2KeyFromUrl(banner.image_url)
      if (mainImageKey) {
        r2Keys.push(mainImageKey)
        
        // 尝试删除对应的缩略图 (如果存在)
        const thumbnailKey = mainImageKey.replace(/^(hero|banners)\//, '$1/thumbnails/thumb_')
        r2Keys.push(thumbnailKey)
      }
    }

    if (r2Keys.length > 0) {
      console.log(`🧹 Cleaning up ${r2Keys.length} files from R2...`)
      
      r2DeleteResult = await deleteMultipleFromR2(r2Keys)
      
      if (!r2DeleteResult.success) {
        console.warn('⚠️ Some R2 files could not be deleted:', r2DeleteResult.failed)
        // 不阻止删除操作，只记录警告
      }
    } else {
      console.log('🔍 No R2 files to clean up (could not extract keys from URL)')
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      r2Cleanup: r2Keys.length > 0 ? {
        attempted: r2Keys.length,
        successful: r2Keys.length - (r2DeleteResult?.failed?.length || 0),
        failed: r2DeleteResult?.failed || []
      } : {
        attempted: 0,
        successful: 0,
        failed: []
      }
    })

  } catch (error) {
    console.error('❌ Admin banner delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}