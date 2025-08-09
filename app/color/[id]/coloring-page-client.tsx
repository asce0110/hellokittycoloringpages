"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { Droplets, Paintbrush, Download, Printer, Undo, RotateCcw, Plus, X, Palette, Pipette } from "lucide-react"
import { ColoringCanvas } from "@/components/coloring-canvas"
import { ReferenceImagePanel } from "@/components/reference-image-panel"
import { cn } from "@/lib/utils"
import { hasColorReference, hasColorReferenceSync } from "@/lib/reference-images"

const colorPalette = [
  "#FF69B4", // Kitty Pink
  "#00BCD4", // Kitty Blue
  "#FF4136", // Kitty Red
  "#FFDC00", // Yellow
  "#7FDBFF", // Light Blue
  "#2ECC40", // Green
  "#FF851B", // Orange
  "#B10DC9", // Purple
  "#F012BE", // Fuchsia
  "#3D9970", // Olive
  "#001f3f", // Navy
  "#AAAAAA", // Gray
]

type Tool = "dropper" | "brush"

interface ColoringPageClientProps {
  params: { id: string }
}

export function ColoringPageClient({ params }: ColoringPageClientProps) {
  const searchParams = useSearchParams()
  const imageUrl = searchParams.get("src")
  const canvasRef = React.useRef<{
    undo: () => void
    reset: () => void
    download: (filename: string) => void
    print: () => void
  }>(null)

  const [activeColor, setActiveColor] = React.useState(colorPalette[0])
  const [activeTool, setActiveTool] = React.useState<Tool>("dropper")
  const [brushSize, setBrushSize] = React.useState(3)
  const [canUndo, setCanUndo] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)
  const [hasColorRef, setHasColorRef] = React.useState(false)
  const [checkingColorRef, setCheckingColorRef] = React.useState(false)
  const [userColors, setUserColors] = React.useState<string[]>([])
  const [showCustomColorPicker, setShowCustomColorPicker] = React.useState(false)
  const [isEyedropperActive, setIsEyedropperActive] = React.useState(false)
  const colorPickerRef = React.useRef<HTMLDivElement>(null)
  
  // 检查是否有彩色参考图
  React.useEffect(() => {
    if (!imageUrl) {
      setHasColorRef(false)
      return
    }
    
    const checkColorReference = async () => {
      setCheckingColorRef(true)
      try {
        const decodedUrl = decodeURIComponent(imageUrl)
        console.log('🔍 Checking color reference for:', decodedUrl)
        
        // 先尝试同步检查缓存
        const syncResult = hasColorReferenceSync(decodedUrl)
        if (syncResult) {
          setHasColorRef(true)
          setCheckingColorRef(false)
          return
        }
        
        // 异步检查数据库
        const asyncResult = await hasColorReference(decodedUrl)
        setHasColorRef(asyncResult)
        console.log('🎨 Color reference check result:', asyncResult)
      } catch (error) {
        console.error('❌ Error checking color reference:', error)
        setHasColorRef(false)
      } finally {
        setCheckingColorRef(false)
      }
    }
    
    checkColorReference()
  }, [imageUrl])
  
  // 确保客户端渲染
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // 点击外部区域关闭颜色选择器
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowCustomColorPicker(false)
      }
    }

    if (showCustomColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showCustomColorPicker])

  // 用户颜色管理函数
  const handleAddCustomColor = (color: string) => {
    if (!userColors.includes(color) && userColors.length < 12) {
      setUserColors(prev => [...prev, color])
      setActiveColor(color)
    }
    setShowCustomColorPicker(false)
    setIsEyedropperActive(false)
  }

  // 全局滴管功能
  const handleEyedropper = async () => {
    try {
      // 检查浏览器是否支持 EyeDropper API
      if ('EyeDropper' in window) {
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        handleAddCustomColor(result.sRGBHex)
      } else {
        // 降级方案：提示用户使用支持的浏览器
        alert('您的浏览器不支持颜色拾取功能。请使用 Chrome 95+ 或其他支持 EyeDropper API 的现代浏览器。')
      }
    } catch (error) {
      // 用户取消了选择或发生其他错误
      console.log('滴管取色被取消')
    }
  }

  const handleRemoveUserColor = (colorToRemove: string) => {
    setUserColors(prev => prev.filter(color => color !== colorToRemove))
  }

  // 当从参考图片选择颜色时，自动添加到用户颜色库
  const handleColorSelect = (color: string) => {
    setActiveColor(color)
    if (!userColors.includes(color) && userColors.length < 12) {
      setUserColors(prev => [...prev, color])
    }
  }

  if (!imageUrl) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold">Image not found</h1>
        <p className="text-muted-foreground">Please go back to the library and select an image.</p>
        <Button asChild className="mt-4">
          <Link href="/library">Back to Library</Link>
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="flex flex-col items-center">
            <Card className="w-full overflow-hidden">
              <CardContent className="p-2 sm:p-4 bg-muted flex items-center justify-center">
                <ColoringCanvas
                  ref={canvasRef}
                  imageUrl={decodeURIComponent(imageUrl)}
                  activeColor={activeColor}
                  activeTool={activeTool}
                  brushSize={brushSize}
                  onHistoryChange={setCanUndo}
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-6 w-6 text-primary" />
                  Coloring Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Tool</Label>
                  <ToggleGroup
                    type="single"
                    value={activeTool}
                    onValueChange={(value: Tool) => value && setActiveTool(value)}
                    className="grid grid-cols-2"
                  >
                    <ToggleGroupItem 
                      value="dropper" 
                      aria-label="Smart fill tool - Click to fill enclosed areas"
                      className="relative"
                      title="Click to fill areas within lines"
                    >
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">Smart Fill</span>
                      </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="brush" 
                      aria-label="Manual brush tool - Paint freely"
                      className="relative"
                      title="Paint freely with adjustable size"
                    >
                      <div className="flex items-center">
                        <Paintbrush className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="font-medium">Brush</span>
                      </div>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Tool Status Indicator */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {activeTool === "dropper" ? (
                      <Droplets className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Paintbrush className="h-4 w-4 text-purple-500" />
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {activeTool === "dropper" ? "Smart Fill Mode" : "Brush Mode"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {isClient && activeTool === "dropper" 
                      ? "Click to fill area. Hold & drag for continuous painting with smart boundary detection!" 
                      : activeTool === "dropper"
                      ? "Click inside any area to fill it with color. Works with small areas too!"
                      : "Draw freely with your selected brush size. Perfect for details and shading."}
                  </p>
                </div>

                <div>
                  <Label htmlFor="brush-size" className="text-sm font-medium">
                    Brush Size: {brushSize}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="brush-size"
                      min={1}
                      max={50}
                      step={1}
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      disabled={activeTool !== "brush"}
                    />
                  </div>
                </div>

                {/* 当前选中颜色显示 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Color</Label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-white shadow-lg"
                      style={{ backgroundColor: activeColor }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-mono text-gray-600">{activeColor.toUpperCase()}</div>
                      <div className="text-xs text-gray-400">Selected color</div>
                    </div>
                  </div>
                </div>

                {/* 自定义颜色工具 */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-medium">Custom Colors</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                    className="w-full"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Add Custom Color
                  </Button>

                  {/* 小弹窗颜色选择器 */}
                  {showCustomColorPicker && (
                    <div 
                      ref={colorPickerRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
                    >
                      <div className="space-y-3">
                        {/* 快速颜色选择 */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Colors</h4>
                          <div className="grid grid-cols-6 gap-1">
                            {[
                              '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
                              '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'
                            ].map((color) => (
                              <button
                                key={color}
                                className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => handleAddCustomColor(color)}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 自定义颜色选择器 */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Custom Color</h4>
                          <input
                            type="color"
                            className="w-full h-8 rounded border cursor-pointer"
                            onChange={(e) => handleAddCustomColor(e.target.value)}
                            title="Choose a custom color"
                          />
                        </div>

                        {/* 滴管工具 */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Eyedropper Tool</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEyedropper}
                            className="w-full"
                          >
                            <Pipette className="h-4 w-4 mr-2" />
                            Pick Color from Screen
                          </Button>
                        </div>

                        {/* 关闭按钮 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCustomColorPicker(false)}
                          className="w-full"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 用户颜色库 */}
                {userColors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">My Palette</Label>
                      <span className="text-xs text-gray-400">{userColors.length}/12</span>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                      <div className="grid grid-cols-6 gap-2">
                        {userColors.map((color) => (
                          <div key={color} className="relative group">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setActiveColor(color)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg border-2 transition-all shadow-sm hover:shadow-md",
                                    activeColor === color 
                                      ? "border-blue-400 ring-2 ring-blue-200 scale-110" 
                                      : "border-white hover:border-gray-300"
                                  )}
                                  style={{ backgroundColor: color }}
                                  aria-label={`Select color ${color}`}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono">{color}</p>
                              </TooltipContent>
                            </Tooltip>
                            <button
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveUserColor(color)
                              }}
                              title="Remove color"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 默认调色板 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Default Colors</Label>
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="grid grid-cols-6 gap-2">
                      {colorPalette.map((color) => (
                        <Tooltip key={color}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setActiveColor(color)}
                              className={cn(
                                "w-8 h-8 rounded-lg border-2 transition-all shadow-sm hover:shadow-md",
                                activeColor === color 
                                  ? "border-blue-400 ring-2 ring-blue-200 scale-110" 
                                  : "border-white hover:border-gray-300"
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={`Select color ${color}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-mono">{color}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => canvasRef.current?.undo()}
                    disabled={!canUndo}
                    className="bg-transparent"
                  >
                    <Undo className="mr-2 h-4 w-4" />
                    Undo
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to reset all coloring? This cannot be undone.")) {
                        canvasRef.current?.reset()
                      }
                    }}
                    className="bg-transparent border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Export</CardTitle>
                <CardDescription>Save or print your current coloring progress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full" onClick={() => canvasRef.current?.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Current Progress
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => canvasRef.current?.download(`my-kitty-creation.png`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Progress as PNG
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Floating reference panel - only show if color reference exists */}
        {hasColorRef && (
          <ReferenceImagePanel 
            originalImage={decodeURIComponent(imageUrl)}
            title="Coloring Reference"
            initialPosition={{ x: 20, y: 120 }}
            initialVisible={true}
            onColorSelect={handleColorSelect}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

// Simple Label component
function Label(props: React.ComponentProps<"label">) {
  return <label {...props} />
}