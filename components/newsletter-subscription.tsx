"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Mail, CheckCircle, Loader2 } from "lucide-react"
import { useNewsletter } from "@/hooks/use-newsletter"
import { cn } from "@/lib/utils"

interface NewsletterSubscriptionProps {
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  showBenefits?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'sidebar'
  badgeText?: string
}

export function NewsletterSubscription({
  title = "Get New Coloring Pages Every Week",
  description = "Join our community of creative minds! Get exclusive, new coloring pages delivered to your inbox every week for free. Plus, be the first to know about seasonal collections and special offers.",
  placeholder = "Enter your email address",
  buttonText = "Join the Community",
  showBenefits = true,
  className = "",
  variant = "default",
  badgeText = "📧 Join Our Community"
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const { subscribe, isSubscribing } = useNewsletter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || isSubscribing) return

    const result = await subscribe(email.trim())
    
    if (result.success) {
      setIsSuccess(true)
      setEmail('')
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Reset success state when user starts typing again
    if (isSuccess) {
      setIsSuccess(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn("bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        
        {isSuccess ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Thanks for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800"
              disabled={isSubscribing}
              required
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={isSubscribing || !email.trim()}
              className="shrink-0"
            >
              {isSubscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("bg-white dark:bg-card p-6 rounded-lg shadow-sm border", className)}>
        <div className="text-center">
          <Mail className="h-8 w-8 mx-auto text-primary mb-3" />
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Get weekly coloring pages delivered to your inbox!
          </p>
          
          {isSuccess ? (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="text-sm font-medium">Successfully subscribed!</span>
              <span className="text-xs text-muted-foreground">Check your email for confirmation</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800"
                disabled={isSubscribing}
                required
              />
              <Button 
                type="submit" 
                size="sm" 
                className="w-full"
                disabled={isSubscribing || !email.trim()}
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            ✨ Free forever • No spam • Unsubscribe anytime
          </p>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("max-w-2xl mx-auto text-center", className)}>
      {badgeText && (
        <div className="mb-6">
          <Badge variant="outline" className="bg-white/90 text-primary border-primary/20 font-semibold">
            {badgeText}
          </Badge>
        </div>
      )}
      
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
        {description}
      </p>

      {isSuccess ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400">
              Welcome to our community! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-md">
              Thank you for subscribing! You'll receive your first batch of coloring pages soon. 
              Don't forget to check your spam folder just in case.
            </p>
            <p className="text-xs text-green-600 mt-2">
              📧 Your subscription has been recorded successfully
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSuccess(false)}
              className="mt-2 text-green-700 border-green-300 hover:bg-green-100"
            >
              Subscribe Another Email
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-lg max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input 
                type="email" 
                value={email}
                onChange={handleEmailChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 transition-colors"
                disabled={isSubscribing}
                required
              />
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 transition-colors"
                disabled={isSubscribing || !email.trim()}
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    {buttonText}
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              ✨ Free forever • No spam • Unsubscribe anytime
            </p>
          </div>
          
          {showBenefits && (
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Weekly new designs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Exclusive content</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Seasonal collections</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}