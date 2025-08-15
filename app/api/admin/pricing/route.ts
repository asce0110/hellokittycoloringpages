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

    const { data: plans, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pricing plans: ' + error.message },
        { status: 500 }
      )
    }

    const formattedPlans = (plans || []).map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.price_monthly,
      priceYearly: plan.price_yearly,
      features: plan.features,
      generationsPerDay: plan.generations_per_day,
      highResolution: plan.high_resolution,
      noWatermark: plan.no_watermark,
      priorityGeneration: plan.priority_generation,
      isActive: plan.is_active,
      sortOrder: plan.sort_order,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at)
    }))

    return NextResponse.json({ success: true, data: formattedPlans })

  } catch (error) {
    console.error('❌ Admin pricing API error:', error)
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
    const { 
      id,
      name,
      description,
      priceMonthly,
      priceYearly,
      features,
      generationsPerDay,
      highResolution,
      noWatermark,
      priorityGeneration,
      isActive
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    const { data: plan, error } = await supabaseAdmin
      .from('pricing_plans')
      .update({
        name,
        description,
        price_monthly: priceMonthly,
        price_yearly: priceYearly,
        features,
        generations_per_day: generationsPerDay,
        high_resolution: highResolution,
        no_watermark: noWatermark,
        priority_generation: priorityGeneration,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating pricing plan:', error)
      return NextResponse.json(
        { error: 'Failed to update pricing plan: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing plan updated successfully',
      data: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.price_monthly,
        priceYearly: plan.price_yearly,
        features: plan.features,
        generationsPerDay: plan.generations_per_day,
        highResolution: plan.high_resolution,
        noWatermark: plan.no_watermark,
        priorityGeneration: plan.priority_generation,
        isActive: plan.is_active,
        sortOrder: plan.sort_order,
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at)
      }
    })

  } catch (error) {
    console.error('❌ Admin pricing update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}