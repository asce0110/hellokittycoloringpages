import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, Trash2 } from "lucide-react"
import { LibraryImage } from "@/lib/types"
import { ColorReference } from "@/lib/reference-images"

interface ColorReferenceUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: {
    originalImage: string
    coloredImage: string
    title: string
    colorScheme: {
      primary: string[]
      secondary: string[]
      accent: string[]
    }
  }) => void
  libraryImages?: LibraryImage[]
  editingReference?: (ColorReference & { originalImageTitle?: string }) | null
}

export function ColorReferenceUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  libraryImages = [],
  editingReference 
}: ColorReferenceUploadModalProps) {
  const [selectedOriginal, setSelectedOriginal] = useState(editingReference?.original || "")
  const isPresetOriginal = editingReference?.original && !editingReference?.colored // 是否是预设的原图（新添加模式）
  const [coloredImageFile, setColoredImageFile] = useState<File | null>(null)
  const [coloredImageUrl, setColoredImageUrl] = useState(editingReference?.colored || "")
  const [title, setTitle] = useState(editingReference?.title || "")
  const [primaryColors, setPrimaryColors] = useState<string[]>(editingReference?.colorScheme.primary || ["#FF69B4", "#FFFFFF"])
  const [secondaryColors, setSecondaryColors] = useState<string[]>(editingReference?.colorScheme.secondary || ["#00BCD4", "#FFDC00"])
  const [accentColors, setAccentColors] = useState<string[]>(editingReference?.colorScheme.accent || ["#FF4136", "#2ECC40"])
  const [uploading, setUploading] = useState(false)
  const [extractingColors, setExtractingColors] = useState(false)

  // 同步editingReference的变化到组件状态
  useEffect(() => {
    if (editingReference) {
      console.log('🔄 Syncing editingReference to state:', editingReference)
      setSelectedOriginal(editingReference.original || "")
      setColoredImageUrl(editingReference.colored || "")
      setTitle(editingReference.title || "")
      setPrimaryColors(editingReference.colorScheme?.primary || ["#FF69B4", "#FFFFFF"])
      setSecondaryColors(editingReference.colorScheme?.secondary || ["#00BCD4", "#FFDC00"])
      setAccentColors(editingReference.colorScheme?.accent || ["#FF4136", "#2ECC40"])
    } else if (!isOpen) {
      // 当modal关闭且没有editingReference时，重置所有状态
      console.log('🔄 Resetting modal state')
      setSelectedOriginal("")
      setColoredImageUrl("")
      setTitle("")
      setPrimaryColors(["#FF69B4", "#FFFFFF"])
      setSecondaryColors(["#00BCD4", "#FFDC00"])
      setAccentColors(["#FF4136", "#2ECC40"])
      setUploading(false)
      setExtractingColors(false)
    }
  }, [editingReference, isOpen])

  const extractColorsFromImage = (imageFile: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // 使用更大的采样尺寸以获得更好的颜色分析
        const maxSize = 200
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const colors: { r: number, g: number, b: number, count: number }[] = []
        
        // 使用更精细的颜色采样和聚类
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1] 
          const b = data[i + 2]
          const a = data[i + 3]
          
          // 跳过透明像素
          if (a < 200) continue
          
          // 更严格的亮度过滤 - 避免过亮和过暗
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
          if (brightness > 250 || brightness < 20) continue
          
          // 跳过灰色调（饱和度太低的颜色）
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const saturation = max === 0 ? 0 : (max - min) / max
          if (saturation < 0.2) continue // 跳过饱和度低于20%的颜色
          
          // 使用更精细的量化 - 16级而不是8级
          const qR = Math.round(r / 16) * 16
          const qG = Math.round(g / 16) * 16 
          const qB = Math.round(b / 16) * 16
          
          // 查找相似颜色或添加新颜色
          const existingColor = colors.find(c => 
            Math.abs(c.r - qR) <= 16 && 
            Math.abs(c.g - qG) <= 16 && 
            Math.abs(c.b - qB) <= 16
          )
          
          if (existingColor) {
            existingColor.count++
            // 更新为加权平均颜色
            const totalCount = existingColor.count
            existingColor.r = Math.round((existingColor.r * (totalCount - 1) + r) / totalCount)
            existingColor.g = Math.round((existingColor.g * (totalCount - 1) + g) / totalCount)
            existingColor.b = Math.round((existingColor.b * (totalCount - 1) + b) / totalCount)
          } else {
            colors.push({ r: qR, g: qG, b: qB, count: 1 })
          }
        }
        
        // 按出现次数和颜色鲜艳度排序
        const sortedColors = colors
          .filter(c => c.count >= 5) // 只保留出现至少5次的颜色
          .sort((a, b) => {
            // 计算颜色的"重要性"得分：出现次数 × 饱和度
            const satA = Math.max(a.r, a.g, a.b) === 0 ? 0 : (Math.max(a.r, a.g, a.b) - Math.min(a.r, a.g, a.b)) / Math.max(a.r, a.g, a.b)
            const satB = Math.max(b.r, b.g, b.b) === 0 ? 0 : (Math.max(b.r, b.g, b.b) - Math.min(b.r, b.g, b.b)) / Math.max(b.r, b.g, b.b)
            const scoreA = a.count * (1 + satA)
            const scoreB = b.count * (1 + satB)
            return scoreB - scoreA
          })
          .slice(0, 10) // 取前10个最重要的颜色
          .map(color => {
            return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`
          })
        
        console.log('🎨 Extracted colors:', sortedColors)
        resolve(sortedColors)
      }
      
      img.onerror = () => {
        console.error('Failed to load image for color extraction')
        resolve([])
      }
      
      img.src = URL.createObjectURL(imageFile)
    })
  }

  const handleColoredImageUpload = async (file: File) => {
    setUploading(true)
    setExtractingColors(true)
    try {
      console.log('🔄 Starting colored image upload:', file.name)
      
      // 先压缩图片
      console.log('🗜️ Compressing image...')
      const compressionResponse = await fetch('/api/compress-image', {
        method: 'POST',
        body: (() => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', 'reference') // 指定为参考图压缩
          return formData
        })()
      })
      
      if (!compressionResponse.ok) {
        console.warn('⚠️ Compression failed, using original file')
        // 如果压缩失败，继续使用原文件
      }
      
      let fileToUpload = file
      if (compressionResponse.ok) {
        const compressionResult = await compressionResponse.json()
        if (compressionResult.success && compressionResult.compressedBuffer) {
          // 将压缩后的buffer转换为File对象
          const compressedBlob = new Blob([new Uint8Array(compressionResult.compressedBuffer.data)], {
            type: 'image/png'
          })
          fileToUpload = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.png'), {
            type: 'image/png'
          })
          console.log('✅ Compression successful:', {
            original: `${(file.size / 1024).toFixed(1)}KB`,
            compressed: `${(fileToUpload.size / 1024).toFixed(1)}KB`,
            ratio: `${((1 - fileToUpload.size / file.size) * 100).toFixed(1)}%`
          })
        }
      }
      
      // 调用实际的上传API
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('folder', 'references')
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }
      
      const uploadResult = await uploadResponse.json()
      console.log('✅ Upload successful:', uploadResult)
      
      // 使用服务器返回的URL
      const uploadedUrl = uploadResult.url || uploadResult.data?.url
      if (!uploadedUrl) {
        throw new Error('Upload succeeded but no URL returned')
      }
      
      setColoredImageUrl(uploadedUrl)
      setColoredImageFile(file)
      
      console.log('🎨 Starting color extraction...')
      
      // 自动提取颜色
      const extractedColors = await extractColorsFromImage(file)
      if (extractedColors.length > 0) {
        // 智能分类颜色到不同类别
        const categorizeColors = (colors: string[]) => {
          const colorData = colors.map(hex => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16) 
            const b = parseInt(hex.slice(5, 7), 16)
            
            // 计算HSV值用于分类
            const max = Math.max(r, g, b) / 255
            const min = Math.min(r, g, b) / 255
            const diff = max - min
            const saturation = max === 0 ? 0 : diff / max
            const brightness = max
            
            // 计算色相
            let hue = 0
            if (diff !== 0) {
              if (max === r / 255) hue = ((g - b) / 255) / diff
              else if (max === g / 255) hue = 2 + ((b - r) / 255) / diff
              else hue = 4 + ((r - g) / 255) / diff
            }
            hue = (hue * 60 + 360) % 360
            
            return { hex, r, g, b, hue, saturation, brightness }
          })
          
          // 分类逻辑
          const primary: string[] = []
          const secondary: string[] = []
          const accent: string[] = []
          
          colorData.forEach(color => {
            // Primary: 高饱和度、中等亮度的主要颜色（如粉色、蓝色）
            if (color.saturation > 0.5 && color.brightness > 0.3 && color.brightness < 0.9) {
              primary.push(color.hex)
            }
            // Secondary: 中等饱和度的辅助颜色
            else if (color.saturation > 0.3 && color.saturation <= 0.7) {
              secondary.push(color.hex)
            }
            // Accent: 高饱和度高亮度的强调色，或低饱和度的中性色
            else {
              accent.push(color.hex)
            }
          })
          
          // 确保每个类别至少有一个颜色
          if (primary.length === 0 && colorData.length > 0) primary.push(colorData[0].hex)
          if (secondary.length === 0 && colorData.length > 1) secondary.push(colorData[1].hex)
          if (accent.length === 0 && colorData.length > 2) accent.push(colorData[2].hex)
          
          return { primary, secondary, accent }
        }
        
        const { primary, secondary, accent } = categorizeColors(extractedColors)
        
        setPrimaryColors(primary.slice(0, 4)) // 最多4个主色
        setSecondaryColors(secondary.slice(0, 3)) // 最多3个辅助色
        setAccentColors(accent.slice(0, 3)) // 最多3个强调色
        
        console.log('🎨 Color categorization:', { primary, secondary, accent })
      }
      
      console.log('✅ Colored image upload and processing complete')
      
    } catch (error) {
      console.error('❌ Upload failed:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setExtractingColors(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedOriginal || !coloredImageUrl || !title) {
      alert('Please fill in all required fields')
      return
    }

    await onUpload({
      originalImage: selectedOriginal,
      coloredImage: coloredImageUrl,
      title,
      colorScheme: {
        primary: primaryColors,
        secondary: secondaryColors,
        accent: accentColors
      }
    })
  }

  const addColor = (colorType: 'primary' | 'secondary' | 'accent') => {
    const defaultColors = {
      primary: "#FF69B4",
      secondary: "#00BCD4", 
      accent: "#FF4136"
    }
    
    if (colorType === 'primary') {
      setPrimaryColors([...primaryColors, defaultColors.primary])
    } else if (colorType === 'secondary') {
      setSecondaryColors([...secondaryColors, defaultColors.secondary])
    } else {
      setAccentColors([...accentColors, defaultColors.accent])
    }
  }

  const removeColor = (colorType: 'primary' | 'secondary' | 'accent', index: number) => {
    if (colorType === 'primary') {
      setPrimaryColors(primaryColors.filter((_, i) => i !== index))
    } else if (colorType === 'secondary') {
      setSecondaryColors(secondaryColors.filter((_, i) => i !== index))
    } else {
      setAccentColors(accentColors.filter((_, i) => i !== index))
    }
  }

  const updateColor = (colorType: 'primary' | 'secondary' | 'accent', index: number, newColor: string) => {
    if (colorType === 'primary') {
      const updated = [...primaryColors]
      updated[index] = newColor
      setPrimaryColors(updated)
    } else if (colorType === 'secondary') {
      const updated = [...secondaryColors]
      updated[index] = newColor
      setSecondaryColors(updated)
    } else {
      const updated = [...accentColors]
      updated[index] = newColor
      setAccentColors(updated)
    }
  }

  const renderColorGroup = (
    title: string, 
    colors: string[], 
    colorType: 'primary' | 'secondary' | 'accent'
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-gray-700">{title} Colors</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addColor(colorType)}
          className="hover:bg-pink-100 hover:border-pink-300 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => updateColor(colorType, index, e.target.value)}
              className="w-8 h-8 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform shadow-sm"
            />
            <Input
              value={color}
              onChange={(e) => updateColor(colorType, index, e.target.value)}
              className="text-xs border-gray-200 hover:border-pink-300 transition-colors"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => removeColor(colorType, index)}
              disabled={colors.length <= 1}
              className="hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {editingReference?.colored ? 'Edit Color Reference' : 'Upload Color Reference'}
          </DialogTitle>
          {isPresetOriginal && (
            <p className="text-sm text-muted-foreground bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
              Adding color reference for <strong>「{editingReference?.originalImageTitle}」</strong>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* 原始线稿选择或显示 */}
          <div className="space-y-2">
            <Label htmlFor="original-image" className="text-sm font-semibold text-gray-700">
              {isPresetOriginal ? 'Selected Original Image' : 'Choose Original Line Art'} *
            </Label>
            
            {isPresetOriginal ? (
              /* 预设原图模式：直接显示选中的原图 */
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {selectedOriginal && (
                      <img 
                        src={selectedOriginal} 
                        alt="Selected original"
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          console.error('Failed to load image:', selectedOriginal)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <Badge variant="default" className="mb-2 bg-green-100 text-green-800 border-green-200">✓ Auto-Selected Original</Badge>
                      <h4 className="font-semibold text-gray-800">
                        {editingReference?.originalImageTitle || libraryImages.find(img => img.imageUrl === selectedOriginal)?.title || 'Selected Image'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Upload a colored reference for this line art image
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* 编辑模式：允许重新选择 */
              <>
                <Select value={selectedOriginal} onValueChange={setSelectedOriginal}>
                  <SelectTrigger className="border-2 hover:border-pink-300 transition-colors">
                    <SelectValue placeholder="Select a line art image to pair with" />
                  </SelectTrigger>
                  <SelectContent>
                    {libraryImages.map((image) => (
                      <SelectItem key={image.id} value={image.imageUrl}>
                        {image.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedOriginal && (
                  <Card className="mt-2">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {selectedOriginal && (
                          <img 
                            src={selectedOriginal} 
                            alt="Selected original"
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              console.error('Failed to load image:', selectedOriginal)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">✓ Selected Original</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {libraryImages.find(img => img.imageUrl === selectedOriginal)?.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* 彩色参考图上传 */}
          <div className="space-y-2">
            <Label htmlFor="colored-image" className="text-sm font-semibold text-gray-700">Upload Colored Reference Image *</Label>
            <div className="border-2 border-dashed border-pink-200 rounded-xl p-6 bg-gradient-to-br from-pink-50 to-purple-50 hover:border-pink-300 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-10 w-10 text-pink-400" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">Upload Colored Reference Image</p>
                  <p className="text-xs text-gray-500">Supports PNG, JPG, SVG formats</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleColoredImageUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </div>
              
              {coloredImageUrl && (
                <div className="mt-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={coloredImageUrl} 
                          alt="Colored reference"
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">🎨 Colored Reference</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{coloredImageUrl}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Reference Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Hello Kitty Princess Style"
              className="border-2 hover:border-pink-300 focus:border-pink-400 transition-colors"
            />
          </div>

          {/* 色彩方案配置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                🎨 Color Scheme Configuration
              </Label>
              {extractingColors && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  Auto-detecting colors...
                </div>
              )}
            </div>
            
            {renderColorGroup("Primary", primaryColors, "primary")}
            {renderColorGroup("Secondary", secondaryColors, "secondary")}
            {renderColorGroup("Accent", accentColors, "accent")}
          </div>

          {/* 预览区域 */}
          {selectedOriginal && coloredImageUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                🔍 Preview
              </Label>
              <Card>
                <CardContent className="p-4 bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {selectedOriginal && (
                        <img 
                          src={selectedOriginal} 
                          alt="Original preview"
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            console.error('Failed to load preview image:', selectedOriginal)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <p className="text-center text-xs mt-1 text-gray-600 font-medium">Original Line Art</p>
                      {!selectedOriginal && (
                        <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image selected</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <img 
                        src={coloredImageUrl} 
                        alt="Colored preview"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <p className="text-center text-xs mt-1 text-gray-600 font-medium">Colored Reference</p>
                    </div>
                  </div>
                  
                  {/* 色彩方案预览 */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Primary:</span>
                      {primaryColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Secondary:</span>
                      {secondaryColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Accent:</span>
                      {accentColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="hover:bg-gray-100 transition-colors">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedOriginal || !coloredImageUrl || !title || uploading || extractingColors}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {uploading || extractingColors ? '⏳ Processing...' : (editingReference?.colored ? '✅ Update' : '🎨 Create')}
          </Button>
          
          {/* Debug information - only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <div>selectedOriginal: {selectedOriginal ? '✅ OK' : '❌ Empty'} ({selectedOriginal ? selectedOriginal.slice(0, 30) + '...' : 'null'})</div>
              <div>coloredImageUrl: {coloredImageUrl ? '✅ OK' : '❌ Empty'} ({coloredImageUrl ? coloredImageUrl.slice(0, 30) + '...' : 'null'})</div>
              <div>title: {title ? '✅ OK' : '❌ Empty'} ({title})</div>
              <div>uploading: {uploading ? '❌ True' : '✅ False'} ({uploading.toString()})</div>
              <div>extractingColors: {extractingColors ? '❌ True' : '✅ False'} ({extractingColors.toString()})</div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}