"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
  PaintBucket, 
  Brush, 
  Palette, 
  Undo2, 
  Redo2, 
  RotateCcw, 
  ChevronUp,
  ChevronDown 
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
  className?: string
}

export function MobileFloatingToolbar({
  selectedTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  className
}: MobileFloatingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const tools = [
    { id: 'brush' as const, icon: Brush, label: 'Brush' },
    { id: 'fill' as const, icon: PaintBucket, label: 'Fill' },
    { id: 'toner' as const, icon: Palette, label: 'Toner' },
  ]

  const handleToolSelect = useCallback((tool: 'brush' | 'fill' | 'toner') => {
    onToolChange(tool)
    setIsExpanded(false) // Collapse after selection
  }, [onToolChange])

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Main Tool Selector */}
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1">
        <div className="flex flex-col items-center">
          {/* Currently Selected Tool */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className={cn(
              "w-12 h-12 p-0 rounded-full transition-all",
              "bg-blue-100 text-blue-600 hover:bg-blue-200"
            )}
          >
            {(() => {
              const currentTool = tools.find(t => t.id === selectedTool)
              const Icon = currentTool?.icon || Brush
              return <Icon className="h-6 w-6" />
            })()}
          </Button>

          {/* Expand/Collapse Indicator */}
          <div className="h-1 w-6 bg-gray-300 rounded-full my-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="w-8 h-8 p-0 rounded-full text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Tool Options */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="flex flex-col gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isSelected = selectedTool === tool.id
              
              return (
                <Button
                  key={tool.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToolSelect(tool.id)}
                  className={cn(
                    "w-12 h-12 p-0 rounded-full transition-all",
                    "touch-manipulation", // Optimize for touch
                    isSelected
                      ? "bg-blue-100 text-blue-600 scale-110"
                      : "hover:bg-gray-100 hover:scale-105"
                  )}
                  title={tool.label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              )
            })}
            
            {/* Divider */}
            <div className="h-px bg-gray-200 mx-2 my-1" />
            
            {/* Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(
                "w-12 h-12 p-0 rounded-full transition-all",
                "touch-manipulation",
                canUndo 
                  ? "hover:bg-gray-100 hover:scale-105" 
                  : "opacity-50 cursor-not-allowed"
              )}
              title="Undo"
            >
              <Undo2 className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(
                "w-12 h-12 p-0 rounded-full transition-all",
                "touch-manipulation",
                canRedo 
                  ? "hover:bg-gray-100 hover:scale-105" 
                  : "opacity-50 cursor-not-allowed"
              )}
              title="Redo"
            >
              <Redo2 className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className={cn(
                "w-12 h-12 p-0 rounded-full transition-all",
                "touch-manipulation",
                "hover:bg-red-50 hover:text-red-600 hover:scale-105"
              )}
              title="Clear"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}