"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface SEOMobileTextProps {
  fullText: string
  mobileText?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"
  className?: string
  showFullOnHover?: boolean
}

/**
 * SEO优化的移动端文本组件
 * 在移动端显示简化文本，但保留完整文本用于SEO
 */
export function SEOMobileText({ 
  fullText, 
  mobileText,
  as: Component = "span",
  className = "",
  showFullOnHover = false
}: SEOMobileTextProps) {
  const isMobile = useIsMobile()
  const displayText = mobileText || fullText

  return (
    <Component 
      className={cn(className)}
      title={showFullOnHover ? fullText : undefined}
    >
      {/* 移动端显示的文本 */}
      <span className={cn(
        isMobile && mobileText ? "inline" : "hidden sm:inline"
      )}>
        {fullText}
      </span>
      
      {/* 移动端简化文本 */}
      {mobileText && (
        <span className="inline sm:hidden">
          {mobileText}
        </span>
      )}
      
      {/* 隐藏的SEO文本 - 只有搜索引擎能看到 */}
      <span className="sr-only">
        {fullText}
      </span>
    </Component>
  )
}

/**
 * SEO标题组件 - 移动端优化
 */
export function SEOMobileTitle({ 
  title, 
  mobileTitle,
  level = 1,
  className = "" 
}: {
  title: string
  mobileTitle?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}) {
  const Component = `h${level}` as const
  const isMobile = useIsMobile()

  const sizeClasses = {
    1: isMobile ? "text-xl sm:text-2xl lg:text-3xl" : "text-2xl lg:text-3xl xl:text-4xl",
    2: isMobile ? "text-lg sm:text-xl lg:text-2xl" : "text-xl lg:text-2xl xl:text-3xl",
    3: isMobile ? "text-base sm:text-lg lg:text-xl" : "text-lg lg:text-xl xl:text-2xl",
    4: isMobile ? "text-sm sm:text-base lg:text-lg" : "text-base lg:text-lg xl:text-xl",
    5: isMobile ? "text-sm sm:text-base" : "text-base lg:text-lg",
    6: isMobile ? "text-xs sm:text-sm" : "text-sm lg:text-base"
  }

  return (
    <SEOMobileText
      fullText={title}
      mobileText={mobileTitle}
      as={Component}
      className={cn(
        "font-bold tracking-tight",
        sizeClasses[level],
        className
      )}
    />
  )
}

/**
 * SEO描述组件 - 移动端优化
 */
export function SEOMobileDescription({ 
  description, 
  mobileDescription,
  className = "" 
}: {
  description: string
  mobileDescription?: string
  className?: string
}) {
  const isMobile = useIsMobile()

  return (
    <SEOMobileText
      fullText={description}
      mobileText={mobileDescription}
      as="p"
      className={cn(
        "text-muted-foreground",
        isMobile ? "text-sm" : "text-base lg:text-lg",
        className
      )}
    />
  )
}

/**
 * 响应式按钮文本
 */
export function ResponsiveButtonText({ 
  fullText, 
  shortText,
  className = "" 
}: {
  fullText: string
  shortText?: string
  className?: string
}) {
  return (
    <span className={className}>
      <span className="hidden sm:inline">{fullText}</span>
      <span className="inline sm:hidden">{shortText || fullText}</span>
    </span>
  )
}

/**
 * 移动端折叠文本
 */
export function MobileCollapsibleText({ 
  text, 
  maxLength = 100,
  className = "" 
}: {
  text: string
  maxLength?: number
  className?: string
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const isMobile = useIsMobile()
  const shouldTruncate = isMobile && text.length > maxLength

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>
  }

  const truncatedText = text.slice(0, maxLength) + "..."

  return (
    <span className={className}>
      {isExpanded ? text : truncatedText}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-1 text-primary hover:underline text-xs"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
      {/* SEO完整文本 */}
      <span className="sr-only">{text}</span>
    </span>
  )
}

