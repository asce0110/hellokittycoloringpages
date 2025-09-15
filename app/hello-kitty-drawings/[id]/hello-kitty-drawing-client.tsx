"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Droplets, Paintbrush, Download, Printer, Undo, RotateCcw, Palette, Pipette, X, ArrowLeft, Star, CircleDot, Sun, Moon } from "lucide-react"
import { ColoringCanvas } from "@/components/coloring-canvas"
import { ReferenceImagePanel } from "@/components/reference-image-panel"
import { cn } from "@/lib/utils"
import { HelloKittyDrawing } from "@/lib/hello-kitty-drawings"

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

type Tool = "dropper" | "brush" | "toner"

interface HelloKittyDrawingClientProps {
  drawing: HelloKittyDrawing
}

export function HelloKittyDrawingClient({ drawing }: HelloKittyDrawingClientProps) {
  const searchParams = useSearchParams()
  
  // 🎯 新SEO系统：优先使用传入的drawing数据（已包含真实图片），URL参数作为回退
  const actualImageUrl = drawing.imageUrl || searchParams.get("imageUrl") || "/hello-kitty-coloring-page.png"
  const actualTitle = drawing.title || searchParams.get("title") || "Hello Kitty Drawing"
  const actualDescription = drawing.description || searchParams.get("description") || "A beautiful Hello Kitty coloring page"
  
  console.log('🎨 HelloKittyDrawingClient - Using image info:', {
    fromProps: {
      imageUrl: drawing.imageUrl,
      title: drawing.title,
      description: drawing.description
    },
    fromParams: {
      imageUrl: searchParams.get("imageUrl"),
      title: searchParams.get("title"),
      description: searchParams.get("description")
    },
    final: {
      imageUrl: actualImageUrl,
      title: actualTitle,
      description: actualDescription
    }
  })
  
  const canvasRef = React.useRef<{
    undo: () => void; 
    reset: () => void; 
    download: (filename: string) => void; 
    print: () => void;
    saveProgress: (key?: string) => boolean;
    loadProgress: (key?: string) => boolean;
    hasProgress: (key?: string) => boolean;
    clearProgress: (key?: string) => void;
  }>(null)

  const [activeColor, setActiveColor] = React.useState(colorPalette[0])
  const [activeTool, setActiveTool] = React.useState<Tool>("dropper")
  const [brushSize, setBrushSize] = React.useState(3)
  const [canUndo, setCanUndo] = React.useState(false)
  const [tonerMode, setTonerMode] = React.useState<"darken" | "lighten">("darken")
  const [tonerIntensity, setTonerIntensity] = React.useState(0.3)
  const [userColors, setUserColors] = React.useState<string[]>([])
  const [showCustomColorPicker, setShowCustomColorPicker] = React.useState(false)
  const colorPickerRef = React.useRef<HTMLDivElement>(null)
  
  // 确保图片URL存在
  if (!drawing.imageUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Hello Kitty Drawing Loading Error</h1>
          <p className="text-gray-600 mb-6">
            The Hello Kitty drawing could not be loaded. Please return to the gallery and select again.
          </p>
          <Button asChild>
            <Link href="/hello-kitty-drawings" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              🎨 Back to Hello Kitty Drawings
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  console.log('🎨 Hello Kitty Drawing render:', {
    id: drawing.id,
    title: drawing.title,
    imageUrl: drawing.imageUrl
  })

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
  }

  // 全局滴管功能
  const handleEyedropper = async () => {
    try {
      if ('EyeDropper' in window) {
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        handleAddCustomColor(result.sRGBHex)
      } else {
        alert('Your browser does not support the color picker feature. Please use Chrome 95+ or other modern browsers that support the EyeDropper API.')
      }
    } catch (error) {
      console.log('Color picking cancelled')
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

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4">
        {/* 面包屑导航 */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/hello-kitty-drawings" className="hover:text-blue-600">Hello Kitty Drawings</Link>
            <span>/</span>
            <span className="text-gray-900">#{drawing.id}</span>
          </nav>
        </div>

        {/* 页面标题和SEO优化标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
              Hello Kitty Drawings #{drawing.id}
            </Badge>
            {drawing.featured && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{actualTitle}</h1>
          <p className="text-gray-600 mb-4">{actualDescription}</p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {drawing.category}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {drawing.difficulty}
            </Badge>
            <Badge variant="outline">
              Free Printable
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="flex flex-col items-center">
            <Card className="w-full overflow-hidden">
              <CardContent className="p-2 sm:p-4 bg-muted flex items-center justify-center">
                <ColoringCanvas
                  ref={canvasRef}
                  imageUrl={actualImageUrl}
                  activeColor={activeColor}
                  activeTool={activeTool}
                  brushSize={brushSize}
                  tonerMode={tonerMode}
                  tonerIntensity={tonerIntensity}
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
                  <Label className="text-sm font-medium">Tools</Label>
                  <ToggleGroup
                    type="single"
                    value={activeTool}
                    onValueChange={(value: Tool) => value && setActiveTool(value)}
                    className="grid grid-cols-2"
                  >
                    <ToggleGroupItem 
                      value="dropper" 
                      aria-label="Smart Fill Tool"
                      className="relative"
                      title="Click to fill enclosed areas"
                    >
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">Smart Fill</span>
                      </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="brush" 
                      aria-label="Brush Tool"
                      className="relative"
                      title="Free drawing"
                    >
                      <div className="flex items-center">
                        <Paintbrush className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="font-medium">Brush</span>
                      </div>
                    </ToggleGroupItem>
                  </ToggleGroup>
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
                      <div className="text-xs text-gray-400">Selected Color</div>
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
                            title="Choose Custom Color"
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
                            Pick from Screen
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
                      <Label className="text-sm font-medium">My Color Palette</Label>
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
                              title="Remove Color"
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
                      if (confirm("Are you sure you want to reset all coloring? This action cannot be undone.")) {
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
                <CardTitle>Export & Share</CardTitle>
                <CardDescription>Save or print your Hello Kitty drawing artwork.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full" onClick={() => canvasRef.current?.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Current Progress
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => canvasRef.current?.download(`hello-kitty-drawing-${drawing.id}.png`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as PNG
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/hello-kitty-drawings">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Gallery
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 浮动参考面板 - 如果有参考图片则显示 */}
        {drawing.referenceImageUrl && (
          <ReferenceImagePanel 
            originalImage={drawing.referenceImageUrl}
            title="Hello Kitty Drawing Reference"
            initialPosition={{ x: 20, y: 120 }}
            initialVisible={true}
            onColorSelect={handleColorSelect}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

// 简单的Label组件
function Label(props: React.ComponentProps<"label">) {
  return <label {...props} />
}