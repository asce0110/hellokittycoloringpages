"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { Droplets, Paintbrush, Download, Printer, Undo, RotateCcw, Palette, Pipette, X, Share2, Heart, CircleDot, Sun, Moon, Save, FolderOpen, Trash2 } from "lucide-react"
import { ColoringCanvas } from "@/components/coloring-canvas"
import { ReferenceImagePanel } from "@/components/reference-image-panel"
import { ColoringPageSEOLayout } from "@/components/coloring-page-seo-layout"
import { MobileColoringPageSimple } from "@/components/mobile-coloring-page-simple"
import { useSEOOptimization } from "@/hooks/use-seo-optimization"
import { useViewTracking } from "@/hooks/use-view-tracking"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { useFavorites } from "@/hooks/use-favorites"
import { extractColoringPageFavoriteId, debugIdInfo } from "@/lib/id-utils"
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
  const { trackUserEngagement } = useSEOOptimization(coloringPage)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const isMobile = useIsMobile()
  const { user, isAuthenticated } = useAuth()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  
  // 🎯 添加浏览量追踪 - 优先使用libraryImageId，其次使用id（如果不是slug）
  const imageIdForTracking = (coloringPage as any).libraryImageId || 
    (coloringPage.id !== coloringPage.slug ? coloringPage.id : null)
  
  console.log('🎯 浏览量追踪配置:', {
    libraryImageId: (coloringPage as any).libraryImageId,
    coloringPageId: coloringPage.id,
    slug: coloringPage.slug,
    finalTrackingId: imageIdForTracking,
    willTrack: !!imageIdForTracking
  })
  
  const { hasTracked } = useViewTracking(imageIdForTracking, {
    delay: 3000, // 3秒延迟确保是真实浏览
    trackMultiple: false
  })
  
  // 🎯 多层级优先级：URL参数 > localStorage > 传入数据
  const [localStorageData, setLocalStorageData] = React.useState<any>(null)
  
  // 在客户端加载时检查localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(`coloring-page-${coloringPage.slug}`)
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setLocalStorageData(parsedData)
          console.log('💾 从localStorage加载数据:', parsedData)
        } catch (error) {
          console.error('❌ localStorage数据解析失败:', error)
        }
      }
    }
  }, [coloringPage.slug])
  
  const actualImageUrl = searchParams.get("imageUrl") || localStorageData?.imageUrl || coloringPage.imageUrl
  const actualTitle = searchParams.get("title") || localStorageData?.title || coloringPage.title
  const actualDescription = searchParams.get("description") || localStorageData?.description || coloringPage.description
  
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
  
  // 进度保存相关状态
  const [hasSavedProgress, setHasSavedProgress] = React.useState(false)
  const [lastSaveTime, setLastSaveTime] = React.useState<string | null>(null)
  
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
      trackUserEngagement('custom_color_added', { color, totalCustomColors: userColors.length + 1 })
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

  // 检查是否有保存的进度
  React.useEffect(() => {
    if (canvasRef.current && actualImageUrl) {
      const hasProgress = canvasRef.current.hasProgress()
      setHasSavedProgress(hasProgress)
      
      // 获取保存时间
      if (hasProgress) {
        try {
          const saveKey = `coloring-progress-${actualImageUrl}`
          const savedData = localStorage.getItem(saveKey)
          if (savedData) {
            const progressData = JSON.parse(savedData)
            setLastSaveTime(progressData.timestamp)
          }
        } catch (error) {
          console.error('获取保存时间失败:', error)
        }
      }
    }
  }, [actualImageUrl])

  // 保存进度处理函数 - 支持云同步
  const handleSaveProgress = async () => {
    if (canvasRef.current) {
      try {
        // 先保存到本地localStorage (快速反馈)
        const localSuccess = canvasRef.current.saveProgress()
        if (localSuccess) {
          setHasSavedProgress(true)
          setLastSaveTime(new Date().toISOString())
          
          // 如果用户已登录，同时保存到云端
          if (isAuthenticated && user?.id) {
            try {
              // 获取canvas数据
              const canvas = document.querySelector('canvas')
              if (canvas) {
                const dataURL = canvas.toDataURL('image/png')
                
                // 保存到云端
                const response = await fetch('/api/coloring-progress', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    imageUrl: actualImageUrl,
                    imageSlug: coloringPage.slug,
                    progressData: dataURL,
                    progressType: 'dataURL',
                    deviceType: 'desktop'
                  })
                })
                
                if (response.ok) {
                  alert('✅ Coloring progress saved locally and synced to cloud! You can access it from any device.')
                } else {
                  alert('✅ Coloring progress saved locally! Cloud sync failed, but you can still continue coloring on this device.')
                }
              }
            } catch (cloudError) {
              console.warn('Cloud sync failed:', cloudError)
              alert('✅ Coloring progress saved locally! Cloud sync failed, but you can still continue coloring on this device.')
            }
          } else {
            alert('✅ Coloring progress saved locally! Sign in to sync across devices.')
          }
          
          trackUserEngagement('progress_saved', { pageTitle: actualTitle, syncType: isAuthenticated ? 'cloud' : 'local' })
        } else {
          alert('❌ Save failed! Possible reasons:\n• Too much coloring content causing large file size\n• Insufficient browser storage space\n• Please clear browser cache or save with less coloring')
        }
      } catch (error) {
        console.error('Error saving progress:', error)
        alert('❌ Save failed! Please check browser console for detailed error information.')
      }
    }
  }

  // 加载进度处理函数 - 支持云同步
  const handleLoadProgress = async () => {
    if (canvasRef.current) {
      if (confirm('Are you sure you want to load previous coloring progress? Current coloring content will be replaced.')) {
        let loadSuccess = false
        
        // 如果用户已登录，优先从云端加载
        if (isAuthenticated && user?.id) {
          try {
            const response = await fetch(`/api/coloring-progress?userId=${user.id}&imageUrl=${encodeURIComponent(actualImageUrl)}`)
            if (response.ok) {
              const result = await response.json()
              if (result.success && result.data) {
                // 从云端数据恢复
                const canvas = document.querySelector('canvas')
                const ctx = canvas?.getContext('2d')
                if (canvas && ctx) {
                  const img = new Image()
                  img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                    alert('✅ Coloring progress restored from cloud!')
                    trackUserEngagement('progress_loaded', { pageTitle: actualTitle, source: 'cloud' })
                  }
                  img.src = result.data.progressData
                  loadSuccess = true
                }
              }
            }
          } catch (cloudError) {
            console.warn('Cloud load failed, trying local:', cloudError)
          }
        }
        
        // 如果云端加载失败或用户未登录，从本地加载
        if (!loadSuccess) {
          const localSuccess = canvasRef.current.loadProgress()
          if (localSuccess) {
            alert('✅ Coloring progress restored from local storage!')
            trackUserEngagement('progress_loaded', { pageTitle: actualTitle, source: 'local' })
          } else {
            alert('❌ Load failed, there may be no saved progress or data is corrupted.')
          }
        }
      }
    }
  }

  // 清除进度处理函数 - 支持云同步
  const handleClearProgress = async () => {
    if (canvasRef.current && confirm('Are you sure you want to clear saved progress? This action cannot be undone.')) {
      // 清除本地进度
      canvasRef.current.clearProgress()
      setHasSavedProgress(false)
      setLastSaveTime(null)
      
      // 如果用户已登录，同时清除云端进度
      if (isAuthenticated && user?.id) {
        try {
          const response = await fetch(`/api/coloring-progress?userId=${user.id}&imageUrl=${encodeURIComponent(actualImageUrl)}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            alert('🗑️ Saved progress has been cleared from both local and cloud storage.')
          } else {
            alert('🗑️ Local progress cleared. Cloud sync failed, but local storage is clean.')
          }
        } catch (error) {
          console.warn('Cloud clear failed:', error)
          alert('🗑️ Local progress cleared. Cloud sync failed, but local storage is clean.')
        }
      } else {
        alert('🗑️ Saved progress has been cleared from local storage.')
      }
    }
  }

  // 🎯 使用统一的ID提取逻辑
  const favoriteIdResult = React.useMemo(() => {
    return extractColoringPageFavoriteId(coloringPage, imageIdForTracking)
  }, [coloringPage, imageIdForTracking])

  // 收藏处理函数 - 使用标准化的ID处理
  const handleFavoriteToggle = React.useCallback(async () => {
    if (!isAuthenticated) {
      alert('请先登录才能收藏页面')
      return
    }
    
    if (!favoriteIdResult.normalizedId) {
      console.error('❌ 无法提取有效的收藏ID:', favoriteIdResult)
      alert('收藏失败：无法识别页面ID')
      return
    }
    
    try {
      const favoriteId = favoriteIdResult.normalizedId
      const isFav = isFavorite(favoriteId)
      
      // 调试信息
      debugIdInfo(favoriteId, '着色页面收藏')
      console.log('🎯 着色页面收藏切换:', {
        originalId: coloringPage.id,
        normalizedId: favoriteId,
        format: favoriteIdResult.format,
        isFavorited: isFav,
        action: isFav ? 'remove' : 'add',
        fallbackIds: favoriteIdResult.fallbackIds
      })
      
      if (isFav) {
        await removeFromFavorites(favoriteId)
        console.log('✅ 已从收藏中移除:', favoriteId)
      } else {
        await addToFavorites(favoriteId)
        console.log('✅ 已添加到收藏:', favoriteId)
      }
      
      trackUserEngagement('favorite_toggled', { 
        pageTitle: actualTitle, 
        action: isFav ? 'removed' : 'added',
        favoriteId: favoriteId,
        originalId: coloringPage.id,
        format: favoriteIdResult.format
      })
    } catch (error) {
      console.error('收藏操作失败:', error)
      alert('收藏操作失败，请稍后再试')
    }
  }, [isAuthenticated, favoriteIdResult, isFavorite, addToFavorites, removeFromFavorites, trackUserEngagement, actualTitle, coloringPage.id])

  const handleRemoveUserColor = (colorToRemove: string) => {
    setUserColors(prev => prev.filter(color => color !== colorToRemove))
  }

  // 当从参考图片选择颜色时，自动添加到用户颜色库
  const handleColorSelect = (color: string) => {
    setActiveColor(color)
    trackUserEngagement('color_selected', { color, source: 'palette' })
    if (!userColors.includes(color) && userColors.length < 12) {
      setUserColors(prev => [...prev, color])
    }
  }

  // Use simplified mobile component on mobile devices (after all hooks)
  if (isMobile) {
    return <MobileColoringPageSimple coloringPage={coloringPage} />
  }

  return (
    <ColoringPageSEOLayout coloringPage={coloringPage}>
      <TooltipProvider>
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="flex flex-col items-center">
            <Card className="w-full overflow-hidden dark:bg-gray-800 dark:border-gray-700">
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
          
          <div className="flex flex-col gap-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Paintbrush className="h-6 w-6 text-primary" />
                  Coloring Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Tools</Label>
                  <ToggleGroup
                    type="single"
                    value={activeTool}
                    onValueChange={(value: Tool) => {
                      if (value) {
                        setActiveTool(value)
                        trackUserEngagement('tool_selected', { tool: value })
                      }
                    }}
                    className="grid grid-cols-3"
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
                    <ToggleGroupItem 
                      value="toner" 
                      aria-label="Color Tone Adjustment Tool"
                      className="relative"
                      title="Adjust color brightness and create depth"
                    >
                      <div className="flex items-center">
                        <CircleDot className="h-4 w-4 mr-2 text-yellow-500" />
                        <span className="font-medium">Toner</span>
                      </div>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div>
                  <Label htmlFor="brush-size" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activeTool === "toner" ? "Toner" : "Brush"} Size: {brushSize}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="brush-size"
                      min={activeTool === "toner" ? 5 : 1}
                      max={activeTool === "toner" ? 50 : 50}
                      step={1}
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      disabled={activeTool === "dropper"}
                    />
                  </div>
                </div>

                {activeTool === "toner" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Color Tone Adjustment
                    </Label>
                    
                    {/* 深浅模式选择 */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Adjustment Mode:
                      </Label>
                      <ToggleGroup
                        type="single"
                        value={tonerMode}
                        onValueChange={(value: "darken" | "lighten") => value && setTonerMode(value)}
                        className="grid grid-cols-2 gap-1 mt-1"
                      >
                        <ToggleGroupItem 
                          value="darken" 
                          aria-label="Darken Mode"
                          className="flex items-center justify-center gap-2 p-2"
                          title="Make colors darker"
                        >
                          <Moon className="h-3 w-3" />
                          <span className="text-xs">Darken</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="lighten" 
                          aria-label="Lighten Mode"
                          className="flex items-center justify-center gap-2 p-2"
                          title="Make colors lighter"
                        >
                          <Sun className="h-3 w-3" />
                          <span className="text-xs">Lighten</span>
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    {/* 强度控制 */}
                    <div>
                      <Label htmlFor="toner-intensity" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Effect Intensity: {Math.round(tonerIntensity * 100)}%
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
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
                    </div>
                  </div>
                )}


                {/* 当前选中颜色显示 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Current Color</Label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-white shadow-lg"
                      style={{ backgroundColor: activeColor }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-300">{activeColor.toUpperCase()}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">Selected Color</div>
                    </div>
                  </div>
                </div>

                {/* 自定义颜色工具 */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Custom Colors</Label>
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
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-4 z-50"
                    >
                      <div className="space-y-3">
                        {/* 快速颜色选择 */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Colors</h4>
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
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Color</h4>
                          <input
                            type="color"
                            className="w-full h-8 rounded border cursor-pointer"
                            onChange={(e) => handleAddCustomColor(e.target.value)}
                            title="Choose Custom Color"
                          />
                        </div>

                        {/* 滴管工具 */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Eyedropper Tool</h4>
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
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">My Colors</Label>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{userColors.length}/12</span>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border dark:border-gray-600">
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
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Default Colors</Label>
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                    <div className="grid grid-cols-6 gap-1.5">
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
            
            {/* Progress Management Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Progress Management</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Save your coloring progress and continue later
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Progress info */}
                {hasSavedProgress && lastSaveTime && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    Last saved: {new Date(lastSaveTime).toLocaleString()}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600" 
                    onClick={handleSaveProgress}
                  >
                    <Save className="mr-1 h-4 w-4" />
                    Save Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-800/30"
                    onClick={handleLoadProgress}
                    disabled={!hasSavedProgress}
                  >
                    <FolderOpen className="mr-1 h-4 w-4" />
                    Load Progress
                  </Button>
                </div>
                
                {hasSavedProgress && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={handleClearProgress}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Clear Saved Progress
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Export & Share</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" 
                    onClick={() => {
                      canvasRef.current?.print()
                      trackUserEngagement('print_clicked', { pageTitle: actualTitle })
                    }}
                  >
                    <Printer className="mr-1 h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/30"
                    onClick={() => {
                      canvasRef.current?.download(`${coloringPage.slug}.png`)
                      trackUserEngagement('download_clicked', { pageTitle: actualTitle, filename: `${coloringPage.slug}.png` })
                    }}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
                
                {/* Share and favorite buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-800/30"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: coloringPage.title,
                          text: `Check out this beautiful ${coloringPage.title} coloring page!`,
                          url: currentUrl
                        })
                      } else {
                        navigator.clipboard.writeText(currentUrl)
                      }
                      trackUserEngagement('share_clicked', { pageTitle: actualTitle })
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "border-2 transition-all",
                      isAuthenticated && favoriteIdResult.normalizedId && isFavorite(favoriteIdResult.normalizedId)
                        ? "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-600"
                        : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-700 dark:hover:bg-pink-800/30"
                    )}
                    onClick={handleFavoriteToggle}
                    disabled={!isAuthenticated || !favoriteIdResult.normalizedId}
                  >
                    <Heart className={cn(
                      "h-4 w-4 mr-1 transition-all",
                      isAuthenticated && favoriteIdResult.normalizedId && isFavorite(favoriteIdResult.normalizedId) 
                        ? "fill-pink-600 text-pink-600" 
                        : ""
                    )} />
                    {isAuthenticated && favoriteIdResult.normalizedId && isFavorite(favoriteIdResult.normalizedId) ? 'Favorited' : 'Favorite'}
                  </Button>
                </div>
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
      </TooltipProvider>
    </ColoringPageSEOLayout>
  )
}

// 简单的Label组件
function Label(props: React.ComponentProps<"label">) {
  return <label {...props} />
}