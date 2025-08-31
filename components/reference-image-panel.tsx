"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Move, Minimize2, Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getColorReference, getColorReferenceSync, ColorReference } from '@/lib/reference-images'

interface ReferenceImagePanelProps {
  /** Original black and white line art image URL */
  originalImage: string
  /** Image title */
  title?: string
  /** Initial visibility state */
  initialVisible?: boolean
  /** Initial position */
  initialPosition?: { x: number; y: number }
  /** Callback function when a color is selected */
  onColorSelect?: (color: string) => void
}

export function ReferenceImagePanel({
  originalImage,
  title = "Reference Image",
  initialVisible = true,
  initialPosition = { x: 20, y: 100 },
  onColorSelect
}: ReferenceImagePanelProps) {
  const [isVisible, setIsVisible] = useState(initialVisible)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [colorReference, setColorReference] = useState<ColorReference | null>(null)
  const [coloredImageUrl, setColoredImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  const panelRef = useRef<HTMLDivElement>(null)
  const dragPositionRef = useRef({ x: position.x, y: position.y })
  const rafRef = useRef<number | null>(null)
  
  // 异步加载彩色参考图信息
  useEffect(() => {
    const loadColorReference = async () => {
      setIsLoading(true)
      try {
        console.log('🔍 Loading color reference for:', originalImage)
        
        // 🔥 优先使用异步数据库检查（支持动态配对）
        const asyncRef = await getColorReference(originalImage)
        if (asyncRef) {
          setColorReference(asyncRef)
          setColoredImageUrl(asyncRef.colored)
          
          console.log('✅ Color reference loaded:', asyncRef.title)
          console.log('🎨 Using colored image:', asyncRef.colored)
        } else {
          console.log('🚫 No color reference found for:', originalImage)
          setColorReference(null)
        }
      } catch (error) {
        console.error('❌ Error loading color reference:', error)
        setColorReference(null)
        
        // Fallback: 尝试同步检查缓存
        try {
          const syncRef = getColorReferenceSync(originalImage)
          if (syncRef) {
            setColorReference(syncRef)
            setColoredImageUrl(syncRef.colored)
            console.log('✅ Fallback to sync reference:', syncRef.title)
          }
        } catch (syncError) {
          console.error('❌ Sync fallback also failed:', syncError)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadColorReference()
  }, [originalImage])

  // 更新位置引用
  useEffect(() => {
    dragPositionRef.current = position
  }, [position])

  // 优化的拖拽逻辑 - 使用 requestAnimationFrame 提升流畅度
  const updatePosition = (newX: number, newY: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    rafRef.current = requestAnimationFrame(() => {
      // 确保面板不会被拖拽出视窗
      const maxX = Math.max(0, window.innerWidth - 240) // 考虑面板宽度
      const maxY = Math.max(0, window.innerHeight - 100)
      
      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))
      
      // 只有在位置真正改变时才更新状态
      if (dragPositionRef.current.x !== clampedX || dragPositionRef.current.y !== clampedY) {
        setPosition({ x: clampedX, y: clampedY })
      }
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return
    
    e.preventDefault()
    setIsDragging(true)
    
    const rect = panelRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    setDragOffset({ x: offsetX, y: offsetY })

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - offsetX
      const newY = moveEvent.clientY - offsetY
      updatePosition(newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      // 清理 requestAnimationFrame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { once: true })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!panelRef.current || e.touches.length !== 1) return
    
    e.preventDefault()
    setIsDragging(true)
    
    const touch = e.touches[0]
    const rect = panelRef.current.getBoundingClientRect()
    const offsetX = touch.clientX - rect.left
    const offsetY = touch.clientY - rect.top
    
    setDragOffset({ x: offsetX, y: offsetY })

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return
      
      const touch = moveEvent.touches[0]
      const newX = touch.clientX - offsetX
      const newY = touch.clientY - offsetY
      updatePosition(newX, newY)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      
      // 清理 requestAnimationFrame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { once: true })
  }

  // 清理 requestAnimationFrame
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])


  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Loading reference...</span>
        </div>
      </div>
    )
  }
  
  // 如果没有彩色参考图，不显示参考面板
  if (!colorReference) {
    return null
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Eye className="h-4 w-4 mr-2" />
        Show Reference
      </Button>
    )
  }

  return (
    <>
      <div
        ref={panelRef}
        className={cn(
          "fixed z-40 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700",
          "transition-all duration-200",
          isDragging ? "cursor-grabbing scale-105 will-change-transform" : "cursor-default",
          isMinimized ? "w-48" : "w-64"
        )}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Title bar - draggable area */}
        <div
          className={cn(
            "flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700 select-none",
            "transition-colors duration-150",
            isDragging ? "cursor-grabbing bg-gray-100 dark:bg-gray-700" : "cursor-grab hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="flex items-center gap-2">
            <Move className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reference Colors</span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* 最小化/最大化按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
            
            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        {!isMinimized && (
          <div className="p-3 space-y-3 bg-white dark:bg-gray-900">
            {/* 彩色参考图片 */}
            <div className="relative group">
              <Image
                src={coloredImageUrl}
                alt="Colored reference image"
                width={200}
                height={200}
                className="w-full h-auto rounded border shadow-sm"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('Failed to load colored reference image:', coloredImageUrl)
                }}
              />
              
            </div>


            {/* 提示文字 */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Use these colors as reference
            </p>
          </div>
        )}
      </div>

      {/* 拖拽时的遮罩 */}
      {isDragging && (
        <div className="fixed inset-0 z-30 bg-black/5 pointer-events-none" />
      )}
    </>
  )
}