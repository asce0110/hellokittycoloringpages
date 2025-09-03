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
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-700 p-3">
        <div className="flex flex-col items-center">
          {/* Currently Selected Tool */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className={cn(
              "w-16 h-16 p-0 rounded-xl transition-all shadow-lg",
              "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105",
              "border-2 border-blue-400"
            )}
          >
            {(() => {
              const currentTool = tools.find(t => t.id === selectedTool)
              const Icon = currentTool?.icon || Brush
              return <Icon className="h-8 w-8" />
            })()}
          </Button>

          {/* Tool Label */}
          <div className="text-xs font-bold text-white mt-2 px-3 py-1 bg-black/50 rounded-full border border-gray-600">
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
            className="w-10 h-10 p-0 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 mt-2 border border-gray-600"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Tool Options */}
      {isExpanded && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-700 p-4">
          <div className="flex flex-col gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isSelected = selectedTool === tool.id
              
              return (
                <div key={tool.id} className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToolSelect(tool.id)}
                    className={cn(
                      "w-14 h-14 p-0 rounded-xl transition-all shadow-lg",
                      "touch-manipulation", // Optimize for touch
                      isSelected
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110 border-2 border-blue-400"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105 border-2 border-gray-600 hover:border-gray-500"
                    )}
                    title={tool.label}
                  >
                    <Icon className="h-6 w-6" />
                  </Button>
                  <span className="text-xs font-bold text-white px-3 py-1 bg-black/50 rounded-full border border-gray-600">
                    {tool.label}
                  </span>
                </div>
              )
            })}
            
            {/* Divider */}
            <div className="h-px bg-gray-600 mx-2 my-2" />
            
            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className={cn(
                  "w-14 h-14 p-0 rounded-xl transition-all shadow-lg border-2",
                  "touch-manipulation",
                  canUndo 
                    ? "bg-green-600 text-white hover:bg-green-500 hover:scale-105 border-green-500" 
                    : "bg-gray-800 text-gray-500 border-gray-700 opacity-50 cursor-not-allowed"
                )}
                title="Undo"
              >
                <Undo2 className="h-6 w-6" />
              </Button>
              <span className="text-xs font-bold text-white px-3 py-1 bg-black/50 rounded-full border border-gray-600">
                Undo
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className={cn(
                  "w-14 h-14 p-0 rounded-xl transition-all shadow-lg border-2",
                  "touch-manipulation",
                  canRedo 
                    ? "bg-green-600 text-white hover:bg-green-500 hover:scale-105 border-green-500" 
                    : "bg-gray-800 text-gray-500 border-gray-700 opacity-50 cursor-not-allowed"
                )}
                title="Redo"
              >
                <Redo2 className="h-6 w-6" />
              </Button>
              <span className="text-xs font-bold text-white px-3 py-1 bg-black/50 rounded-full border border-gray-600">
                Redo
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className={cn(
                  "w-14 h-14 p-0 rounded-xl transition-all shadow-lg border-2",
                  "touch-manipulation",
                  "bg-red-600 text-white hover:bg-red-500 hover:scale-105 border-red-500"
                )}
                title="Clear"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              <span className="text-xs font-bold text-white px-3 py-1 bg-black/50 rounded-full border border-gray-600">
                Clear
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}