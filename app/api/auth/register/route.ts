import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { email, password, name } = body

    console.log('👤 User registration attempt:', { email, name })

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Database error while checking existing user' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const now = new Date().toISOString()
    const newUser = {
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: 'user',
      is_pro_user: false,
      generations_today: 0,
      total_generations: 0,
      created_at: now,
      updated_at: now
    }

    const { data: user, error: createError } = await supabaseAdmin
      .from('users')
      .insert(newUser)
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user: ' + createError.message },
        { status: 500 }
      )
    }

    console.log('✅ User created successfully:', user.id)

    // Return user data (without password)
    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isProUser: user.is_pro_user,
      generationsToday: user.generations_today,
      totalGenerations: user.total_generations,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: responseUser
    })

  } catch (error) {
    console.error('❌ Registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}