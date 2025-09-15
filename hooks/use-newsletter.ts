import { useState, useCallback } from 'react'
import { showToast } from '@/lib/toast'

export interface NewsletterSubscription {
  success: boolean
  message: string
  isAlreadySubscribed?: boolean
  isReactivation?: boolean
  isNewSubscription?: boolean
  error?: string
}

export interface NewsletterStats {
  active: number
  total: number
  inactive: number
}

export function useNewsletter() {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)

  const subscribe = useCallback(async (email: string): Promise<NewsletterSubscription> => {
    if (isSubscribing) {
      return { success: false, message: 'Subscription in progress...' }
    }

    // Validate email format on client side
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      const errorMsg = 'Please enter a valid email address'
      showToast.error('Invalid Email', errorMsg)
      return { success: false, message: errorMsg, error: errorMsg }
    }

    setIsSubscribing(true)
    
    try {
      console.log('📧 Subscribing to newsletter:', email)
      
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()
      
      console.log('📧 Newsletter subscription response:', {
        status: response.status,
        success: data.success,
        message: data.message,
        isAlreadySubscribed: data.isAlreadySubscribed,
        isReactivation: data.isReactivation,
        isNewSubscription: data.isNewSubscription
      })

      if (data.success) {
        if (data.isReactivation) {
          showToast.success('Welcome Back!', data.message)
        } else if (data.isNewSubscription) {
          showToast.success('Successfully Subscribed!', data.message)
        } else {
          showToast.success('Subscribed!', data.message)
        }
      } else {
        if (data.isAlreadySubscribed) {
          showToast.warning('Already Subscribed', data.error || data.message)
        } else {
          showToast.error('Subscription Failed', data.error || data.message)
        }
      }

      return data

    } catch (error) {
      console.error('Newsletter subscription error:', error)
      const errorMessage = 'Network error occurred. Please check your connection and try again.'
      showToast.error('Connection Error', errorMessage)
      return { 
        success: false, 
        message: errorMessage,
        error: errorMessage 
      }
    } finally {
      setIsSubscribing(false)
    }
  }, [isSubscribing])

  const unsubscribe = useCallback(async (email: string, token?: string): Promise<NewsletterSubscription> => {
    if (isUnsubscribing) {
      return { success: false, message: 'Unsubscribe in progress...' }
    }

    setIsUnsubscribing(true)
    
    try {
      console.log('📧 Unsubscribing from newsletter:', email)
      
      const params = new URLSearchParams({
        action: 'unsubscribe',
        email: email.toLowerCase().trim()
      })
      
      if (token) {
        params.append('token', token)
      }

      const response = await fetch(`/api/newsletter?${params}`, {
        method: 'GET',
      })

      const data = await response.json()
      
      console.log('📧 Newsletter unsubscribe response:', {
        status: response.status,
        success: data.success,
        message: data.message
      })

      if (data.success) {
        showToast.success('Unsubscribed', data.message)
      } else {
        showToast.error('Unsubscribe Failed', data.error || data.message)
      }

      return data

    } catch (error) {
      console.error('Newsletter unsubscribe error:', error)
      const errorMessage = 'Failed to unsubscribe. Please try again.'
      showToast.error('Connection Error', errorMessage)
      return { 
        success: false, 
        message: errorMessage,
        error: errorMessage 
      }
    } finally {
      setIsUnsubscribing(false)
    }
  }, [isUnsubscribing])

  const getStats = useCallback(async (): Promise<NewsletterStats | null> => {
    try {
      console.log('📊 Fetching newsletter stats')
      
      const response = await fetch('/api/newsletter', {
        method: 'GET',
      })

      const data = await response.json()
      
      if (data.success && data.stats) {
        console.log('📊 Newsletter stats:', data.stats)
        return data.stats
      } else {
        console.error('Failed to fetch newsletter stats:', data.error)
        return null
      }

    } catch (error) {
      console.error('Newsletter stats error:', error)
      return null
    }
  }, [])

  return {
    subscribe,
    unsubscribe,
    getStats,
    isSubscribing,
    isUnsubscribing
  }
}