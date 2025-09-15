import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Newsletter subscription type
interface NewsletterSubscription {
  id: string
  email: string
  is_active: boolean
  source: string
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
  updated_at: string
  unsubscribed_at?: string | null
  resubscribed_at?: string | null
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Newsletter API: Starting subscription request')
    
    const body = await request.json()
    const { email } = body

    console.log('📧 Newsletter API: Received email:', email)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      console.log('❌ Newsletter API: Invalid email format')
      return NextResponse.json({
        success: false,
        error: 'Please provide a valid email address'
      }, { status: 400 })
    }

    console.log('📧 Newsletter API: Checking existing subscription for:', email)

    // Check if table exists first by trying a simple query
    try {
      const { data: testQuery, error: testError } = await supabase
        .from('newsletter_subscriptions')
        .select('id')
        .limit(1)
      
      console.log('📧 Newsletter API: Table test result:', { success: !testError, error: testError?.message })
      
      if (testError) {
        console.error('❌ Newsletter API: Table does not exist or connection failed:', testError)
        console.log('📝 Newsletter API: Using fallback file storage')
        
        // Fallback: Store in file system (temporary solution)
        try {
          const fs = require('fs')
          const path = require('path')
          
          const subscribersFile = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')
          
          // Ensure data directory exists
          const dataDir = path.dirname(subscribersFile)
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
          }
          
          // Read existing subscribers
          let subscribers: NewsletterSubscription[] = []
          if (fs.existsSync(subscribersFile)) {
            try {
              const content = fs.readFileSync(subscribersFile, 'utf8')
              subscribers = JSON.parse(content)
            } catch (parseError) {
              console.log('📝 Creating new subscribers file')
              subscribers = []
            }
          }
          
          // Check if email already exists
          const existingIndex = subscribers.findIndex((sub: NewsletterSubscription) => sub.email.toLowerCase() === email.toLowerCase())
          
          if (existingIndex >= 0) {
            const existing = subscribers[existingIndex]
            if (existing.is_active) {
              return NextResponse.json({
                success: false,
                error: 'You are already subscribed to our newsletter!',
                isAlreadySubscribed: true
              }, { status: 409 })
            } else {
              // Reactivate
              subscribers[existingIndex].is_active = true
              subscribers[existingIndex].updated_at = new Date().toISOString()
              subscribers[existingIndex].resubscribed_at = new Date().toISOString()
              
              fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2))
              
              return NextResponse.json({
                success: true,
                message: 'Welcome back! Your newsletter subscription has been reactivated.',
                isReactivation: true
              })
            }
          }
          
          // Add new subscription
          const newSubscription: NewsletterSubscription = {
            id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email: email.toLowerCase(),
            is_active: true,
            source: 'homepage-fallback',
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
            user_agent: request.headers.get('user-agent') || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            unsubscribed_at: null,
            resubscribed_at: null
          }
          
          subscribers.push(newSubscription)
          fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2))
          
          console.log('✅ Newsletter API: Fallback subscription saved')
          
          return NextResponse.json({
            success: true,
            message: 'Thank you for subscribing! You\'ll receive new coloring pages every week. (Using fallback storage)',
            isNewSubscription: true
          })
          
        } catch (fallbackError) {
          console.error('❌ Newsletter API: Fallback storage failed:', fallbackError)
          return NextResponse.json({
            success: false,
            error: 'Newsletter service is temporarily unavailable. Please try again later.'
          }, { status: 503 })
        }
      }
    } catch (tableError) {
      console.error('❌ Newsletter API: Table access error:', tableError)
      return NextResponse.json({
        success: false,
        error: 'Newsletter service is not available yet. Please try again later.'
      }, { status: 503 })
    }

    // Check if email already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id, is_active, created_at')
      .eq('email', email.toLowerCase())
      .single()

    console.log('📧 Newsletter API: Existing subscription check:', { 
      found: !!existingSubscription, 
      error: checkError?.message,
      code: checkError?.code 
    })

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Newsletter API: Error checking existing subscription:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Database error occurred'
      }, { status: 500 })
    }

    // If subscription exists
    if (existingSubscription) {
      if (existingSubscription.is_active) {
        return NextResponse.json({
          success: false,
          error: 'You are already subscribed to our newsletter!',
          isAlreadySubscribed: true
        }, { status: 409 })
      } else {
        // Reactivate existing subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({ 
            is_active: true, 
            updated_at: new Date().toISOString(),
            resubscribed_at: new Date().toISOString()
          })
          .eq('id', existingSubscription.id)

        if (updateError) {
          console.error('Error reactivating subscription:', updateError)
          return NextResponse.json({
            success: false,
            error: 'Failed to reactivate subscription'
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your newsletter subscription has been reactivated.',
          isReactivation: true
        })
      }
    }

    // Create new subscription
    console.log('📧 Newsletter API: Creating new subscription')
    
    const subscriptionData = {
      email: email.toLowerCase(),
      is_active: true,
      source: 'homepage',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('📧 Newsletter API: Subscription data:', subscriptionData)
    
    const { data: insertData, error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert([subscriptionData])
      .select()

    console.log('📧 Newsletter API: Insert result:', { 
      success: !insertError, 
      data: insertData, 
      error: insertError?.message 
    })

    if (insertError) {
      console.error('❌ Newsletter API: Error creating subscription:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to subscribe. Please try again.'
      }, { status: 500 })
    }

    console.log('✅ Newsletter API: Subscription created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! You\'ll receive new coloring pages every week.',
      isNewSubscription: true
    })

  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (action === 'unsubscribe' && email && token) {
      // Simple unsubscribe functionality
      // In a real app, you'd want to use proper signed tokens
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString(),
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())

      if (error) {
        console.error('Error unsubscribing:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to unsubscribe'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'You have been successfully unsubscribed from our newsletter.'
      })
    }

    // Get subscription stats (admin only)
    const { data: stats, error: statsError } = await supabase
      .from('newsletter_subscriptions')
      .select('is_active')

    if (statsError) {
      console.error('Error fetching stats:', statsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch stats'
      }, { status: 500 })
    }

    const activeSubscriptions = stats.filter(sub => sub.is_active).length
    const totalSubscriptions = stats.length

    return NextResponse.json({
      success: true,
      stats: {
        active: activeSubscriptions,
        total: totalSubscriptions,
        inactive: totalSubscriptions - activeSubscriptions
      }
    })

  } catch (error) {
    console.error('Newsletter GET API error:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}