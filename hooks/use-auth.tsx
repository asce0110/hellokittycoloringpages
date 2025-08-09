"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name?: string) => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin credentials
const ADMIN_EMAIL = "asce3801@gmail.com"
const ADMIN_PASSWORD = "xahzjz114223"

// Mock admin user for development
const mockAdminUser: User = {
  id: "admin-1",
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
      // Mock login logic - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Admin login
        const user = { ...mockAdminUser }
        setUser(user)
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(user))
        }
      } else if (email === "user@example.com" && password === "password123") {
        // Demo user login
        const user: User = {
          id: "user-1",
          email: "user@example.com",
          name: "Demo User",
          role: "user",
          isProUser: false,
          generationsToday: 2,
          totalGenerations: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setUser(user)
        if (typeof window !== 'undefined') {
          localStorage.setItem("user", JSON.stringify(user))
        }
      } else {
        throw new Error("Invalid email or password")
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
      // Mock registration logic - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user: User = {
        id: Date.now().toString(),
        email,
        name: name || email.split("@")[0],
        role: "user",
        isProUser: false,
        generationsToday: 0,
        totalGenerations: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setUser(user)
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(user))
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

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
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