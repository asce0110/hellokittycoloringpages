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

    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('setting_key', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings: ' + error.message },
        { status: 500 }
      )
    }

    const formattedSettings = (settings || []).map((setting: any) => ({
      id: setting.id,
      settingKey: setting.setting_key,
      settingValue: setting.setting_value,
      description: setting.description,
      category: setting.category,
      isPublic: setting.is_public,
      updatedBy: setting.updated_by,
      createdAt: new Date(setting.created_at),
      updatedAt: new Date(setting.updated_at)
    }))

    return NextResponse.json({ success: true, data: formattedSettings })

  } catch (error) {
    console.error('❌ Admin settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { settingKey, settingValue, description } = body

    if (!settingKey) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }

    // Upsert the setting (update if exists, create if not)
    const { data: setting, error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: settingValue,
        description: description || null,
        category: 'system',
        is_public: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating setting:', error)
      return NextResponse.json(
        { error: 'Failed to update setting: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Setting updated successfully',
      data: {
        id: setting.id,
        settingKey: setting.setting_key,
        settingValue: setting.setting_value,
        description: setting.description,
        category: setting.category,
        isPublic: setting.is_public,
        createdAt: new Date(setting.created_at),
        updatedAt: new Date(setting.updated_at)
      }
    })

  } catch (error) {
    console.error('❌ Admin settings update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}