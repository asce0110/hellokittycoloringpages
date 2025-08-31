"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name?: string) => Promise<void>
  updateUser: (updatedUser: User) => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin credentials
const ADMIN_EMAIL = "asce3801@gmail.com"
const ADMIN_PASSWORD = "xahzjz114223"

// Real admin user from database
const realAdminUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440100", // 与demo-data.ts中的adminUser保持一致
  email: ADMIN_EMAIL,
  name: "Administrator",
  role: "admin",
  isProUser: true,
  generationsToday: 0,
  totalGenerations: 999,
  createdAt: new Date(),
  updatedAt: new Date()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user from localStorage or API
    const loadUser = async () => {
      try {
        // Check if we're in the browser
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem("user")
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.success && data.user) {
        const user: User = {
          ...data.user,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt)
        }
        
        setUser(user)
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(user))
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      if (data.success && data.user) {
        const user: User = {
          ...data.user,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt)
        }
        
        setUser(user)
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(user))
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin"
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}