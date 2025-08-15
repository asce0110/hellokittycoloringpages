"use client"

import { useState } from "react"
import { LibraryImage, BannerImage } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (imageData: Partial<LibraryImage | BannerImage>) => Promise<void>
  type: 'library' | 'banner' | 'hero' | 'reference'
  selectedImage?: LibraryImage | null
}

export function ImageUploadModal({ isOpen, onClose, onUpload, type, selectedImage }: ImageUploadModalProps) {
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    category: type === 'library' ? 'Characters' : '',
    difficulty: type === 'library' ? 'medium' : undefined,
    tags: type === 'library' ? [] : undefined,
    isActive: true,
    isFeatured: type === 'library' ? false : undefined,
    // Banner/Hero specific fields
    showOnHomepage: type === 'banner' ? true : false,
    showOnLibrary: type === 'banner' ? false : false, 
    showOnHero: type === 'hero' ? true : false,
    heroRow: type === 'hero' ? 'top' : null,
    position: 1,
    // Reference specific fields
    originalImageUrl: type === 'reference' ? '' : undefined,
    colorScheme: type === 'reference' ? {
      primary: ['#FF69B4', '#FFFFFF'],
      secondary: ['#00BCD4', '#FFDC00'],
      accent: ['#FF4136', '#2ECC40']
    } : undefined
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData((prev: any) => ({ ...prev, tags }))
  }

  const handleUpload = async () => {
    if (!formData.title || !formData.description || !selectedFile) {
      alert('请填写所有必填字段并选择文件')
      return
    }

    setIsLoading(true)
    try {
      // 上传文件到Cloudflare R2
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('type', type)
      uploadFormData.append('folder', type === 'library' ? 'library' : type === 'hero' ? 'hero' : type === 'reference' ? 'references' : 'banners')
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      const uploadResult = await uploadResponse.json()
      
      let imageUrl: string
      let thumbnailUrl: string
      
      if (uploadResult.success) {
        // 使用真实上传的URL
        imageUrl = uploadResult.url
        thumbnailUrl = type === 'library' ? (uploadResult.thumbnailUrl || uploadResult.url) : imageUrl
        
        // 输出压缩统计
        if (uploadResult.compressionRatio > 0) {
          console.log(`🎨 Image compressed: ${uploadResult.compressionRatio.toFixed(1)}% size reduction`)
          console.log(`📊 ${(uploadResult.originalSize/1024/1024).toFixed(2)}MB → ${(uploadResult.compressedSize/1024/1024).toFixed(2)}MB`)
        }
      } else if (uploadResult.fallback) {
        // R2未配置，使用模拟路径
        console.warn('R2 not configured, using fallback paths')
        const basePath = type === 'library' ? '/library' : type === 'reference' ? '/references' : '/banners'
        imageUrl = `${basePath}/${selectedFile.name}`
        thumbnailUrl = type === 'library' ? `${basePath}/thumbs/${selectedFile.name}` : imageUrl
      } else {
        throw new Error(uploadResult.error || '上传失败')
      }
      
      const uploadData = {
        ...formData,
        imageUrl,
        ...(type === 'library' && { thumbnailUrl, fileSize: selectedFile.size }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await onUpload(uploadData)
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        category: type === 'library' ? 'Characters' : '',
        difficulty: type === 'library' ? 'medium' : undefined,
        tags: type === 'library' ? [] : undefined,
        isActive: true,
        isFeatured: type === 'library' ? false : undefined,
        showOnHomepage: type === 'banner' ? true : false,
        showOnLibrary: type === 'banner' ? false : false,
        showOnHero: type === 'hero' ? true : false,
        heroRow: type === 'hero' ? 'top' : null,
        position: 1,
        originalImageUrl: type === 'reference' ? '' : undefined,
        colorScheme: type === 'reference' ? {
          primary: ['#FF69B4', '#FFFFFF'],
          secondary: ['#00BCD4', '#FFDC00'],
          accent: ['#FF4136', '#2ECC40']
        } : undefined
      })
      setSelectedFile(null)
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上传失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'library' ? '上传图片库图片' : 
             type === 'banner' ? '上传轮播图' : 
             type === 'hero' ? '上传Hero背景图片' : 
             selectedImage ? `为"${selectedImage.title}"上传彩色参考图` : '上传彩色参考图片'}
          </DialogTitle>
          <DialogDescription>
            {type === 'library' ? '添加新的着色页图片到图片库' : 
             type === 'banner' ? '添加新的轮播图到首页展示' :
             type === 'hero' ? '添加新的背景图片到首页Hero区域展示' :
             selectedImage ? `为线稿图片"${selectedImage.title}"上传对应的彩色参考图，帮助用户更好地进行着色` :
             '上传彩色参考图片，用于辅助用户着色'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">选择文件 *</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                已选择: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              placeholder="输入图片标题"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">描述 *</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
              placeholder="输入图片描述"
              rows={3}
            />
          </div>
          
          {type === 'library' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="category">分类</Label>
                <Select
                  value={formData.category || 'Characters'}
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Characters">角色</SelectItem>
                    <SelectItem value="Scenes">场景</SelectItem>
                    <SelectItem value="Adventure">冒险</SelectItem>
                    <SelectItem value="Nature">自然</SelectItem>
                    <SelectItem value="Celebration">庆祝</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="difficulty">难度</Label>
                <Select
                  value={formData.difficulty || 'medium'}
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'complex' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">简单</SelectItem>
                    <SelectItem value="medium">中等</SelectItem>
                    <SelectItem value="complex">复杂</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(', ') || ''}
                  onChange={handleTagsChange}
                  placeholder="输入标签，用逗号分隔"
                />
              </div>
            </>
          )}
          
          {type === 'reference' && !selectedImage && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="originalImageUrl">对应的线稿图片URL</Label>
                <Input
                  id="originalImageUrl"
                  value={formData.originalImageUrl || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, originalImageUrl: e.target.value }))}
                  placeholder="输入对应的黑白线稿图片URL"
                />
              </div>
            </>
          )}

          {type === 'reference' && selectedImage && (
            <>
              <div className="grid gap-2 p-3 bg-muted/50 rounded-md">
                <Label className="text-sm font-medium">目标线稿图片</Label>
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.title}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div>
                    <p className="font-medium text-sm">{selectedImage.title}</p>
                    <p className="text-xs text-muted-foreground">将为此图片创建彩色参考图</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'reference' && (
            <>
              
              <div className="grid gap-2">
                <Label htmlFor="primaryColors">主要颜色</Label>
                <Input
                  id="primaryColors"
                  value={formData.colorScheme?.primary?.join(', ') || ''}
                  onChange={(e) => {
                    const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                    setFormData((prev: any) => ({ 
                      ...prev, 
                      colorScheme: { 
                        ...prev.colorScheme,
                        primary: colors
                      }
                    }))
                  }}
                  placeholder="输入主要颜色，用逗号分隔 (如: #FF69B4, #FFFFFF)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="secondaryColors">辅助颜色</Label>
                <Input
                  id="secondaryColors"
                  value={formData.colorScheme?.secondary?.join(', ') || ''}
                  onChange={(e) => {
                    const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                    setFormData((prev: any) => ({ 
                      ...prev, 
                      colorScheme: { 
                        ...prev.colorScheme,
                        secondary: colors
                      }
                    }))
                  }}
                  placeholder="输入辅助颜色，用逗号分隔 (如: #00BCD4, #FFDC00)"
                />
              </div>
            </>
          )}
          
          {(type === 'banner' || type === 'hero') && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="linkUrl">链接地址 (可选)</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="输入点击跳转地址"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="position">显示顺序</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position || 1}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                  placeholder="数字越小越靠前"
                  min="1"
                />
              </div>

              {/* Banner显示位置选择 */}
              <div className="space-y-3">
                <Label>显示位置</Label>
                
                {/* Hero区域选择 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showOnHero"
                    checked={formData.showOnHero || false}
                    onChange={(e) => {
                      setFormData((prev: any) => ({ 
                        ...prev, 
                        showOnHero: e.target.checked,
                        heroRow: e.target.checked ? (prev.heroRow || 'top') : null
                      }))
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="showOnHero" className="text-sm font-normal">
                    显示在Hero区域（首页滚动背景）
                  </Label>
                </div>
                
                {formData.showOnHero && (
                  <div className="ml-6">
                    <Select
                      value={formData.heroRow || 'top'}
                      onValueChange={(value) => setFormData((prev: any) => ({ ...prev, heroRow: value as 'top' | 'bottom' }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">上排（向左滚动）</SelectItem>
                        <SelectItem value="bottom">下排（向右滚动）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 普通Banner选择 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showOnHomepage"
                    checked={formData.showOnHomepage || false}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, showOnHomepage: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="showOnHomepage" className="text-sm font-normal">
                    显示在首页Banner轮播
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showOnLibrary"
                    checked={formData.showOnLibrary || false}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, showOnLibrary: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="showOnLibrary" className="text-sm font-normal">
                    显示在图库Banner轮播
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={isLoading}>
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? '上传中...' : '上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}