"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface DefaultImageProps {
  src?: string
  alt: string
  width?: number | string
  height?: number | string
  className?: string
  priority?: boolean
  loading?: "eager" | "lazy"
  onLoad?: () => void
  onError?: () => void
}

// 默认的Hello Kitty图片路径
const DEFAULT_KITTY_IMAGE = "/hello-kitty-coloring-page.png"

export function DefaultImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false,
  loading = "lazy",
  onLoad,
  onError,
  ...props 
}: DefaultImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showDefault, setShowDefault] = useState(!src) // 如果没有src，直接显示默认图片
  
  // 如果没有提供src或发生错误，使用默认图片
  const shouldShowDefault = !src || imageError || showDefault

  const handleLoad = () => {
    setImageLoaded(true)
    setShowDefault(false)
    onLoad?.()
  }

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setShowDefault(true)
    }
    onError?.()
  }

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* 默认图片 - 立即显示 */}
      <img
        src={DEFAULT_KITTY_IMAGE}
        alt="Hello Kitty 默认图片"
        width={width}
        height={height}
        loading="eager"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          shouldShowDefault ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* 实际图片 - 叠加在上面 */}
      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : loading}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* 如果使用了默认图片，显示提示 */}
      {shouldShowDefault && (
        <div className="absolute bottom-1 right-1">
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            默认图片
          </div>
        </div>
      )}
    </div>
  )
}

// 专门用于Banner的默认图片组件
export function BannerDefaultImage({ 
  src, 
  alt, 
  className,
  ...props 
}: Omit<DefaultImageProps, 'width' | 'height'>) {
  return (
    <DefaultImage
      src={src}
      alt={alt || "Banner图片"}
      className={cn("aspect-[4/3]", className)}
      {...props}
    />
  )
}

// 专门用于Hero区域的默认图片组件
export function HeroDefaultImage({ 
  src, 
  alt, 
  className,
  priority = true,
  ...props 
}: Omit<DefaultImageProps, 'width' | 'height'>) {
  return (
    <DefaultImage
      src={src}
      alt={alt || "Hero背景图片"}
      className={cn("w-full h-full", className)}
      priority={priority}
      loading="eager"
      {...props}
    />
  )
}