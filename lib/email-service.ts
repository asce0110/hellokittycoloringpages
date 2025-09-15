// Email service configuration and utilities
import { readFileSync } from 'fs'
import { join } from 'path'

// Email service types
export type EmailProvider = 'resend' | 'sendgrid' | 'mailgun' | 'nodemailer'

export interface EmailConfig {
  provider: EmailProvider
  apiKey: string
  fromEmail: string
  fromName: string
  replyTo?: string
}

export interface NewsletterEmail {
  subject: string
  htmlContent: string
  textContent?: string
  recipients: string[]
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlTemplate: string
  variables: string[]
}

// Email service class
export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  // Send newsletter to multiple recipients
  async sendNewsletter(newsletter: NewsletterEmail): Promise<{ success: boolean; sent: number; errors: string[] }> {
    try {
      switch (this.config.provider) {
        case 'resend':
          return await this.sendWithResend(newsletter)
        case 'sendgrid':
          return await this.sendWithSendGrid(newsletter)
        case 'mailgun':
          return await this.sendWithMailgun(newsletter)
        case 'nodemailer':
          return await this.sendWithNodemailer(newsletter)
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error)
      return {
        success: false,
        sent: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  // Resend implementation
  private async sendWithResend(newsletter: NewsletterEmail) {
    const { Resend } = await import('resend')
    const resend = new Resend(this.config.apiKey)

    try {
      const result = await resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: newsletter.recipients,
        subject: newsletter.subject,
        html: newsletter.htmlContent,
        text: newsletter.textContent,
        replyTo: this.config.replyTo,
      })

      return {
        success: true,
        sent: newsletter.recipients.length,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        sent: 0,
        errors: [error instanceof Error ? error.message : 'Resend API error']
      }
    }
  }

  // SendGrid implementation
  private async sendWithSendGrid(newsletter: NewsletterEmail) {
    const sgMail = await import('@sendgrid/mail')
    sgMail.default.setApiKey(this.config.apiKey)

    try {
      const msg = {
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        personalizations: newsletter.recipients.map(email => ({
          to: [{ email }],
          subject: newsletter.subject
        })),
        content: [
          {
            type: 'text/html',
            value: newsletter.htmlContent
          }
        ]
      }

      await sgMail.default.send(msg as any)
      
      return {
        success: true,
        sent: newsletter.recipients.length,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        sent: 0,
        errors: [error instanceof Error ? error.message : 'SendGrid API error']
      }
    }
  }

  // Mailgun implementation
  private async sendWithMailgun(newsletter: NewsletterEmail) {
    // Implementation for Mailgun
    const formData = new FormData()
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`)
    formData.append('to', newsletter.recipients.join(','))
    formData.append('subject', newsletter.subject)
    formData.append('html', newsletter.htmlContent)
    if (newsletter.textContent) {
      formData.append('text', newsletter.textContent)
    }

    try {
      const domain = process.env.MAILGUN_DOMAIN
      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
        },
        body: formData
      })

      if (response.ok) {
        return {
          success: true,
          sent: newsletter.recipients.length,
          errors: []
        }
      } else {
        const error = await response.text()
        return {
          success: false,
          sent: 0,
          errors: [error]
        }
      }
    } catch (error) {
      return {
        success: false,
        sent: 0,
        errors: [error instanceof Error ? error.message : 'Mailgun API error']
      }
    }
  }

  // Nodemailer implementation (for SMTP)
  private async sendWithNodemailer(newsletter: NewsletterEmail) {
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: this.config.apiKey // Using apiKey as password for SMTP
      }
    })

    try {
      const results = await Promise.allSettled(
        newsletter.recipients.map(email =>
          transporter.sendMail({
            from: `${this.config.fromName} <${this.config.fromEmail}>`,
            to: email,
            subject: newsletter.subject,
            html: newsletter.htmlContent,
            text: newsletter.textContent,
            replyTo: this.config.replyTo,
          })
        )
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason?.message || 'Unknown error')

      return {
        success: successful > 0,
        sent: successful,
        errors
      }
    } catch (error) {
      return {
        success: false,
        sent: 0,
        errors: [error instanceof Error ? error.message : 'Nodemailer error']
      }
    }
  }

  // Test email configuration
  async testConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const testEmail: NewsletterEmail = {
        subject: 'Test Email - Coloring Pages Printable',
        htmlContent: '<h1>Test Email</h1><p>Your email configuration is working correctly!</p>',
        textContent: 'Test Email - Your email configuration is working correctly!',
        recipients: [this.config.fromEmail] // Send to self
      }

      const result = await this.sendNewsletter(testEmail)
      
      if (result.success) {
        return {
          success: true,
          message: 'Test email sent successfully!'
        }
      } else {
        return {
          success: false,
          message: `Test email failed: ${result.errors.join(', ')}`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      }
    }
  }
}

// Template processing utility
export function processEmailTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let processed = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    processed = processed.replace(regex, value)
  })
  
  return processed
}

// Load email template from file
export function loadEmailTemplate(templateName: string): string {
  try {
    const templatePath = join(process.cwd(), 'email-templates', `${templateName}.html`)
    return readFileSync(templatePath, 'utf-8')
  } catch (error) {
    console.warn(`Failed to load template ${templateName}:`, error)
    return ''
  }
}

// Default email configuration
export function getEmailConfig(): EmailConfig | null {
  const provider = process.env.EMAIL_PROVIDER as EmailProvider
  const apiKey = process.env.EMAIL_API_KEY
  const fromEmail = process.env.EMAIL_FROM || process.env.ADMIN_EMAIL
  const fromName = process.env.EMAIL_FROM_NAME || 'Coloring Pages Printable'

  if (!provider || !apiKey || !fromEmail) {
    console.warn('Email configuration incomplete')
    return null
  }

  return {
    provider,
    apiKey,
    fromEmail,
    fromName,
    replyTo: process.env.EMAIL_REPLY_TO || fromEmail
  }
}