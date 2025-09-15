"use client"

import Link from "next/link"
import { Palette } from "lucide-react"

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ 
  size = 'md', 
  showText = true, 
  className = "" 
}: LogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7", 
    lg: "h-10 w-10"
  }
  
  const textSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl"
  }

  return (
    <Link href="/" className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <Palette className={`${sizeClasses[size]} text-primary`} />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-80"></div>
      </div>
      {showText && (
        <span className={`ml-2 ${textSizeClasses[size]} font-extrabold text-foreground`}>
          Coloreveal
        </span>
      )}
    </Link>
  )
}

// 专用的小尺寸logo，用于移动端或紧凑空间
export function LogoCompact() {
  return (
    <Link href="/" className="flex items-center justify-center">
      <div className="relative bg-primary rounded-lg p-2">
        <Palette className="h-4 w-4 text-white" />
        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
      <span className="ml-2 text-sm font-bold text-foreground">
        Coloreveal
      </span>
    </Link>
  )
}