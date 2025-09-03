"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Droplets, 
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
    { id: 'fill' as const, icon: Droplets, label: 'Smart Fill' },
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
      <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-xl border-2 border-white/50 p-2">
        <div className="flex flex-col items-center">
          {/* Currently Selected Tool */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className={cn(
              "w-14 h-14 p-0 rounded-full transition-all shadow-md",
              "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105",
              "border-2 border-white"
            )}
          >
            {(() => {
              const currentTool = tools.find(t => t.id === selectedTool)
              const Icon = currentTool?.icon || Brush
              return <Icon className="h-7 w-7" />
            })()}
          </Button>

          {/* Tool Label */}
          <div className="text-xs font-medium text-gray-700 mt-1 px-2 py-1 bg-white/80 rounded-full">
            {(() => {
              const currentTool = tools.find(t => t.id === selectedTool)
              return currentTool?.label || 'Tool'
            })()}
          </div>
          
          {/* Expand/Collapse Indicator */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="w-8 h-8 p-0 rounded-full text-gray-500 hover:text-gray-700 mt-1"
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/50 p-3">
          <div className="flex flex-col gap-3">
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
                      "w-12 h-12 p-0 rounded-full transition-all shadow-md",
                      "touch-manipulation", // Optimize for touch
                      isSelected
                        ? "bg-blue-500 text-white scale-110 border-2 border-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 border border-gray-300"
                    )}
                    title={tool.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                  <span className="text-xs font-medium text-gray-600 px-2 py-0.5 bg-white/80 rounded-full">
                    {tool.label}
                  </span>
                </div>
              )
            })}
            
            {/* Divider */}
            <div className="h-px bg-gray-300 mx-2 my-2" />
            
            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className={cn(
                  "w-12 h-12 p-0 rounded-full transition-all shadow-md border",
                  "touch-manipulation",
                  canUndo 
                    ? "bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105 border-green-300" 
                    : "bg-gray-50 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed"
                )}
                title="Undo"
              >
                <Undo2 className="h-5 w-5" />
              </Button>
              <span className="text-xs font-medium text-gray-600 px-2 py-0.5 bg-white/80 rounded-full">
                Undo
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className={cn(
                  "w-12 h-12 p-0 rounded-full transition-all shadow-md border",
                  "touch-manipulation",
                  canRedo 
                    ? "bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105 border-green-300" 
                    : "bg-gray-50 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed"
                )}
                title="Redo"
              >
                <Redo2 className="h-5 w-5" />
              </Button>
              <span className="text-xs font-medium text-gray-600 px-2 py-0.5 bg-white/80 rounded-full">
                Redo
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className={cn(
                  "w-12 h-12 p-0 rounded-full transition-all shadow-md border",
                  "touch-manipulation",
                  "bg-red-100 text-red-600 hover:bg-red-200 hover:scale-105 border-red-300"
                )}
                title="Clear"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <span className="text-xs font-medium text-gray-600 px-2 py-0.5 bg-white/80 rounded-full">
                Clear
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}