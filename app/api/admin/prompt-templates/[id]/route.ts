import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PromptTemplate, UpdatePromptTemplateRequest } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { id } = await params
    
    const { data: template, error } = await supabaseAdmin
      .from('prompt_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching prompt template:', error)
      return NextResponse.json(
        { error: 'Prompt template not found' },
        { status: 404 }
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
      success: true
    })
  } catch (error) {
    console.error('Get prompt template API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { id } = await params
    const body: Partial<UpdatePromptTemplateRequest> = await request.json()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.template !== undefined) updateData.template = body.template
    if (body.style !== undefined) updateData.style = body.style
    if (body.complexity !== undefined) updateData.complexity = body.complexity
    if (body.category !== undefined) updateData.category = body.category
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.isDefault !== undefined) updateData.is_default = body.isDefault
    if (body.variables !== undefined) updateData.variables = body.variables
    if (body.exampleOutput !== undefined) updateData.example_output = body.exampleOutput
    if (body.sortOrder !== undefined) updateData.sort_order = body.sortOrder

    const { data: template, error } = await supabaseAdmin
      .from('prompt_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prompt template:', error)
      return NextResponse.json(
        { error: 'Failed to update prompt template: ' + error.message },
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
      message: 'Prompt template updated successfully'
    })
  } catch (error) {
    console.error('Update prompt template API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { id } = await params

    const { error } = await supabaseAdmin
      .from('prompt_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting prompt template:', error)
      return NextResponse.json(
        { error: 'Failed to delete prompt template: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt template deleted successfully'
    })
  } catch (error) {
    console.error('Delete prompt template API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}