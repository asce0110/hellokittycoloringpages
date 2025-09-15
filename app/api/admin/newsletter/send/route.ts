import { NextRequest, NextResponse } from 'next/server'
import { EmailService, getEmailConfig, processEmailTemplate, loadEmailTemplate } from '@/lib/email-service'
import { supabaseAdmin } from '@/lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

interface NewsletterSendRequest {
  subject: string
  content?: string
  useTemplate?: boolean
  templateName?: string
  templateVariables?: Record<string, string>
  testEmail?: string // For testing, send only to this email
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterSendRequest = await request.json()
    const { subject, content, useTemplate, templateName, templateVariables, testEmail } = body

    // Validate required fields
    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject is required' },
        { status: 400 }
      )
    }

    // Get email configuration
    const emailConfig = getEmailConfig()
    if (!emailConfig) {
      return NextResponse.json(
        { success: false, error: 'Email service not configured. Please configure EMAIL_PROVIDER, EMAIL_API_KEY, and EMAIL_FROM in environment variables.' },
        { status: 500 }
      )
    }

    // Initialize email service
    const emailService = new EmailService(emailConfig)

    // Get newsletter subscribers
    let recipients: string[] = []
    
    if (testEmail) {
      // Test mode: send only to specified email
      recipients = [testEmail]
    } else {
      // Get active subscribers from database or file
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from('newsletter_subscriptions')
            .select('email')
            .eq('is_active', true)

          if (error) {
            console.log('Database query failed, trying file fallback:', error)
            // Fallback to file storage
            const fallbackPath = join(process.cwd(), 'data', 'newsletter-subscribers.json')
            try {
              const fallbackData = JSON.parse(readFileSync(fallbackPath, 'utf-8'))
              recipients = fallbackData
                .filter((sub: any) => sub.is_active)
                .map((sub: any) => sub.email)
            } catch (fileError) {
              console.error('File fallback also failed:', fileError)
              return NextResponse.json(
                { success: false, error: 'No subscribers found' },
                { status: 404 }
              )
            }
          } else {
            recipients = data.map(sub => sub.email)
          }
        } else {
          throw new Error('Supabase not configured')
        }
      } catch (dbError) {
        console.error('Database error, trying file fallback:', dbError)
        // Fallback to file storage
        const fallbackPath = join(process.cwd(), 'data', 'newsletter-subscribers.json')
        try {
          const fallbackData = JSON.parse(readFileSync(fallbackPath, 'utf-8'))
          recipients = fallbackData
            .filter((sub: any) => sub.is_active)
            .map((sub: any) => sub.email)
        } catch (fileError) {
          console.error('File fallback also failed:', fileError)
          return NextResponse.json(
            { success: false, error: 'No subscribers found' },
            { status: 404 }
          )
        }
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active subscribers found' },
        { status: 404 }
      )
    }

    // Prepare email content
    let htmlContent: string
    let textContent: string | undefined

    if (useTemplate && templateName) {
      // Use email template
      const template = loadEmailTemplate(templateName)
      if (!template) {
        return NextResponse.json(
          { success: false, error: `Template '${templateName}' not found` },
          { status: 404 }
        )
      }

      // Process template variables
      const variables = {
        ...templateVariables,
        unsubscribe_url: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email={{subscriber_email}}`,
        base_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://coloringpagesprintable.net'
      }

      htmlContent = processEmailTemplate(template, variables)
      
      // Generate text version (basic HTML to text conversion)
      textContent = htmlContent
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
    } else {
      // Use custom content
      if (!content) {
        return NextResponse.json(
          { success: false, error: 'Content is required when not using template' },
          { status: 400 }
        )
      }
      
      htmlContent = content
      textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    }

    // Add unsubscribe links to each email
    const emailsToSend = recipients.map(email => {
      const personalizedHtml = htmlContent.replace(/{{subscriber_email}}/g, encodeURIComponent(email))
      return {
        email,
        htmlContent: personalizedHtml
      }
    })

    // Send emails in batches to avoid rate limits
    const BATCH_SIZE = 50
    const batches = []
    for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
      batches.push(emailsToSend.slice(i, i + BATCH_SIZE))
    }

    let totalSent = 0
    const errors: string[] = []

    for (const batch of batches) {
      try {
        const result = await emailService.sendNewsletter({
          subject,
          htmlContent: batch[0].htmlContent, // Use first email's content (they should be similar)
          textContent,
          recipients: batch.map(item => item.email)
        })

        if (result.success) {
          totalSent += result.sent
        } else {
          errors.push(...result.errors)
        }

        // Add delay between batches to respect rate limits
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (batchError) {
        console.error('Batch send error:', batchError)
        errors.push(`Batch error: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: totalSent > 0,
      sent: totalSent,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
      message: testEmail 
        ? `Test email sent to ${testEmail}` 
        : `Newsletter sent to ${totalSent} of ${recipients.length} subscribers`
    })

  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send newsletter' 
      },
      { status: 500 }
    )
  }
}

// Test email configuration
export async function GET(request: NextRequest) {
  try {
    const emailConfig = getEmailConfig()
    if (!emailConfig) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'Email service not configured'
      })
    }

    const emailService = new EmailService(emailConfig)
    const testResult = await emailService.testConfiguration()

    return NextResponse.json({
      success: testResult.success,
      configured: true,
      provider: emailConfig.provider,
      fromEmail: emailConfig.fromEmail,
      message: testResult.message
    })
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({
      success: false,
      configured: false,
      message: error instanceof Error ? error.message : 'Test failed'
    })
  }
}