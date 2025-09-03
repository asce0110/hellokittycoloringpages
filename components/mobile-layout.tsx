"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
// import { MobileBottomNavigation } from "@/components/mobile-navigation" // Removed to prevent circular dependency

interface MobileLayoutProps {
  children: React.ReactNode
  className?: string
  showBottomNav?: boolean
}

export function MobileLayout({ 
  children, 
  className = "",
  showBottomNav = false
}: MobileLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <div className={cn("min-h-screen", className)}>
      {/* 主内容区域 */}
      <main className={cn(
        "pb-4",
        showBottomNav && isMobile && "pb-16" // 为底部导航留出空间
      )}>
        {children}
      </main>

      {/* Mobile bottom navigation - removed to prevent circular dependency */}
      {/* {showBottomNav && <MobileBottomNavigation />} */}
    </div>
  )
}

// 移动端容器组件
export function MobileContainer({ 
  children, 
  className = "",
  padding = "default"
}: { 
  children: React.ReactNode
  className?: string
  padding?: "none" | "sm" | "default" | "lg"
}) {
  const paddingClasses = {
    none: "",
    sm: "px-2 py-2",
    default: "px-4 py-4",
    lg: "px-6 py-6"
  }

  return (
    <div className={cn(
      "w-full max-w-7xl mx-auto",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// 移动端标题组件
export function MobileTitle({ 
  title, 
  subtitle,
  className = "" 
}: { 
  title: string
  subtitle?: string
  className?: string 
}) {
  const isMobile = useIsMobile()

  return (
    <div className={cn("text-center space-y-2", className)}>
      <h1 className={cn(
        "font-bold tracking-tight",
        isMobile ? "text-xl sm:text-2xl" : "text-3xl lg:text-4xl"
      )}>
        {title}
      </h1>
      {subtitle && (
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-sm" : "text-lg"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// 移动端卡片网格
export function MobileCardGrid({ 
  children, 
  className = "",
  cols = "auto"
}: { 
  children: React.ReactNode
  className?: string
  cols?: "auto" | "1" | "2" | "3" | "4"
}) {
  const isMobile = useIsMobile()

  const gridClasses = {
    auto: isMobile 
      ? "grid-cols-2 sm:grid-cols-3" 
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    "1": "grid-cols-1",
    "2": "grid-cols-2",
    "3": "grid-cols-2 sm:grid-cols-3",
    "4": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
  }

  return (
    <div className={cn(
      "grid gap-3 sm:gap-4",
      gridClasses[cols],
      className
    )}>
      {children}
    </div>
  )
}

// 移动端按钮组
export function MobileButtonGroup({ 
  children, 
  className = "",
  orientation = "horizontal" 
}: { 
  children: React.ReactNode
  className?: string
  orientation?: "horizontal" | "vertical"
}) {
  const isMobile = useIsMobile()

  return (
    <div className={cn(
      "flex gap-2",
      orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
      isMobile && "justify-center",
      className
    )}>
      {children}
    </div>
  )
}

// 移动端文本优化组件
export function MobileText({ 
  children, 
  variant = "body",
  className = "" 
}: { 
  children: React.ReactNode
  variant?: "title" | "subtitle" | "body" | "caption"
  className?: string 
}) {
  const isMobile = useIsMobile()

  const variantClasses = {
    title: isMobile ? "text-lg font-semibold" : "text-xl font-semibold",
    subtitle: isMobile ? "text-base font-medium" : "text-lg font-medium", 
    body: isMobile ? "text-sm" : "text-base",
    caption: isMobile ? "text-xs" : "text-sm"
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  )
}
