import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      originalImageUrl,
      coloredImageUrl,
      title,
      colorScheme,
      isActive = true
    } = body

    console.log('📝 Creating color reference:', {
      originalImageUrl: originalImageUrl?.slice(0, 50) + '...',
      coloredImageUrl: coloredImageUrl?.slice(0, 50) + '...',
      title,
      colorScheme: Object.keys(colorScheme || {})
    })

    // 验证必填字段
    if (!originalImageUrl || !coloredImageUrl || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: originalImageUrl, coloredImageUrl, title' },
        { status: 400 }
      )
    }

    // 验证颜色方案格式
    if (!colorScheme || !colorScheme.primary || !colorScheme.secondary || !colorScheme.accent) {
      return NextResponse.json(
        { error: 'Invalid color scheme format. Must have primary, secondary, and accent arrays.' },
        { status: 400 }
      )
    }

    // 检查是否已经存在相同原图的参考图
    const { data: existing, error: checkError } = await supabase
      .from('color_references')
      .select('id')
      .eq('original_image_url', originalImageUrl)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing reference:', checkError)
      return NextResponse.json(
        { error: 'Database error while checking existing references' },
        { status: 500 }
      )
    }

    const now = new Date().toISOString()

    if (existing) {
      // 更新现有记录
      console.log('🔄 Updating existing color reference...')
      const { data, error } = await supabase
        .from('color_references')
        .update({
          colored_image_url: coloredImageUrl,
          title,
          color_scheme: colorScheme,
          is_active: isActive,
          updated_at: now
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating color reference:', error)
        return NextResponse.json(
          { error: 'Failed to update color reference: ' + error.message },
          { status: 500 }
        )
      }

      console.log('✅ Color reference updated successfully')
      return NextResponse.json({
        success: true,
        message: 'Color reference updated successfully',
        data
      })

    } else {
      // 创建新记录
      console.log('➕ Creating new color reference...')
      const { data, error } = await supabase
        .from('color_references')
        .insert({
          original_image_url: originalImageUrl,
          colored_image_url: coloredImageUrl,
          title,
          color_scheme: colorScheme,
          is_active: isActive,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating color reference:', error)
        return NextResponse.json(
          { error: 'Failed to create color reference: ' + error.message },
          { status: 500 }
        )
      }

      console.log('✅ Color reference created successfully')
      return NextResponse.json({
        success: true,
        message: 'Color reference created successfully',
        data
      })
    }

  } catch (error) {
    console.error('❌ Color reference API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const originalImageUrl = searchParams.get('originalImageUrl')

    if (originalImageUrl) {
      // 获取特定原图的参考图
      const { data, error } = await supabase
        .from('color_references')
        .select('*')
        .eq('original_image_url', originalImageUrl)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching color reference:', error)
        return NextResponse.json(
          { error: 'Failed to fetch color reference' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: data || null
      })
    } else {
      // 获取所有参考图
      const { data, error } = await supabase
        .from('color_references')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching color references:', error)
        return NextResponse.json(
          { error: 'Failed to fetch color references' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: data || []
      })
    }

  } catch (error) {
    console.error('❌ Color reference GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}