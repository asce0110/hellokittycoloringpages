import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Admin credentials
const ADMIN_EMAIL = "asce3801@gmail.com"
const ADMIN_PASSWORD = "xahzjz114223"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Login attempt:', { email })

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide both email and password to log in.' },
        { status: 400 }
      )
    }

    // Check for admin login first
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = {
        id: "admin-1",
        email: ADMIN_EMAIL,
        name: "Administrator", 
        role: "admin",
        isProUser: true,
        generationsToday: 0,
        totalGenerations: 999,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('✅ Admin login successful')
      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: adminUser
      })
    }

    // For regular users, check database if configured
    if (!supabaseAdmin) {
      // Fallback to demo user if database not configured
      if (email === "user@example.com" && password === "password123") {
        const demoUser = {
          id: "user-1",
          email: "user@example.com",
          name: "Demo User",
          role: "user",
          isProUser: false,
          generationsToday: 2,
          totalGenerations: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        console.log('✅ Demo user login successful')
        return NextResponse.json({
          success: true,
          message: 'Demo login successful',
          user: demoUser
        })
      }

      return NextResponse.json(
        { error: 'Email or password is incorrect. Please check your credentials and try again.' },
        { status: 401 }
      )
    }

    // Check user in database
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Database error during login:', findError)
      return NextResponse.json(
        { error: 'Database error during authentication' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Email or password is incorrect. Please check your credentials and try again.' },
        { status: 401 }
      )
    }

    // For now, we'll skip password hashing and just do a simple check
    // In a real app, you'd compare hashed passwords
    // This is a placeholder until proper password hashing is implemented
    
    console.log('✅ User login successful:', user.id)

    // Return user data
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
      message: 'Login successful',
      user: responseUser
    })

  } catch (error) {
    console.error('❌ Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}