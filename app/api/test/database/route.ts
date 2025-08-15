import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Supabase admin client not configured',
          message: 'Please check your environment variables'
        },
        { status: 503 }
      )
    }

    // 测试数据库连接
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      console.error('Database connection test failed:', error)
      return NextResponse.json(
        { 
          success: false,
          error: error.message,
          code: error.code,
          message: 'Database connection failed'
        },
        { status: 500 }
      )
    }

    // 检查提示词模板表是否存在
    const { data: templateData, error: templateError } = await supabaseAdmin
      .from('prompt_templates')
      .select('count(*)', { count: 'exact', head: true })

    const tableStatus = {
      users: 'exists',
      prompt_templates: templateError ? 
        (templateError.code === 'PGRST116' || templateError.message?.includes('does not exist') ? 'missing' : 'error')
        : 'exists'
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      tables: tableStatus,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasStabilityKey: !!process.env.STABILITY_AI_API_KEY
      },
      recommendations: tableStatus.prompt_templates === 'missing' ? [
        'The prompt_templates table does not exist.',
        'Please run the database migrations from database-migrations.md',
        'AI generation will work without templates but with basic prompts only.'
      ] : []
    })

  } catch (error) {
    console.error('Database test API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        message: 'Failed to test database connection'
      },
      { status: 500 }
    )
  }
}