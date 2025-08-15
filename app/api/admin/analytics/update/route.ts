import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayString = today.toISOString().split('T')[0] // YYYY-MM-DD format

    // Calculate current statistics from actual data
    const [usersResult, generationsResult, libraryResult, proUsersResult, subscriptionsResult] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact' }),
      supabaseAdmin.from('generation_history').select('*', { count: 'exact' }),
      supabaseAdmin.from('library_images').select('*', { count: 'exact' }),
      supabaseAdmin.from('users').select('*', { count: 'exact' }).eq('is_pro_user', true),
      supabaseAdmin.from('user_subscriptions').select('*', { count: 'exact' }).eq('status', 'active')
    ])

    // Calculate new users today
    const { count: newUsersToday } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())

    // Calculate generations today
    const { count: generationsToday } = await supabaseAdmin
      .from('generation_history')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())

    // Calculate downloads today (assuming we track this in generation_history or separate table)
    const { count: downloadsToday } = await supabaseAdmin
      .from('generation_history')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())
      // Add filter for downloads if tracked separately

    // Calculate total downloads (for now, assume same as generations)
    const totalDownloads = generationsResult.count || 0

    // Calculate monthly revenue from active subscriptions
    const { data: activeSubscriptions } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*, pricing_plans(price_monthly)')
      .eq('status', 'active')
      .gte('started_at', new Date(today.getFullYear(), today.getMonth(), 1).toISOString())

    const monthlyRevenue = activeSubscriptions?.reduce((sum: number, sub: any) => {
      return sum + (sub.pricing_plans?.price_monthly || 0)
    }, 0) || 0

    // Prepare analytics data
    const analyticsData = {
      stat_date: todayString,
      total_users: usersResult.count || 0,
      new_users: newUsersToday || 0,
      total_generations: generationsResult.count || 0,
      daily_generations: generationsToday || 0,
      total_downloads: totalDownloads,
      daily_downloads: downloadsToday || 0,
      pro_users: proUsersResult.count || 0,
      monthly_revenue: monthlyRevenue,
      created_at: new Date().toISOString()
    }

    // Upsert today's analytics data
    const { data: analyticsRecord, error: analyticsError } = await supabaseAdmin
      .from('analytics_stats')
      .upsert(analyticsData, {
        onConflict: 'stat_date'
      })
      .select()
      .single()

    if (analyticsError) {
      console.error('❌ Error updating analytics:', analyticsError)
      return NextResponse.json(
        { error: 'Failed to update analytics: ' + analyticsError.message },
        { status: 500 }
      )
    }

    console.log('✅ Analytics updated successfully:', analyticsRecord)

    return NextResponse.json({
      success: true,
      message: 'Analytics updated successfully',
      data: {
        date: todayString,
        totalUsers: analyticsData.total_users,
        newUsers: analyticsData.new_users,
        totalGenerations: analyticsData.total_generations,
        dailyGenerations: analyticsData.daily_generations,
        totalDownloads: analyticsData.total_downloads,
        dailyDownloads: analyticsData.daily_downloads,
        proUsers: analyticsData.pro_users,
        monthlyRevenue: analyticsData.monthly_revenue
      }
    })

  } catch (error) {
    console.error('❌ Analytics update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}