"use client"

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  Star, 
  StarOff, 
  Palette, 
  Clock, 
  Pipette,
  ChevronDown,
  SwatchBook
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileColorPickerProps {
  isOpen: boolean
  onClose: () => void
  selectedColor: string
  onColorSelect: (color: string) => void
  quickColors: string[]
  colorPalette?: {
    primary: string[]
    secondary: string[]
    pastels: string[]
    vibrant: string[]
    earth: string[]
    cool: string[]
  }
}

export function MobileColorPicker({
  isOpen,
  onClose,
  selectedColor,
  onColorSelect,
  quickColors,
  colorPalette
}: MobileColorPickerProps) {
  const [customColor, setCustomColor] = useState('#000000')
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [favoriteColors, setFavoriteColors] = useState<string[]>([])
  const [supportsEyedropper, setSupportsEyedropper] = useState(false)

  // Use provided color palette or default
  const colorPalettes = colorPalette || {
    primary: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    secondary: ['#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'],
    pastels: ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFE4E1'],
    vibrant: ['#FF1493', '#00CED1', '#FF4500', '#32CD32', '#8A2BE2', '#FF6347'],
    earth: ['#8B4513', '#228B22', '#2F4F4F', '#B22222', '#DAA520', '#CD853F'],
    cool: ['#4682B4', '#2E8B57', '#708090', '#483D8B', '#5F9EA0', '#6495ED']
  }

  // Check for EyeDropper API support
  useEffect(() => {
    setSupportsEyedropper('EyeDropper' in window)
  }, [])

  // Load saved data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mobile-coloring-recent-colors')
      if (saved) {
        try {
          setRecentColors(JSON.parse(saved))
        } catch (error) {
          console.warn('Failed to load recent colors:', error)
        }
      }

      const savedFavorites = localStorage.getItem('mobile-coloring-favorite-colors')
      if (savedFavorites) {
        try {
          setFavoriteColors(JSON.parse(savedFavorites))
        } catch (error) {
          console.warn('Failed to load favorite colors:', error)
        }
      }
    }
  }, [])

  // Add color to recent colors
  const addToRecent = useCallback((color: string) => {
    setRecentColors(prev => {
      const updated = [color, ...prev.filter(c => c !== color)].slice(0, 24)
      if (typeof window !== 'undefined') {
        localStorage.setItem('mobile-coloring-recent-colors', JSON.stringify(updated))
      }
      return updated
    })
  }, [])

  // Toggle favorite color
  const toggleFavorite = useCallback((color: string) => {
    setFavoriteColors(prev => {
      const updated = prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color].slice(0, 24)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('mobile-coloring-favorite-colors', JSON.stringify(updated))
      }
      return updated
    })
  }, [])

  // Handle color selection
  const handleColorSelect = useCallback((color: string) => {
    onColorSelect(color)
    addToRecent(color)
    onClose()
  }, [onColorSelect, addToRecent, onClose])

  // Handle custom color input
  const handleCustomColorChange = useCallback((value: string) => {
    setCustomColor(value)
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      handleColorSelect(value)
    }
  }, [handleColorSelect])

  // EyeDropper API
  const handleEyeDropper = useCallback(async () => {
    if (!supportsEyedropper) return

    try {
      // @ts-ignore - EyeDropper API is experimental
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      if (result?.sRGBHex) {
        handleColorSelect(result.sRGBHex)
      }
    } catch (error) {
      console.warn('EyeDropper failed:', error)
    }
  }, [supportsEyedropper, handleColorSelect])

  // Handle swipe to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch.clientY > window.innerHeight * 0.1) {
      // Allow swipe down to close if starting from main content area
      e.currentTarget.setAttribute('data-start-y', touch.clientY.toString())
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const startY = e.currentTarget.getAttribute('data-start-y')
    if (startY) {
      const touch = e.changedTouches[0]
      const deltaY = touch.clientY - parseInt(startY)
      if (deltaY > 100) { // Swipe down threshold
        onClose()
      }
      e.currentTarget.removeAttribute('data-start-y')
    }
  }, [onClose])

  if (!isOpen) return null

  console.log('🎨 MobileColorPicker rendering, isOpen:', isOpen)

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-end">
      <div 
        className="w-full bg-white rounded-t-3xl shadow-xl max-h-[80vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Choose Color</h2>
          <div className="flex items-center gap-2">
            {supportsEyedropper && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEyeDropper}
                className="p-2"
              >
                <Pipette className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Current Color Display */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl border-2 border-gray-200 shadow-inner"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Selected Color</div>
              <div className="font-mono text-sm font-medium">{selectedColor.toUpperCase()}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(selectedColor)}
                className="mt-1 p-1 h-auto"
              >
                {favoriteColors.includes(selectedColor) ? (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="ml-1 text-xs">
                  {favoriteColors.includes(selectedColor) ? 'Remove' : 'Add to'} Favorites
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Color Picker Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="palette" className="h-full">
            <TabsList className="w-full justify-start px-4 bg-white border-b rounded-none h-auto p-0">
              <TabsTrigger value="palette" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 data-[state=active]:bg-blue-100">
                <SwatchBook className="h-4 w-4" />
                Colors
              </TabsTrigger>
              {recentColors.length > 0 && (
                <TabsTrigger value="recent" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 data-[state=active]:bg-blue-100">
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
              )}
              {favoriteColors.length > 0 && (
                <TabsTrigger value="favorites" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 data-[state=active]:bg-blue-100">
                  <Star className="h-4 w-4" />
                  Favorites
                </TabsTrigger>
              )}
              <TabsTrigger value="custom" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 data-[state=active]:bg-blue-100">
                <Palette className="h-4 w-4" />
                Custom
              </TabsTrigger>
            </TabsList>

            {/* Palette Tab - Optimized Layout */}
            <TabsContent value="palette" className="px-4 py-3 overflow-auto max-h-[50vh]">
              <div className="space-y-3">
                {Object.entries(colorPalettes).map(([name, colors]) => (
                  <div key={name} className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-2 capitalize">
                      {name === 'primary' ? 'Essential' : 
                       name === 'secondary' ? 'Popular' : 
                       name === 'pastels' ? 'Pastels' : 
                       name === 'vibrant' ? 'Vibrant' : 
                       name === 'earth' ? 'Earth Tones' : 
                       'Cool Tones'}
                    </h3>
                    <div className="grid grid-cols-6 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={cn(
                            "w-10 h-10 rounded-lg border-2 shadow-sm transition-all",
                            "touch-manipulation active:scale-95",
                            selectedColor === color 
                              ? "border-blue-500 ring-2 ring-blue-200 scale-105" 
                              : "border-gray-300 hover:border-gray-400"
                          )}
                          style={{ backgroundColor: color }}
                          title={`${color} - ${name} palette`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Custom Color Tab */}
            <TabsContent value="custom" className="px-4 py-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Color Picker
                  </label>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-full h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Hex Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={customColor}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      placeholder="#000000"
                      className="font-mono text-sm"
                    />
                    <div
                      className="w-12 h-10 rounded-lg border-2 border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: customColor }}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handleColorSelect(customColor)}
                  className="w-full h-10"
                  disabled={!/^#[0-9A-F]{6}$/i.test(customColor)}
                >
                  Use This Color
                </Button>
              </div>
            </TabsContent>

            {/* Recent Colors Tab */}
            {recentColors.length > 0 && (
              <TabsContent value="recent" className="px-4 py-3">
                <div className="grid grid-cols-8 gap-2">
                  {recentColors.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 shadow-sm transition-all",
                        "touch-manipulation active:scale-95",
                        selectedColor === color 
                          ? "border-blue-500 ring-2 ring-blue-200" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </TabsContent>
            )}

            {/* Favorites Tab */}
            {favoriteColors.length > 0 && (
              <TabsContent value="favorites" className="px-4 py-3">
                <div className="grid grid-cols-8 gap-2">
                  {favoriteColors.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 shadow-sm transition-all relative",
                        "touch-manipulation active:scale-95",
                        selectedColor === color 
                          ? "border-blue-500 ring-2 ring-blue-200" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      <Star className="absolute -top-1 -right-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </button>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}