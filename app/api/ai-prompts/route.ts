import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// GET /api/ai-prompts - Fetch AI prompts with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const ageGroup = searchParams.get('age_group')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort') || 'popular' // popular, recent, rating

    // Use demo data if no Supabase configured
    if (!supabaseUrl || !supabaseServiceKey) {
      // Return sample data for development
      const { COMPLETE_AI_PROMPTS } = await import('@/lib/generate-all-prompts')
      let filtered = [...COMPLETE_AI_PROMPTS]
      
      // Apply filters
      if (category) {
        filtered = filtered.filter(p => p.category === category)
      }
      if (difficulty) {
        filtered = filtered.filter(p => p.difficulty === difficulty)
      }
      if (ageGroup) {
        filtered = filtered.filter(p => p.ageGroup === ageGroup)
      }
      if (search) {
        const searchLower = search.toLowerCase()
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(t => t.toLowerCase().includes(searchLower))
        )
      }
      
      // Paginate
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedData = filtered.slice(start, end)
      
      return NextResponse.json({
        prompts: paginatedData,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit)
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Build query
    let query = supabase
      .from('ai_prompt_templates')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }
    if (ageGroup) {
      query = query.eq('age_group', ageGroup)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true).order('featured_order')
    }
    
    // Apply search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('generation_count', { ascending: false })
        break
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'rating':
        query = query.order('average_rating', { ascending: false, nullsFirst: false })
        break
      default:
        query = query.order('generation_count', { ascending: false })
    }

    // Apply pagination
    const start = (page - 1) * limit
    query = query.range(start, start + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching prompts:', error)
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
    }

    return NextResponse.json({
      prompts: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/ai-prompts - Create a new prompt (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating prompt:', error)
      return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}