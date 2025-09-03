"use client"

import React, { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  Droplets, 
  Paintbrush, 
  CircleDot,
  Palette, 
  Download, 
  Printer, 
  Undo, 
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Sun,
  Moon,
  Settings
} from "lucide-react"
import { ColoringCanvas } from "@/components/coloring-canvas"
import { useIsMobile } from "@/hooks/use-mobile"

type Tool = "dropper" | "brush" | "toner"

interface MobileColoringInterfaceProps {
  imageUrl: string
  onDownload?: () => void
  onPrint?: () => void
  onUndo?: () => void
  onReset?: () => void
}

export function MobileColoringInterface({
  imageUrl,
  onDownload,
  onPrint,
  onUndo,
  onReset
}: MobileColoringInterfaceProps) {
  const isMobile = useIsMobile()
  const canvasRef = useRef<{
    undo: () => void
    reset: () => void
    download: (filename: string) => void
    print: () => void
  }>(null)

  // State management
  const [activeColor, setActiveColor] = useState("#FF69B4")
  const [activeTool, setActiveTool] = useState<Tool>("dropper")
  const [brushSize, setBrushSize] = useState(3)
  const [tonerMode, setTonerMode] = useState<"darken" | "lighten">("darken")
  const [tonerIntensity, setTonerIntensity] = useState(0.3)
  const [canUndo, setCanUndo] = useState(false)
  
  // Mobile UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showColorPanel, setShowColorPanel] = useState(false)
  const [showToolSettings, setShowToolSettings] = useState(false)
  const [activeFloatingPanel, setActiveFloatingPanel] = useState<'colors' | 'tools' | 'actions' | null>(null)

  // Color palette
  const colorPalette = [
    "#FF69B4", "#00BCD4", "#FF4136", "#FFDC00", "#7FDBFF", "#2ECC40",
    "#FF851B", "#B10DC9", "#F012BE", "#3D9970", "#001f3f", "#AAAAAA",
  ]

  if (!isMobile) {
    // Fallback to desktop layout for non-mobile devices
    return (
      <div className="p-4">
        <ColoringCanvas
          ref={canvasRef}
          imageUrl={imageUrl}
          activeColor={activeColor}
          activeTool={activeTool}
          brushSize={brushSize}
          tonerMode={tonerMode}
          tonerIntensity={tonerIntensity}
          onHistoryChange={setCanUndo}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Full-screen Canvas Container */}
      <div className={cn(
        "relative w-full transition-all duration-300",
        isFullscreen ? "h-screen" : "h-[60vh]"
      )}>
        <div className="w-full h-full flex items-center justify-center p-2">
          <ColoringCanvas
            ref={canvasRef}
            imageUrl={imageUrl}
            activeColor={activeColor}
            activeTool={activeTool}
            brushSize={brushSize}
            tonerMode={tonerMode}
            tonerIntensity={tonerIntensity}
            onHistoryChange={setCanUndo}
          />
        </div>

        {/* Fullscreen Toggle - Top Right */}
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        {/* Floating Tool Selector - Left Side (Thumb Zone) */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
          <div className="flex flex-col gap-2">
            {[
              { tool: 'dropper' as Tool, icon: Droplets, color: 'bg-blue-500', label: 'Fill' },
              { tool: 'brush' as Tool, icon: Paintbrush, color: 'bg-purple-500', label: 'Brush' },
              { tool: 'toner' as Tool, icon: CircleDot, color: 'bg-yellow-500', label: 'Tone' }
            ].map(({ tool, icon: Icon, color, label }) => (
              <Button
                key={tool}
                size="sm"
                variant={activeTool === tool ? "default" : "outline"}
                className={cn(
                  "w-12 h-12 p-0 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
                  activeTool === tool && `${color} text-white`
                )}
                onClick={() => setActiveTool(tool)}
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Color Picker - Right Side (Thumb Zone) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
          <div className="flex flex-col gap-1">
            {/* Current Color Display */}
            <div
              className="w-12 h-12 rounded-full border-4 border-white shadow-lg cursor-pointer"
              style={{ backgroundColor: activeColor }}
              onClick={() => setActiveFloatingPanel(activeFloatingPanel === 'colors' ? null : 'colors')}
            />
            
            {/* Top 3 Quick Colors */}
            {colorPalette.slice(0, 3).map((color, index) => (
              <button
                key={index}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform",
                  activeColor === color && "ring-2 ring-blue-400 scale-110"
                )}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
            
            {/* More Colors Button */}
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 rounded-full bg-white/90 backdrop-blur-sm"
              onClick={() => setActiveFloatingPanel(activeFloatingPanel === 'colors' ? null : 'colors')}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Action Bar - Always Visible in Drawing Area */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <Button
              size="sm"
              variant="ghost"
              disabled={!canUndo}
              onClick={() => canvasRef.current?.undo()}
              className="p-2"
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            {/* Tool Settings */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveFloatingPanel(activeFloatingPanel === 'tools' ? null : 'tools')}
              className="p-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveFloatingPanel(activeFloatingPanel === 'actions' ? null : 'actions')}
              className="p-2"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Only shown when not in fullscreen */}
      {!isFullscreen && (
        <div className="h-[40vh] bg-white border-t border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Quick Tool Settings */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTool === "toner" ? "Toner" : "Brush"} Size: {brushSize}
                </label>
                <Slider
                  min={activeTool === "toner" ? 5 : 1}
                  max={50}
                  step={1}
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  disabled={activeTool === "dropper"}
                  className="w-full"
                />
              </div>
              
              {activeTool === "toner" && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={tonerMode === "darken" ? "default" : "outline"}
                    onClick={() => setTonerMode("darken")}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={tonerMode === "lighten" ? "default" : "outline"}
                    onClick={() => setTonerMode("lighten")}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Color Palette Grid */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Colors</h3>
              <div className="grid grid-cols-6 gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-full aspect-square rounded-lg border-2 transition-all",
                      activeColor === color
                        ? "border-blue-400 ring-2 ring-blue-200 scale-105"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => canvasRef.current?.print()}
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => canvasRef.current?.download('coloring-page.png')}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Reset all coloring?")) {
                    canvasRef.current?.reset()
                  }
                }}
                className="bg-red-50 text-red-600 border-red-200"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Panels */}
      {activeFloatingPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setActiveFloatingPanel(null)}
          />
          
          {/* Panel Content */}
          <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl z-40 max-h-[60vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {activeFloatingPanel === 'colors' && 'Color Picker'}
                  {activeFloatingPanel === 'tools' && 'Tool Settings'}
                  {activeFloatingPanel === 'actions' && 'Actions'}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveFloatingPanel(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Colors Panel */}
              {activeFloatingPanel === 'colors' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "aspect-square rounded-xl border-2 transition-all",
                          activeColor === color
                            ? "border-blue-400 ring-2 ring-blue-200 scale-105"
                            : "border-gray-300"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setActiveColor(color)
                          setActiveFloatingPanel(null)
                        }}
                      />
                    ))}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Color</label>
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => setActiveColor(e.target.value)}
                      className="w-full h-12 rounded-lg border-2 border-gray-300"
                    />
                  </div>
                </div>
              )}
              
              {/* Tools Panel */}
              {activeFloatingPanel === 'tools' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {activeTool === "toner" ? "Toner" : "Brush"} Size: {brushSize}
                    </label>
                    <Slider
                      min={activeTool === "toner" ? 5 : 1}
                      max={50}
                      step={1}
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      disabled={activeTool === "dropper"}
                    />
                  </div>
                  
                  {activeTool === "toner" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Mode</label>
                        <div className="flex gap-2">
                          <Button
                            variant={tonerMode === "darken" ? "default" : "outline"}
                            onClick={() => setTonerMode("darken")}
                            className="flex-1"
                          >
                            <Moon className="h-4 w-4 mr-2" />
                            Darken
                          </Button>
                          <Button
                            variant={tonerMode === "lighten" ? "default" : "outline"}
                            onClick={() => setTonerMode("lighten")}
                            className="flex-1"
                          >
                            <Sun className="h-4 w-4 mr-2" />
                            Lighten
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Intensity: {Math.round(tonerIntensity * 100)}%
                        </label>
                        <Slider
                          min={0.1}
                          max={0.8}
                          step={0.05}
                          value={[tonerIntensity]}
                          onValueChange={(value) => setTonerIntensity(value[0])}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Actions Panel */}
              {activeFloatingPanel === 'actions' && (
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      canvasRef.current?.print()
                      setActiveFloatingPanel(null)
                    }}
                    className="w-full justify-start"
                  >
                    <Printer className="h-4 w-4 mr-3" />
                    Print Coloring Page
                  </Button>
                  
                  <Button
                    onClick={() => {
                      canvasRef.current?.download('coloring-page.png')
                      setActiveFloatingPanel(null)
                    }}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-3" />
                    Download Image
                  </Button>
                  
                  <Button
                    onClick={() => canvasRef.current?.undo()}
                    disabled={!canUndo}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Undo className="h-4 w-4 mr-3" />
                    Undo Last Action
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (confirm("This will clear all your coloring. Are you sure?")) {
                        canvasRef.current?.reset()
                        setActiveFloatingPanel(null)
                      }
                    }}
                    className="w-full justify-start bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-3" />
                    Reset All Coloring
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}