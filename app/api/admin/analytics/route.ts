import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get analytics data for the specified number of days
    const { data: analytics, error } = await supabaseAdmin
      .from('analytics_stats')
      .select('*')
      .order('stat_date', { ascending: false })
      .limit(days)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analytics: ' + error.message },
        { status: 500 }
      )
    }

    const formattedAnalytics = (analytics || []).map((stat: any) => ({
      id: stat.id,
      statDate: new Date(stat.stat_date),
      totalUsers: stat.total_users,
      newUsers: stat.new_users,
      totalGenerations: stat.total_generations,
      dailyGenerations: stat.daily_generations,
      totalDownloads: stat.total_downloads,
      dailyDownloads: stat.daily_downloads,
      proUsers: stat.pro_users,
      monthlyRevenue: stat.monthly_revenue,
      createdAt: new Date(stat.created_at)
    }))

    return NextResponse.json({ success: true, data: formattedAnalytics })

  } catch (error) {
    console.error('❌ Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}