"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Download, Eye, Palette } from "lucide-react"
import { DefaultImage } from "@/components/default-image"
import { cn } from "@/lib/utils"
import { LibraryImage } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileLibraryCardProps {
  image: LibraryImage
  showDifficulty?: boolean
  showCategory?: boolean
  showStats?: boolean
  className?: string
}

export function MobileLibraryCard({ 
  image, 
  showDifficulty = true, 
  showCategory = false,
  showStats = false,
  className = "" 
}: MobileLibraryCardProps) {
  const isMobile = useIsMobile()
  
  if (!isMobile) return null

  return (
    <Card className={cn("group overflow-hidden border-0 bg-card/50 hover:bg-card transition-all duration-200", className)}>
      <CardContent className="p-2">
        {/* 图片区域 */}
        <div className="relative aspect-square overflow-hidden rounded-md bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
          <DefaultImage
            src={image.thumbnailUrl || image.imageUrl}
            alt={image.title}
            width={200}
            height={200}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          
          {/* 悬浮标签 */}
          <div className="absolute top-1 right-1 flex gap-1">
            {showDifficulty && (
              <Badge 
                variant={
                  image.difficulty === 'easy' ? 'secondary' : 
                  image.difficulty === 'medium' ? 'default' : 
                  'destructive'
                } 
                className="text-xs px-1.5 py-0.5 h-auto"
              >
                {image.difficulty === 'easy' ? 'Easy' : 
                 image.difficulty === 'medium' ? 'Med' : 'Hard'}
              </Badge>
            )}
          </div>

          {/* 快速操作按钮 */}
          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="h-6 w-6 p-0 rounded-full">
              <Heart className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="mt-2 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
              {image.title}
            </h3>
            {showCategory && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-auto whitespace-nowrap">
                {image.category}
              </Badge>
            )}
          </div>

          {/* 统计信息 */}
          {showStats && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{image.viewCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>{image.downloadCount || 0}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              className="flex-1 h-7 text-xs"
              asChild
            >
              <Link href={`/library/${image.id}`}>
                <Palette className="h-3 w-3 mr-1" />
                Color
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 移动端网格容器
export function MobileLibraryGrid({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const isMobile = useIsMobile()
  
  if (!isMobile) return <>{children}</>

  return (
    <div className={cn(
      "grid grid-cols-2 gap-3 sm:grid-cols-3 md:hidden",
      className
    )}>
      {children}
    </div>
  )
}

