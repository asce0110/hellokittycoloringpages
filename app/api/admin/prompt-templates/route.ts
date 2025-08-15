import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PromptTemplate, CreatePromptTemplateRequest } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured')
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const style = searchParams.get('style')
    const complexity = searchParams.get('complexity')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    let query = supabaseAdmin
      .from('prompt_templates')
      .select('*', { count: 'exact' })

    if (category) {
      query = query.eq('category', category)
    }
    if (style) {
      query = query.eq('style', style)
    }
    if (complexity) {
      query = query.eq('complexity', complexity)
    }
    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: templates, count, error } = await query
      .order('sort_order', { ascending: true })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching prompt templates:', error)
      console.error('Error details:', error.message, error.code)
      
      // 如果是表不存在的错误，返回空数据而不是错误
      if (error.code === 'PGRST116' || error.message?.includes('relation "prompt_templates" does not exist')) {
        console.log('Prompt templates table does not exist, returning empty data')
        return NextResponse.json({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          },
          success: true,
          message: 'Prompt templates table not yet created. Please run database migrations.'
        })
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch prompt templates: ' + error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    const formattedTemplates: PromptTemplate[] = templates?.map((template: any) => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      template: template.template,
      style: template.style,
      complexity: template.complexity,
      category: template.category,
      isActive: template.is_active,
      isDefault: template.is_default,
      variables: template.variables || [],
      exampleOutput: template.example_output || '',
      createdBy: template.created_by,
      sortOrder: template.sort_order,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at)
    })) || []

    return NextResponse.json({
      data: formattedTemplates,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      success: true
    })
  } catch (error) {
    console.error('Prompt templates API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const body: CreatePromptTemplateRequest = await request.json()
    
    // 验证必填字段
    if (!body.name || !body.template || !body.style || !body.complexity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabaseAdmin
      .from('prompt_templates')
      .insert({
        name: body.name,
        description: body.description || '',
        template: body.template,
        style: body.style,
        complexity: body.complexity,
        category: body.category || 'general',
        is_active: body.isActive !== false,
        is_default: body.isDefault || false,
        variables: body.variables || [],
        example_output: body.exampleOutput || '',
        sort_order: body.sortOrder || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating prompt template:', error)
      console.error('Error details:', error.message, error.code)
      
      if (error.code === 'PGRST116' || error.message?.includes('relation "prompt_templates" does not exist')) {
        return NextResponse.json(
          { error: 'Prompt templates table does not exist. Please run database migrations first.' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create prompt template: ' + error.message },
        { status: 500 }
      )
    }

    const formattedTemplate: PromptTemplate = {
      id: template.id,
      name: template.name,
      description: template.description || '',
      template: template.template,
      style: template.style,
      complexity: template.complexity,
      category: template.category,
      isActive: template.is_active,
      isDefault: template.is_default,
      variables: template.variables || [],
      exampleOutput: template.example_output || '',
      createdBy: template.created_by,
      sortOrder: template.sort_order,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at)
    }

    return NextResponse.json({
      data: formattedTemplate,
      success: true,
      message: 'Prompt template created successfully'
    })
  } catch (error) {
    console.error('Create prompt template API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}