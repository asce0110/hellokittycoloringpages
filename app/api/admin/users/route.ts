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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get total count
    const { count: total } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get users with pagination
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users: ' + error.message },
        { status: 500 }
      )
    }

    const formattedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isProUser: user.is_pro_user,
      generationsToday: user.generations_today,
      totalGenerations: user.total_generations,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at)
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit)
      }
    })

  } catch (error) {
    console.error('❌ Admin users API error:', error)
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
    const { userId, name, email, role, isProUser } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        name: name,
        email: email,
        role: role,
        is_pro_user: isProUser,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isProUser: updatedUser.is_pro_user,
        generationsToday: updatedUser.generations_today,
        totalGenerations: updatedUser.total_generations,
        createdAt: new Date(updatedUser.created_at),
        updatedAt: new Date(updatedUser.updated_at)
      }
    })

  } catch (error) {
    console.error('❌ Admin user update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Delete user (cascading delete should handle related records)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('❌ Error deleting user:', error)
      return NextResponse.json(
        { error: 'Failed to delete user: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('❌ Admin user delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}