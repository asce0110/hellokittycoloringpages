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
  Star
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
    }
  })
  
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
  
  // UI State
  const [uiMode, setUIMode] = useState<UIMode>('standard')
  const [selectedTool, setSelectedTool] = useState<'brush' | 'fill' | 'toner'>('brush')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  // Canvas ref with correct type
  const canvasRef = useRef<{
    undo: () => void
    reset: () => void
    download: (filename: string) => void
    print: () => void
  }>(null)
  
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
    if (!isAuthenticated) return
    
    const isFav = isFavorite(coloringPage.id)
    if (isFav) {
      await removeFromFavorites(coloringPage.id)
    } else {
      await addToFavorites(coloringPage.id)
    }
  }, [isAuthenticated, coloringPage.id, isFavorite, addToFavorites, removeFromFavorites])

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
                  isFavorite(coloringPage.id) ? "fill-red-500 text-red-500" : "text-gray-500"
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
              brushSize={5}
              onHistoryChange={setCanUndo}
            />
          </div>
        </div>

        {/* Quick Color Selector - Right side */}
        {showUI && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
            {quickColors.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "w-12 h-12 rounded-full border-2 shadow-lg transition-all",
                  "touch-manipulation", // Optimize for touch
                  selectedColor === color 
                    ? "border-blue-500 scale-110" 
                    : "border-white hover:scale-105"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorPicker(true)}
              className="w-12 h-12 p-0 rounded-full bg-white shadow-lg"
            >
              <Palette className="h-5 w-5" />
            </Button>
          </div>
        )}

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
            className="absolute left-4 top-20 safe-area-aware"
          />
        )}

        {/* Bottom Action Bar */}
        {showUI && !isFullscreen && (
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center gap-4"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1 max-w-[100px]"
            >
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 max-w-[100px]"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {isFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="flex-1 max-w-[100px]"
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit
              </Button>
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