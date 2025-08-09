"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Lock } from "lucide-react"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  fallbackPath = "/login"
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // 检查 localStorage 中的用户信息
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem("user")
          if (savedUser) {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            setIsAuthenticated(true)
            setIsAdmin(userData.role === 'admin')
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        // 清除可能损坏的数据
        if (typeof window !== 'undefined') {
          localStorage.removeItem("user")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // 需要认证但未登录
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-semibold">Authentication Required</h2>
                <p className="text-muted-foreground mt-2">
                  You need to sign in to access this page.
                </p>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    Go Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 需要管理员权限但不是管理员
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-xl font-semibold">Admin Access Required</h2>
                <p className="text-muted-foreground mt-2">
                  You don't have permission to access this page.
                </p>
                {user && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Logged in as: {user.email} ({user.role})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    Go Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 通过所有检查，渲染内容
  return <>{children}</>
}