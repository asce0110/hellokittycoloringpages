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

    // Fetch real statistics from database
    const [usersResult, generationsResult, libraryResult, proUsersResult] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact' }),
      supabaseAdmin.from('generation_history').select('*', { count: 'exact' }),
      supabaseAdmin.from('library_images').select('*', { count: 'exact' }),
      supabaseAdmin.from('users').select('*', { count: 'exact' }).eq('is_pro_user', true)
    ])

    // Calculate new users today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: newUsersToday } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())

    // Calculate generations today
    const { count: generationsToday } = await supabaseAdmin
      .from('generation_history')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())

    const stats = {
      totalUsers: usersResult.count || 0,
      totalGenerations: generationsResult.count || 0,
      totalLibraryImages: libraryResult.count || 0,
      activeProUsers: proUsersResult.count || 0,
      newUsersToday: newUsersToday || 0,
      generationsToday: generationsToday || 0,
      monthlyRevenue: 0, // TODO: Calculate from subscriptions
      revenueGrowth: 0
    }

    return NextResponse.json({ success: true, data: stats })

  } catch (error) {
    console.error('❌ Admin stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}