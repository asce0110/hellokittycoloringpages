"use client"

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Droplets, 
  Brush, 
  Palette, 
  Undo2, 
  Redo2, 
  RotateCcw, 
  Move,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileFloatingToolbarProps {
  selectedTool: 'brush' | 'fill' | 'toner'
  onToolChange: (tool: 'brush' | 'fill' | 'toner') => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  canUndo: boolean
  canRedo: boolean
  brushSize: number
  onBrushSizeChange: (size: number) => void
  className?: string
  // 新增手势相关props
  interactionMode?: 'draw' | 'pan'
  onToggleInteractionMode?: () => void
}

export function MobileFloatingToolbar({
  selectedTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  brushSize,
  onBrushSizeChange,
  className,
  interactionMode = 'draw',
  onToggleInteractionMode
}: MobileFloatingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 16, y: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  const tools = [
    { id: 'brush' as const, icon: Brush, label: 'Brush' },
    { id: 'fill' as const, icon: Droplets, label: 'Smart Fill' },
    { id: 'toner' as const, icon: Palette, label: 'Toner' },
  ]

  const handleToolSelect = useCallback((tool: 'brush' | 'fill' | 'toner') => {
    onToolChange(tool)
    setIsExpanded(false) // Collapse after selection
  }, [onToolChange])

  const toggleExpanded = useCallback(() => {
    if (!isDragging) {
      setIsExpanded(prev => !prev)
    }
  }, [isDragging])

  // Dragging functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y
    }
    setIsDragging(false)
  }, [position])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragRef.current.startX
    const deltaY = touch.clientY - dragRef.current.startY
    
    // If movement is significant, start dragging
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setIsDragging(true)
      
      const newX = Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.initialX + deltaX))
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.initialY + deltaY))
      
      setPosition({ x: newX, y: newY })
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    // Reset dragging state after a short delay to prevent accidental clicks
    setTimeout(() => setIsDragging(false), 100)
  }, [])

  // Mouse events for desktop testing
  const handleMouseStart = useCallback((e: React.MouseEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    }
    setIsDragging(false)
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons === 1) { // Left mouse button is pressed
      const deltaX = e.clientX - dragRef.current.startX
      const deltaY = e.clientY - dragRef.current.startY
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsDragging(true)
        
        const newX = Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.initialX + deltaX))
        const newY = Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.initialY + deltaY))
        
        setPosition({ x: newX, y: newY })
      }
    }
  }, [])

  return (
    <div 
      ref={toolbarRef}
      className={cn("flex flex-col items-center gap-3 fixed z-50", className)}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'none' // Override any transform from className
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseStart}
      onMouseMove={handleMouseMove}
    >
      {/* Main Tool Selector */}
      <div className={cn(
        "bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-700 p-3",
        isDragging && "scale-105"
      )}>
        <div className="flex flex-col items-center">
          {/* Drag Handle */}
          <div className="flex items-center justify-center w-full mb-2">
            <Move className="h-4 w-4 text-gray-400" />
          </div>
          
          {/* Currently Selected Tool */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className={cn(
              "w-14 h-14 p-0 rounded-xl transition-all shadow-lg touch-manipulation",
              "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
              "border-2 border-blue-400",
              !isDragging && "hover:scale-105"
            )}
          >
            {(() => {
              const currentTool = tools.find(t => t.id === selectedTool)
              const Icon = currentTool?.icon || Brush
              return <Icon className="h-7 w-7" />
            })()}
          </Button>

          {/* Tool Label */}
          <div className="text-xs font-bold text-white mt-2 px-2 py-1 bg-black/50 rounded-full border border-gray-600">
            {(() => {
              const currentTool = tools.find(t => t.id === selectedTool)
              const label = currentTool?.label || 'Tool'
              if (selectedTool !== 'fill') {
                return `${label} (${brushSize})`
              }
              return label
            })()}
          </div>
          
          {/* Expand Indicator */}
          <div className="flex items-center justify-center mt-2">
            <div className={cn(
              "w-6 h-1 bg-gray-400 rounded-full transition-all",
              isExpanded ? "rotate-180" : ""
            )} />
          </div>
        </div>
      </div>

      {/* Expanded Tool Options */}
      {isExpanded && (
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-700 p-4 max-w-xs">
          {/* Close Button */}
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Tool Grid */}
            <div className="grid grid-cols-3 gap-3">
              {tools.map((tool) => {
                const Icon = tool.icon
                const isSelected = selectedTool === tool.id
                
                return (
                  <div key={tool.id} className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToolSelect(tool.id)}
                      className={cn(
                        "w-12 h-12 p-0 rounded-xl transition-all shadow-lg",
                        "touch-manipulation", // Optimize for touch
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110 border-2 border-blue-400"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105 border-2 border-gray-600 hover:border-gray-500"
                      )}
                      title={tool.label}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                    <span className="text-xs font-bold text-white px-2 py-0.5 bg-black/50 rounded-full border border-gray-600">
                      {tool.label}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Divider */}
            <div className="h-px bg-gray-600 mx-2 my-2" />
            
            {/* Brush Size Controls */}
            {selectedTool !== 'fill' && (
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm font-bold text-white px-3 py-1 bg-black/50 rounded-full border border-gray-600">
                  Size: {brushSize}
                </span>
                <div className="flex items-center gap-3 w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBrushSizeChange(Math.max(1, brushSize - 2))}
                    className="w-10 h-10 p-0 rounded-full bg-gray-700 text-white hover:bg-gray-600 border-2 border-gray-600 touch-manipulation"
                    title="Decrease Size"
                  >
                    -
                  </Button>
                  
                  {/* Visual size indicator */}
                  <div className="flex-1 flex items-center justify-center">
                    <div 
                      className="bg-blue-400 rounded-full transition-all"
                      style={{ 
                        width: `${Math.max(4, Math.min(20, brushSize))}px`, 
                        height: `${Math.max(4, Math.min(20, brushSize))}px`
                      }}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBrushSizeChange(Math.min(50, brushSize + 2))}
                    className="w-10 h-10 p-0 rounded-full bg-gray-700 text-white hover:bg-gray-600 border-2 border-gray-600 touch-manipulation"
                    title="Increase Size"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
            
            {/* Divider */}
            <div className="h-px bg-gray-600 mx-2 my-2" />
            
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={cn(
                    "w-12 h-12 p-0 rounded-xl transition-all shadow-lg border-2",
                    "touch-manipulation",
                    canUndo 
                      ? "bg-green-600 text-white hover:bg-green-500 hover:scale-105 border-green-500" 
                      : "bg-gray-800 text-gray-500 border-gray-700 opacity-50 cursor-not-allowed"
                  )}
                  title="Undo"
                >
                  <Undo2 className="h-5 w-5" />
                </Button>
                <span className="text-xs font-bold text-white px-2 py-0.5 bg-black/50 rounded-full border border-gray-600">
                  Undo
                </span>
              </div>

              {/* Gesture Mode Toggle */}
              {onToggleInteractionMode && (
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleInteractionMode}
                    className={cn(
                      "w-12 h-12 p-0 rounded-xl transition-all shadow-lg border-2",
                      "touch-manipulation",
                      interactionMode === 'pan'
                        ? "bg-orange-600 text-white hover:bg-orange-500 hover:scale-105 border-orange-500"
                        : "bg-purple-600 text-white hover:bg-purple-500 hover:scale-105 border-purple-500"
                    )}
                    title={interactionMode === 'draw' ? 'Switch to Pan Mode' : 'Switch to Draw Mode'}
                  >
                    <Move className="h-5 w-5" />
                  </Button>
                  <span className="text-xs font-bold text-white px-2 py-0.5 bg-black/50 rounded-full border border-gray-600">
                    {interactionMode === 'draw' ? 'Draw' : 'Pan'}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className={cn(
                    "w-12 h-12 p-0 rounded-xl transition-all shadow-lg border-2",
                    "touch-manipulation",
                    "bg-red-600 text-white hover:bg-red-500 hover:scale-105 border-red-500"
                  )}
                  title="Clear"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <span className="text-xs font-bold text-white px-2 py-0.5 bg-black/50 rounded-full border border-gray-600">
                  Clear
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}