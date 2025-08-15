import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { userId, name, email, preferences } = body

    console.log('👤 User update request:', { userId, name, email, preferences })

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if the user exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', checkError)
      return NextResponse.json(
        { error: 'Database error while checking user' },
        { status: 500 }
      )
    }

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If email is being changed, check if it's already taken by another user
    if (email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const { data: emailTaken, error: emailCheckError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .neq('id', userId)
        .single()

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('❌ Error checking email availability:', emailCheckError)
        return NextResponse.json(
          { error: 'Database error while checking email availability' },
          { status: 500 }
        )
      }

      if (emailTaken) {
        return NextResponse.json(
          { error: 'This email is already taken by another user' },
          { status: 409 }
        )
      }
    }

    // Update user information
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      updated_at: new Date().toISOString()
    }

    // If preferences are provided, we could store them in a preferences JSON field
    // For now, we'll just log them (assuming preferences are handled client-side)
    if (preferences) {
      console.log('User preferences update:', preferences)
      // In a real app, you might have a preferences column in users table:
      // updateData.preferences = preferences
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user: ' + updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ User updated successfully:', updatedUser.id)

    // Return updated user data
    const responseUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      isProUser: updatedUser.is_pro_user,
      generationsToday: updatedUser.generations_today,
      totalGenerations: updatedUser.total_generations,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    }

    return NextResponse.json({
      success: true,
      message: 'User information updated successfully',
      user: responseUser
    })

  } catch (error) {
    console.error('❌ User update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}