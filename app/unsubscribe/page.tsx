"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"

function UnsubscribeForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'initial' | 'success' | 'error' | 'notfound'>('initial')
  const [message, setMessage] = useState('')

  // 从URL参数获取邮箱
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || isLoading) return

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/newsletter?action=unsubscribe&email=${encodeURIComponent(email)}`, {
        method: 'GET',
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to unsubscribe')
      }

    } catch (error) {
      console.error('Unsubscribe error:', error)
      setStatus('error')
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {status === 'initial' && (
            <>
              <div className="text-center mb-6">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Unsubscribe from Newsletter
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We're sorry to see you go. Enter your email to unsubscribe from our weekly coloring pages.
                </p>
              </div>

              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:border-gray-600"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unsubscribing...
                    </>
                  ) : (
                    'Unsubscribe'
                  )}
                </Button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                Successfully Unsubscribed
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                You will no longer receive our weekly coloring pages. 
                You can resubscribe anytime by visiting our homepage.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <a href="/">Return to Homepage</a>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                Unsubscribe Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => setStatus('initial')} 
                  className="w-full"
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <a href="/">Return to Homepage</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading unsubscribe page...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  )
}