"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, CheckCircle, Loader2 } from "lucide-react"

export function SimpleNewsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || isLoading) return

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setEmail('')
        setMessage(data.message)
        
        // Reset success state after 5 seconds
        setTimeout(() => {
          setIsSuccess(false)
          setMessage('')
        }, 5000)
      } else {
        setMessage(data.error || 'Subscription failed. Please try again.')
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400">
              Welcome to our community! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-md">
              {message}
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
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-6">
        <Badge variant="outline" className="bg-white/90 text-primary border-primary/20 font-semibold">
          📧 Join Our Community
        </Badge>
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Get New Coloring Pages Every Week
      </h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
        Join our community of creative minds! Get exclusive, new coloring pages delivered to your inbox every week for free. 
        Plus, be the first to know about seasonal collections and special offers.
      </p>

      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-lg max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 transition-colors"
            disabled={isLoading}
            required
          />
          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-5 w-5" />
                Join the Community
              </>
            )}
          </Button>
        </form>
        {message && (
          <p className={`text-xs mt-3 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          ✨ Free forever • No spam • Unsubscribe anytime
        </p>
      </div>
      
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
    </div>
  )
}