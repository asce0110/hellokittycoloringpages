"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Droplets, Paintbrush, Download, Printer, Undo, RotateCcw, Palette, Pipette, X, CircleDot, Sun, Moon } from "lucide-react"
import { ColoringCanvas } from "@/components/coloring-canvas"
import { ReferenceImagePanel } from "@/components/reference-image-panel"
import { cn } from "@/lib/utils"
import { ColoringPageData } from "@/lib/coloring-data"

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

interface ColoringPageClientProps {
  coloringPage: ColoringPageData
}

export function ColoringPageClient({ coloringPage }: ColoringPageClientProps) {
  const searchParams = useSearchParams()
  
  // 🎯 优先使用URL参数中的真实图片，fallback到传入的数据
  const actualImageUrl = searchParams.get("imageUrl") || coloringPage.imageUrl
  const actualTitle = searchParams.get("title") || coloringPage.title
  const actualDescription = searchParams.get("description") || coloringPage.description
  
  console.log('🎨 ColoringPageClient - Using image info:', {
    fromParams: {
      imageUrl: searchParams.get("imageUrl"),
      title: searchParams.get("title"),
      description: searchParams.get("description")
    },
    fromProps: {
      imageUrl: coloringPage.imageUrl,
      title: coloringPage.title,
      description: coloringPage.description
    },
    final: {
      imageUrl: actualImageUrl,
      title: actualTitle,
      description: actualDescription
    }
  })
  
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
  const [tonerMode, setTonerMode] = React.useState<"darken" | "lighten">("darken")
  const [tonerIntensity, setTonerIntensity] = React.useState(0.3)
  const [userColors, setUserColors] = React.useState<string[]>([])
  const [showCustomColorPicker, setShowCustomColorPicker] = React.useState(false)
  const colorPickerRef = React.useRef<HTMLDivElement>(null)
  
  // 确保图片URL存在
  if (!coloringPage.imageUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Image Loading Error</h1>
          <p className="text-gray-600 mb-6">
            The coloring page image could not be loaded. Please return to the gallery and select again.
          </p>
          <Button asChild>
            <Link href="/library" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              🎨 Back to Gallery
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  console.log('🎨 Coloring page render:', {
    id: coloringPage.id,
    title: coloringPage.title,
    imageUrl: coloringPage.imageUrl
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

  // 工具切换时自动调整笔刷大小
  React.useEffect(() => {
    if (activeTool === "toner" && brushSize < 10) {
      setBrushSize(15) // 深浅调节工具的理想默认大小
    } else if (activeTool === "brush" && brushSize > 20) {
      setBrushSize(8) // 笔刷工具的理想默认大小
    }
  }, [activeTool])

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{actualTitle}</h1>
          <p className="text-gray-600">{actualDescription}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {coloringPage.category}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {coloringPage.difficulty}
            </span>
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
            {/* 使用提示面板 */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Color
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium text-blue-800 mb-1">Smart Fill - Quick Coloring</div>
                      <p className="text-gray-600 text-xs">Click inside enclosed areas to instantly fill with color. Perfect for large regions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium text-purple-800 mb-1">Brush - Draw Lines</div>
                      <p className="text-gray-600 text-xs">Draw additional lines to create enclosed spaces for Smart Fill, or add details.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium text-yellow-800 mb-1">Toner - Add Depth</div>
                      <p className="text-gray-600 text-xs">Create layers and depth by applying light and dark tones over colored areas.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    className="grid grid-cols-3 gap-1"
                  >
                    <ToggleGroupItem 
                      value="dropper" 
                      aria-label="Smart Fill Tool"
                      className="relative flex-col p-2"
                      title="Step 1: Click inside enclosed areas to instantly fill with color"
                    >
                      <div className="flex flex-col items-center">
                        <Droplets className="h-4 w-4 text-blue-500 mb-1" />
                        <span className="text-xs font-medium">Fill</span>
                      </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="brush" 
                      aria-label="Brush Tool"
                      className="relative flex-col p-2"
                      title="Step 2: Draw lines to create enclosed spaces or add details"
                    >
                      <div className="flex flex-col items-center">
                        <Paintbrush className="h-4 w-4 text-purple-500 mb-1" />
                        <span className="text-xs font-medium">Brush</span>
                      </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="toner" 
                      aria-label="Color Tone Adjustment Tool"
                      className="relative flex-col p-2"
                      title="Step 3: Add depth and layers with light/dark tones"
                    >
                      <div className="flex flex-col items-center">
                        <CircleDot className="h-4 w-4 text-yellow-500 mb-1" />
                        <span className="text-xs font-medium">Toner</span>
                      </div>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div>
                  <Label htmlFor="brush-size" className="text-sm font-medium">
                    {activeTool === "dropper" ? "Fill Precision" : activeTool === "toner" ? "Toner Size" : "Brush Size"}: {brushSize}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="brush-size"
                      min={activeTool === "dropper" ? 1 : activeTool === "toner" ? 5 : 1}
                      max={activeTool === "dropper" ? 100 : activeTool === "toner" ? 50 : 50}
                      step={1}
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      disabled={false}
                    />
                  </div>
                  {activeTool === "toner" && (
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      <p>Larger brushes create smoother tone transitions</p>
                      <p className="text-yellow-600 font-medium">💡 Tip: Apply over colored areas to create depth and shadows!</p>
                    </div>
                  )}
                  {activeTool === "brush" && (
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      <p className="text-purple-600 font-medium">💡 Tip: Draw lines to divide areas, then use Smart Fill to color them!</p>
                    </div>
                  )}
                  {activeTool === "dropper" && (
                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                      <p>Lower values = strict line detection, higher values = more lenient filling</p>
                      <p className="text-blue-600 font-medium">💡 Tip: Click inside enclosed areas to fill with color instantly!</p>
                    </div>
                  )}
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

                {/* 深浅调节控制器 - 仅在深浅调节工具激活时显示 */}
                {activeTool === "toner" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CircleDot className="h-4 w-4 text-yellow-500" />
                      Color Tinting Tool
                    </Label>
                    
                    {/* 深浅模式选择 */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border p-3">
                      <div className="text-xs font-medium text-gray-600 mb-2">Color Tone:</div>
                      <ToggleGroup
                        type="single"
                        value={tonerMode}
                        onValueChange={(value: "darken" | "lighten") => value && setTonerMode(value)}
                        className="grid grid-cols-2 gap-1"
                      >
                        <ToggleGroupItem 
                          value="darken" 
                          aria-label="Deep Tone Mode"
                          className="flex items-center justify-center gap-2 p-3"
                          title="Apply selected color with deep tone"
                        >
                          <Moon className="h-4 w-4" />
                          <span className="text-xs font-medium">Deep Tone</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="lighten" 
                          aria-label="Light Tone Mode"
                          className="flex items-center justify-center gap-2 p-3"
                          title="Apply selected color with light tone"
                        >
                          <Sun className="h-4 w-4" />
                          <span className="text-xs font-medium">Light Tone</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    {/* 强度控制 */}
                    <div>
                      <Label htmlFor="toner-intensity" className="text-sm font-medium">
                        Effect Intensity: {Math.round(tonerIntensity * 100)}%
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Slider
                          id="toner-intensity"
                          min={0.1}
                          max={0.8}
                          step={0.05}
                          value={[tonerIntensity]}
                          onValueChange={(value) => setTonerIntensity(value[0])}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Higher intensity applies more of the selected color
                      </p>
                    </div>
                    
                    {/* 效果预览指示器 */}
                    <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Effect Preview:</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-6 rounded flex overflow-hidden">
                          <div 
                            className="flex-1 bg-blue-400 transition-all duration-300"
                            style={{ 
                              filter: tonerMode === "darken" 
                                ? `brightness(${1 - tonerIntensity})` 
                                : `brightness(${1 + tonerIntensity})`
                            }}
                          />
                          <div 
                            className="flex-1 bg-red-400 transition-all duration-300"
                            style={{ 
                              filter: tonerMode === "darken" 
                                ? `brightness(${1 - tonerIntensity})` 
                                : `brightness(${1 + tonerIntensity})`
                            }}
                          />
                          <div 
                            className="flex-1 bg-green-400 transition-all duration-300"
                            style={{ 
                              filter: tonerMode === "darken" 
                                ? `brightness(${1 - tonerIntensity})` 
                                : `brightness(${1 + tonerIntensity})`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 使用提示 */}
                    <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="font-medium text-blue-800 mb-1">Toner Tool Tips:</div>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Only affects already colored areas</li>
                        <li>• Click or drag to adjust tone gradually</li>
                        <li>• Use larger brushes for smooth gradients</li>
                        <li>• Perfect for creating depth and shadows</li>
                      </ul>
                    </div>
                  </div>
                )}

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
                <CardTitle>Export</CardTitle>
                <CardDescription>Save or print your coloring artwork.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full" onClick={() => canvasRef.current?.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Colored Page
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => canvasRef.current?.download(`${coloringPage.slug}.png`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as PNG
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 浮动参考面板 - 自动初始化彩色参考图 */}
        <ReferenceImagePanel 
          originalImage={actualImageUrl}
          title={`${actualTitle} - Color Reference`}
          initialPosition={{ x: 20, y: 120 }}
          initialVisible={true}
          onColorSelect={handleColorSelect}
        />
      </div>
    </TooltipProvider>
  )
}

