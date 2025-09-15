"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { ColoringPageData } from '@/lib/coloring-data'
import { MobileFloatingToolbar } from './mobile-floating-toolbar'
import { MobileColorPicker } from './mobile-color-picker'
import { ColoringCanvas } from './coloring-canvas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Palette, 
  Share2, 
  Undo2, 
  Redo2, 
  RotateCcw,
  Maximize2,
  Minimize2,
  Heart,
  Star,
  Save,
  FolderOpen,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useFavorites } from '@/hooks/use-favorites'

type UIMode = 'minimal' | 'standard' | 'fullscreen' | 'expanded'

interface MobileColoringPageClientProps {
  coloringPage: ColoringPageData
}

export function MobileColoringPageClient({ coloringPage }: MobileColoringPageClientProps) {
  const { user, isAuthenticated } = useAuth()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  
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
  const [isDrawing, setIsDrawing] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [tonerMode, setTonerMode] = useState<'darken' | 'lighten'>('darken')
  const [tonerIntensity, setTonerIntensity] = useState(0.3)
  
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

  // 保存进度处理函数
  const handleSaveProgress = useCallback(() => {
    if (canvasRef.current) {
      try {
        const success = canvasRef.current.saveProgress()
        if (success) {
          setHasSavedProgress(true)
          setLastSaveTime(new Date().toISOString())
          alert('✅ 着色进度已保存！下次打开时可以继续着色。')
        } else {
          // 检查控制台错误并提供更具体的错误信息
          alert('❌ 保存失败！可能原因:\n• 着色内容过多导致文件过大\n• 浏览器存储空间不足\n• 请尝试清理浏览器缓存或在着色较少时保存')
        }
      } catch (error) {
        console.error('保存进度时发生错误:', error)
        alert('❌ 保存失败！请检查浏览器控制台查看详细错误信息。')
      }
    }
  }, [])

  // 加载进度处理函数
  const handleLoadProgress = useCallback(() => {
    if (canvasRef.current) {
      if (confirm('确定要加载之前的着色进度吗？当前的着色内容将被替换。')) {
        const success = canvasRef.current.loadProgress()
        if (success) {
          alert('✅ 着色进度已恢复！')
        } else {
          alert('❌ 加载失败，可能没有保存的进度或数据已损坏。')
        }
      }
    }
  }, [])

  // 清除进度处理函数
  const handleClearProgress = useCallback(() => {
    if (canvasRef.current && confirm('确定要清除保存的进度吗？此操作不可撤销。')) {
      canvasRef.current.clearProgress()
      setHasSavedProgress(false)
      setLastSaveTime(null)
      alert('🗑️ 保存的进度已清除。')
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
  
  // Quick access colors for right panel
  const quickColors = [
    ...colorPalette.primary.slice(0, 4),
    ...colorPalette.secondary.slice(0, 2)
  ]

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
      alert('请先登录才能收藏页面')
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
      alert('收藏操作失败，请稍后再试')
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

  return (
    <div className={cn(
      "h-screen w-full bg-white relative overflow-hidden",
      "touch-none select-none", // Prevent text selection and scrolling
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header - Hidden in fullscreen and minimal modes */}
      {!isFullscreen && !isMinimalMode && (
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between" 
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

      {/* Main Drawing Area */}
      <div className="flex-1 relative">
        {/* Canvas Container */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-full h-full max-w-sm max-h-[70vh] relative">
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


        {/* Floating Toolbar - Left side */}
        {showUI && (
          <MobileFloatingToolbar
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            canUndo={canUndo}
            canRedo={canRedo}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
          />
        )}

        {/* Bottom Action Bar */}
        {showUI && !isFullscreen && (
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white border-t p-4"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            {/* Progress info bar */}
            {hasSavedProgress && lastSaveTime && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded mb-2 text-center">
                Last saved: {new Date(lastSaveTime).toLocaleString()}
              </div>
            )}
            
            {/* Main action buttons - first row */}
            <div className="flex justify-center gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(true)}
                className="flex-1 max-w-[80px]"
              >
                <Palette className="h-4 w-4 mr-1" />
                Colors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1 max-w-[80px]"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1 max-w-[80px]"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            {/* Progress management buttons - second row */}
            <div className="flex justify-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveProgress}
                className="flex-1 max-w-[80px] bg-purple-600 text-white hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadProgress}
                disabled={!hasSavedProgress}
                className="flex-1 max-w-[80px] bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 disabled:opacity-50"
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                Load
              </Button>
              {hasSavedProgress && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearProgress}
                  className="flex-1 max-w-[80px] text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            {isFullscreen && (
              <div className="flex justify-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="flex-1 max-w-[100px]"
                >
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

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