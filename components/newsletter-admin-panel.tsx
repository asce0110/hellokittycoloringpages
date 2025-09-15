"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Mail, 
  Send, 
  TestTube, 
  Settings, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  AlertCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EmailConfig {
  configured: boolean
  provider?: string
  fromEmail?: string
  message?: string
}

interface NewsletterStats {
  total: number
  active: number
  unsubscribed: number
}

export function NewsletterAdminPanel() {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({ configured: false })
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats>({ total: 0, active: 0, unsubscribed: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  // Email composition state
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [useTemplate, setUseTemplate] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('newsletter-template')
  const [testEmail, setTestEmail] = useState('')
  
  // Template variables
  const [templateVars, setTemplateVars] = useState({
    week: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    image1_title: 'Beautiful Fairy Princess',
    image1_url: 'https://example.com/image1.jpg',
    image1_download_link: 'https://coloringpagesprintable.net/library',
    image2_title: 'Magical Castle',
    image2_url: 'https://example.com/image2.jpg',
    image2_download_link: 'https://coloringpagesprintable.net/library',
    weekly_tip: 'Try using watercolor pencils for a soft, dreamy effect on your coloring pages!'
  })

  // Load email configuration and stats on component mount
  useEffect(() => {
    loadEmailConfig()
    loadNewsletterStats()
  }, [])

  const loadEmailConfig = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/send')
      const data = await response.json()
      setEmailConfig(data)
    } catch (error) {
      console.error('Failed to load email config:', error)
      setEmailConfig({ configured: false, message: 'Failed to load configuration' })
    }
  }

  const loadNewsletterStats = async () => {
    try {
      const response = await fetch('/api/admin/newsletter')
      const data = await response.json()
      if (data.success) {
        setNewsletterStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load newsletter stats:', error)
    }
  }

  const testEmailConfiguration = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/admin/newsletter/send')
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "✅ Test Email Sent",
          description: data.message,
        })
      } else {
        toast({
          title: "❌ Test Failed",
          description: data.message,
          variant: "destructive"
        })
      }
      
      setEmailConfig(data)
    } catch (error) {
      toast({
        title: "❌ Test Error",
        description: "Failed to test email configuration",
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const sendTestNewsletter = async () => {
    if (!testEmail) {
      toast({
        title: "❌ Test Email Required",
        description: "Please enter a test email address",
        variant: "destructive"
      })
      return
    }

    if (!emailSubject) {
      toast({
        title: "❌ Subject Required",
        description: "Please enter an email subject",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)
    try {
      const requestBody = {
        subject: emailSubject,
        useTemplate,
        templateName: selectedTemplate,
        templateVariables: templateVars,
        content: useTemplate ? undefined : emailContent,
        testEmail
      }

      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "✅ Test Newsletter Sent",
          description: data.message,
        })
      } else {
        toast({
          title: "❌ Test Failed",
          description: data.error || 'Failed to send test newsletter',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "❌ Send Error",
        description: "Failed to send test newsletter",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const sendNewsletter = async () => {
    if (!emailSubject) {
      toast({
        title: "❌ Subject Required",
        description: "Please enter an email subject",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)
    try {
      const requestBody = {
        subject: emailSubject,
        useTemplate,
        templateName: selectedTemplate,
        templateVariables: templateVars,
        content: useTemplate ? undefined : emailContent
      }

      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "✅ Newsletter Sent Successfully",
          description: data.message,
        })
        // Reload stats after sending
        loadNewsletterStats()
      } else {
        toast({
          title: "❌ Send Failed",
          description: data.error || 'Failed to send newsletter',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "❌ Send Error",
        description: "Failed to send newsletter",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure your email service to send newsletters to subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {emailConfig.configured ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Configured
                </Badge>
              )}
              
              {emailConfig.provider && (
                <Badge variant="outline">
                  Provider: {emailConfig.provider.toUpperCase()}
                </Badge>
              )}
              
              {emailConfig.fromEmail && (
                <Badge variant="outline">
                  From: {emailConfig.fromEmail}
                </Badge>
              )}
            </div>
            
            <Button
              onClick={testEmailConfiguration}
              disabled={isTesting || !emailConfig.configured}
              variant="outline"
              size="sm"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Configuration
                </>
              )}
            </Button>
          </div>
          
          {emailConfig.message && (
            <p className="text-sm text-muted-foreground mt-2">
              {emailConfig.message}
            </p>
          )}
          
          {!emailConfig.configured && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Setup Required</p>
                  <p className="text-yellow-700 mt-1">
                    To send newsletters, please configure the following environment variables:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
                    <li><code>EMAIL_PROVIDER</code> - Choose: resend, sendgrid, mailgun, nodemailer</li>
                    <li><code>EMAIL_API_KEY</code> - Your email service API key</li>
                    <li><code>EMAIL_FROM</code> - From email address</li>
                    <li><code>EMAIL_FROM_NAME</code> - From name (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Newsletter Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscriber Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{newsletterStats.total}</p>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{newsletterStats.active}</p>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{newsletterStats.unsubscribed}</p>
              <p className="text-sm text-muted-foreground">Unsubscribed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Newsletter
          </CardTitle>
          <CardDescription>
            Create and send newsletters to your subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="🎨 New Coloring Pages This Week!"
              />
            </div>

            <Tabs defaultValue="template" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template" onClick={() => setUseTemplate(true)}>
                  Use Template
                </TabsTrigger>
                <TabsTrigger value="custom" onClick={() => setUseTemplate(false)}>
                  Custom Content
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="template" className="space-y-4">
                <div>
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter-template">Weekly Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="week">Week</Label>
                    <Input
                      id="week"
                      value={templateVars.week}
                      onChange={(e) => setTemplateVars(prev => ({ ...prev, week: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekly_tip">Weekly Tip</Label>
                    <Input
                      id="weekly_tip"
                      value={templateVars.weekly_tip}
                      onChange={(e) => setTemplateVars(prev => ({ ...prev, weekly_tip: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Featured Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Image 1 Title"
                        value={templateVars.image1_title}
                        onChange={(e) => setTemplateVars(prev => ({ ...prev, image1_title: e.target.value }))}
                      />
                      <Input
                        placeholder="Image 1 URL"
                        value={templateVars.image1_url}
                        onChange={(e) => setTemplateVars(prev => ({ ...prev, image1_url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Image 2 Title"
                        value={templateVars.image2_title}
                        onChange={(e) => setTemplateVars(prev => ({ ...prev, image2_title: e.target.value }))}
                      />
                      <Input
                        placeholder="Image 2 URL"
                        value={templateVars.image2_url}
                        onChange={(e) => setTemplateVars(prev => ({ ...prev, image2_url: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div>
                  <Label htmlFor="content">Email Content (HTML)</Label>
                  <Textarea
                    id="content"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Enter your HTML email content here..."
                    rows={10}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Test Email Section */}
            <div className="border-t pt-4">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
                <Button
                  onClick={sendTestNewsletter}
                  disabled={isSending || !emailConfig.configured}
                  variant="outline"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Send a test email to verify your content before sending to all subscribers
              </p>
            </div>

            {/* Send Newsletter */}
            <div className="border-t pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!emailConfig.configured || newsletterStats.active === 0 || isSending}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Newsletter...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Newsletter to {newsletterStats.active} Subscribers
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send Newsletter</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to send this newsletter to {newsletterStats.active} active subscribers?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={sendNewsletter}>
                      Send Newsletter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}