"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { ColoringPageData } from '@/lib/coloring-data'
import { MobileColorPicker } from './mobile-color-picker'
import { ColoringCanvas } from './coloring-canvas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Palette, 
  Share2, 
  Undo2, 
  RotateCcw,
  Maximize2,
  Minimize2,
  Heart,
  Save,
  FolderOpen,
  Trash2,
  Brush,
  Droplets,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useFavorites } from '@/hooks/use-favorites'
import { useSEOOptimization } from '@/hooks/use-seo-optimization'

type UIMode = 'minimal' | 'standard' | 'fullscreen'

interface MobileColoringPageClientProps {
  coloringPage: ColoringPageData
}

export function MobileColoringPageClient({ coloringPage }: MobileColoringPageClientProps) {
  const { user, isAuthenticated } = useAuth()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const { trackUserEngagement } = useSEOOptimization(coloringPage)
  
  // Get URL params and localStorage data (same logic as desktop)
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  
  // Load localStorage data (same as desktop)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(`coloring-page-${coloringPage.slug}`)
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setLocalStorageData(parsedData)
          console.log('💾 Mobile: 从localStorage加载数据:', parsedData)
        } catch (error) {
          console.error('❌ Mobile: localStorage数据解析失败:', error)
        }
      }
    }
  }, [coloringPage.slug])
  
  // Use same priority logic as desktop: URL params > localStorage > props
  const actualImageUrl = searchParams.get("imageUrl") || localStorageData?.imageUrl || coloringPage.imageUrl
  const actualTitle = searchParams.get("title") || localStorageData?.title || coloringPage.title
  const actualDescription = searchParams.get("description") || localStorageData?.description || coloringPage.description
  
  // Process image URL to handle CORS issues
  const processedImageUrl = useMemo(() => {
    if (!actualImageUrl) return ''
    
    // If it's an external URL (like R2 storage), use proxy API
    if (actualImageUrl.startsWith('https://r2.coloringpagesprintable.net/')) {
      return `/api/proxy-image?url=${encodeURIComponent(actualImageUrl)}`
    }
    
    // For local images, use as-is
    return actualImageUrl
  }, [actualImageUrl])
  
  console.log('📱 Mobile ColoringPageClient - Using image info:', {
    fromParams: {
      imageUrl: searchParams.get("imageUrl"),
      title: searchParams.get("title"),
      description: searchParams.get("description")
    },
    fromLocalStorage: localStorageData,
    fromProps: {
      imageUrl: coloringPage.imageUrl,
      title: coloringPage.title,
      description: coloringPage.description
    },
    final: {
      imageUrl: actualImageUrl,
      title: actualTitle,
      description: actualDescription
    },
    processed: {
      imageUrl: processedImageUrl,
      isR2Proxy: actualImageUrl?.startsWith('https://r2.coloringpagesprintable.net/'),
      isDemo: actualImageUrl?.includes('demo') || actualImageUrl?.includes('placeholder')
    }
  })
  
  // UI State
  const [uiMode, setUIMode] = useState<UIMode>('standard')
  const [selectedTool, setSelectedTool] = useState<'brush' | 'fill' | 'toner'>('brush')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showAdvancedTools, setShowAdvancedTools] = useState(false)
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(true)
  
  // Debug state changes
  useEffect(() => {
    console.log('🎨 Mobile coloring showColorPicker state changed:', showColorPicker)
  }, [showColorPicker])
  const [isDrawing, setIsDrawing] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [tonerMode, setTonerMode] = useState<'darken' | 'lighten'>('darken')
  const [tonerIntensity, setTonerIntensity] = useState(0.3)
  
  // 手势和交互模式状态
  const [interactionMode, setInteractionMode] = useState<'draw' | 'pan'>('draw')
  const [isPanning, setIsPanning] = useState(false)
  const touchStartTime = useRef<number>(0)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  
  // 进度保存相关状态
  const [hasSavedProgress, setHasSavedProgress] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null)
  
  // Canvas ref with correct type
  const canvasRef = useRef<{
    undo: () => void; 
    reset: () => void; 
    download: (filename: string) => void; 
    print: () => void;
    saveProgress: (key?: string) => boolean;
    loadProgress: (key?: string) => boolean;
    hasProgress: (key?: string) => boolean;
    clearProgress: (key?: string) => void;
  }>(null)
  
  // 检查是否有保存的进度
  useEffect(() => {
    if (canvasRef.current && processedImageUrl) {
      const hasProgress = canvasRef.current.hasProgress()
      setHasSavedProgress(hasProgress)
      
      // 获取保存时间
      if (hasProgress) {
        try {
          const saveKey = `coloring-progress-${processedImageUrl}`
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
  }, [processedImageUrl])

  // 保存进度处理函数 - 与桌面端同步
  const handleSaveProgress = useCallback(() => {
    if (canvasRef.current) {
      try {
        const success = canvasRef.current.saveProgress()
        if (success) {
          setHasSavedProgress(true)
          setLastSaveTime(new Date().toISOString())
          alert('✅ Progress saved! You can continue coloring next time.')
          trackUserEngagement('progress_saved', { pageTitle: actualTitle })
        } else {
          // 检查控制台错误并提供更具体的错误信息
          alert('❌ Save failed! Possible reasons:\n• Too much coloring content (file too large)\n• Insufficient browser storage space\n• Try clearing browser cache or save with less coloring')
        }
      } catch (error) {
        console.error('保存进度时发生错误:', error)
        alert('❌ Save failed! Please check the browser console for detailed error information.')
      }
    }
  }, [actualTitle, trackUserEngagement])

  // 加载进度处理函数
  const handleLoadProgress = useCallback(() => {
    if (canvasRef.current) {
      if (confirm('Are you sure you want to load previous progress? Current coloring will be replaced.')) {
        const success = canvasRef.current.loadProgress()
        if (success) {
          alert('✅ Progress restored!')
        } else {
          alert('❌ Load failed. No saved progress found or data is corrupted.')
        }
      }
    }
  }, [])

  // 清除进度处理函数
  const handleClearProgress = useCallback(() => {
    if (canvasRef.current && confirm('Are you sure you want to clear saved progress? This action cannot be undone.')) {
      canvasRef.current.clearProgress()
      setHasSavedProgress(false)
      setLastSaveTime(null)
      alert('🗑️ Saved progress cleared.')
    }
  }, [])
  
  // Expanded color palette for better selection
  const colorPalette = {
    primary: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    secondary: ['#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'],
    pastels: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFE4E1'],
    vibrant: ['#FF1493', '#00CED1', '#FF4500', '#32CD32', '#8A2BE2', '#FF6347'],
    earth: ['#8B4513', '#228B22', '#2F4F4F', '#B22222', '#DAA520', '#CD853F'],
    cool: ['#4682B4', '#2E8B57', '#708090', '#483D8B', '#5F9EA0', '#6495ED']
  }
  
  // Quick access colors for mobile - most commonly used
  const quickColors = [
    '#000000', // black
    '#FF0000', // red  
    '#0000FF', // blue
    '#00AA00', // green
    '#FFAA00', // orange
    '#AA00AA', // purple
    '#FFFF00', // yellow
    '#8B4513'  // brown
  ]

  // 简化的手势处理 - 仅在canvas上应用
  const handleCanvasTouchStart = useCallback((e: React.TouchEvent) => {
    // 双手指触摸时，让ColoringCanvas处理缩放，不设置平移模式
    if (e.touches.length >= 2) {
      console.log('🤏 检测到双指触摸，让ColoringCanvas处理缩放')
      // 不阻止事件冒泡，让ColoringCanvas接收到双指事件
      return
    }
    // 单指触摸时设置绘图模式
    if (interactionMode !== 'draw') {
      setInteractionMode('draw')
    }
  }, [interactionMode])

  const handleCanvasTouchEnd = useCallback((e: React.TouchEvent) => {
    // 如果还有触摸点，说明可能是多指操作的一部分，不重置状态
    if (e.touches.length > 0) {
      return
    }
    
    // 所有手指离开时，重置到绘图模式
    if (isPanning) {
      setIsPanning(false)
      setTimeout(() => setInteractionMode('draw'), 100)
    }
  }, [isPanning])

  // 切换交互模式的函数
  const toggleInteractionMode = useCallback(() => {
    setInteractionMode(prev => prev === 'draw' ? 'pan' : 'draw')
    setIsPanning(false)
  }, [])

  // Handle drawing state changes
  const handleDrawingStart = useCallback(() => {
    setIsDrawing(true)
    if (uiMode === 'standard') {
      setUIMode('minimal')
    }
  }, [uiMode])

  const handleDrawingEnd = useCallback(() => {
    setIsDrawing(false)
    setTimeout(() => {
      if (uiMode === 'minimal' && !isDrawing) {
        setUIMode('standard')
      }
    }, 1000) // Delay to avoid flickering
  }, [uiMode, isDrawing])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setUIMode(prev => prev === 'fullscreen' ? 'standard' : 'fullscreen')
  }, [])

  // Handle canvas actions
  const handleUndo = useCallback(() => {
    canvasRef.current?.undo()
  }, [])

  const handleRedo = useCallback(() => {
    // Note: Current canvas doesn't support redo, but keep for future enhancement
    console.log('Redo action - not yet implemented')
  }, [])

  const handleClear = useCallback(() => {
    if (confirm("Clear all coloring? This cannot be undone.")) {
      canvasRef.current?.reset()
    }
  }, [])

  const handleDownload = useCallback(() => {
    canvasRef.current?.download(`${coloringPage.slug}.png`)
  }, [coloringPage.slug])

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: actualTitle,
        text: `Check out my coloring of ${actualTitle}!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }, [actualTitle])

  const handleFavoriteToggle = useCallback(async () => {
    if (!isAuthenticated) {
      alert('Please login to favorite this page')
      return
    }
    
    try {
      // Use same ID logic as desktop for consistency
      const libraryImageId = (coloringPage as any).libraryImageId || coloringPage.id
      const isFav = isFavorite(libraryImageId)
      
      if (isFav) {
        await removeFromFavorites(libraryImageId)
      } else {
        await addToFavorites(libraryImageId)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      alert('Favorite operation failed, please try again later')
    }
  }, [isAuthenticated, coloringPage, isFavorite, addToFavorites, removeFromFavorites])

  // Safe area padding for devices with notches
  useEffect(() => {
    const updateSafeArea = () => {
      const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px'
      const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px'
      
      document.documentElement.style.setProperty('--safe-area-top', safeAreaTop)
      document.documentElement.style.setProperty('--safe-area-bottom', safeAreaBottom)
    }
    
    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    window.addEventListener('orientationchange', updateSafeArea)
    
    return () => {
      window.removeEventListener('resize', updateSafeArea)
      window.removeEventListener('orientationchange', updateSafeArea)
    }
  }, [])

  const isMinimalMode = uiMode === 'minimal'
  const isFullscreen = uiMode === 'fullscreen'
  const showUI = !isMinimalMode || !isDrawing
  
  console.log('🎨 UI State:', { isMinimalMode, isFullscreen, showUI, isDrawing })

  return (
    <div className={cn(
      "h-screen w-full bg-white relative overflow-hidden flex flex-col",
      "select-none touch-pan-y", // Prevent text selection but allow touch
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header - Hidden in fullscreen and minimal modes */}
      {!isFullscreen && !isMinimalMode && (
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0" 
             style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {actualTitle}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {coloringPage.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {coloringPage.category}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFavoriteToggle}
                className="p-2"
              >
                <Heart className={cn(
                  "h-5 w-5",
                  isFavorite((coloringPage as any).libraryImageId || coloringPage.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                )} />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleFullscreen}
              className="p-2"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Drawing Area - Fills remaining space */}
      <div className="flex-1 flex flex-col relative min-h-0">
        {/* Canvas Container - Takes available space minus toolbar */}
        <div className="flex-1 bg-gray-50 p-2 min-h-0">
          <div className="w-full h-full flex items-center justify-center">
            <div 
              ref={canvasContainerRef}
              className="w-full h-full relative"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            >
              <div 
                className="w-full h-full rounded-xl overflow-hidden shadow-lg bg-white"
                onTouchStart={handleCanvasTouchStart}
                onTouchEnd={handleCanvasTouchEnd}
              >
                <ColoringCanvas
                  ref={canvasRef}
                  imageUrl={processedImageUrl}
                  activeColor={selectedColor}
                  activeTool={selectedTool === 'fill' ? 'dropper' : selectedTool === 'toner' ? 'toner' : 'brush'}
                  brushSize={brushSize}
                  tonerMode={tonerMode}
                  tonerIntensity={tonerIntensity}
                  onHistoryChange={setCanUndo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Bottom Toolbar - Outside main area */}
      {showUI && !isFullscreen && (
        <div className="bg-white border-t flex-shrink-0" 
             style={{ 
               paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
             }}
        >
            {/* Always Visible - Minimal Toolbar */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                {/* Quick Colors */}
                <div className="flex gap-2">
                  {quickColors.slice(0, 4).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        console.log('🎨 Quick color selected:', color)
                        setSelectedColor(color)
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all touch-manipulation",
                        selectedColor === color 
                          ? "border-blue-500 ring-2 ring-blue-200 scale-110" 
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      style={{ backgroundColor: color }}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>

                {/* Core Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveProgress}
                    className="h-9 px-3 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
                    className="h-9 px-3"
                  >
                    {isToolbarCollapsed ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expandable Full Toolbar */}
            {!isToolbarCollapsed && (
              <div className="px-4 pb-2 border-t border-gray-200">
                {/* Color Selection Row */}
                <div className="flex items-center justify-between mb-2 pt-2">
                  <div className="flex gap-2">
                    {quickColors.slice(4, 8).map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          console.log('🎨 Quick color selected:', color)
                          setSelectedColor(color)
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all touch-manipulation",
                          selectedColor === color 
                            ? "border-blue-500 ring-2 ring-blue-200 scale-110" 
                            : "border-gray-300 hover:border-gray-400"
                        )}
                        style={{ backgroundColor: color }}
                        title={`Select ${color}`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🎨 Opening color picker...')
                      setShowColorPicker(true)
                    }}
                    className="h-8 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Palette className="h-4 w-4 mr-1" />
                    More
                  </Button>
                </div>

                {/* Tools Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">
                    <Button
                      variant={selectedTool === 'brush' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('brush')}
                      className="h-8 px-3 text-xs"
                    >
                      <Brush className="h-3 w-3 mr-1" />
                      Brush
                    </Button>
                    <Button
                      variant={selectedTool === 'fill' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('fill')}
                      className="h-8 px-3 text-xs"
                    >
                      <Droplets className="h-3 w-3 mr-1" />
                      Fill
                    </Button>
                    <Button
                      variant={selectedTool === 'toner' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('toner')}
                      className="h-8 px-3 text-xs"
                    >
                      <Palette className="h-3 w-3 mr-1" />
                      Toner
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className="h-8 px-3 text-xs"
                    >
                      <Undo2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadProgress}
                      disabled={!hasSavedProgress}
                      className="h-8 px-3 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                    >
                      <FolderOpen className="h-3 w-3 mr-1" />
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                    {/* Favorites for authenticated users */}
                    {isAuthenticated && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleFavoriteToggle}
                        className="h-8 px-3"
                      >
                        <Heart className={cn(
                          "h-3 w-3",
                          isFavorite((coloringPage as any).libraryImageId || coloringPage.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                        )} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Mode Bottom Bar */}
        {showUI && isFullscreen && (
          <div className="absolute left-0 right-0 bg-white border-t p-4 z-30"
               style={{ 
                 bottom: 'max(40px, env(safe-area-inset-bottom) + 20px)',
                 paddingBottom: 'max(20px, env(safe-area-inset-bottom))' 
               }}
          >
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="flex-1 max-w-[100px]"
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Fullscreen
              </Button>
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        <MobileColorPicker
          isOpen={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          quickColors={quickColors}
          colorPalette={colorPalette}
        />
      </div>
  )
}