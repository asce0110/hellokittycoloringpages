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

export async function GET(request: NextRequest) {
  try {
    console.log('👑 Admin Newsletter API: Fetching all subscriptions')

    // Try database first
    try {
      const { data: dbSubscriptions, error: dbError } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!dbError && dbSubscriptions) {
        console.log(`✅ Admin Newsletter API: Found ${dbSubscriptions.length} database subscriptions`)
        
        const stats = {
          total: dbSubscriptions.length,
          active: dbSubscriptions.filter((sub: NewsletterSubscription) => sub.is_active).length,
          inactive: dbSubscriptions.filter((sub: NewsletterSubscription) => !sub.is_active).length
        }

        return NextResponse.json({
          success: true,
          source: 'database',
          subscriptions: dbSubscriptions,
          stats
        })
      }
    } catch (dbError) {
      console.log('⚠️ Admin Newsletter API: Database not available, trying fallback')
    }

    // Fallback: Try file storage
    try {
      const fs = require('fs')
      const path = require('path')
      
      const subscribersFile = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')
      
      if (fs.existsSync(subscribersFile)) {
        const content = fs.readFileSync(subscribersFile, 'utf8')
        const fallbackSubscriptions: NewsletterSubscription[] = JSON.parse(content)
        
        console.log(`✅ Admin Newsletter API: Found ${fallbackSubscriptions.length} fallback subscriptions`)
        
        const stats = {
          total: fallbackSubscriptions.length,
          active: fallbackSubscriptions.filter((sub: NewsletterSubscription) => sub.is_active).length,
          inactive: fallbackSubscriptions.filter((sub: NewsletterSubscription) => !sub.is_active).length
        }

        return NextResponse.json({
          success: true,
          source: 'fallback',
          subscriptions: fallbackSubscriptions,
          stats
        })
      } else {
        console.log('ℹ️ Admin Newsletter API: No subscriptions found')
        return NextResponse.json({
          success: true,
          source: 'none',
          subscriptions: [],
          stats: { total: 0, active: 0, inactive: 0 }
        })
      }
    } catch (fallbackError) {
      console.error('❌ Admin Newsletter API: Fallback failed:', fallbackError)
      return NextResponse.json({
        success: false,
        error: 'Unable to access newsletter subscriptions'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Admin Newsletter API error:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}