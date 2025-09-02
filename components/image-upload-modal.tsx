"use client"

import { useState, useCallback } from "react"
import { LibraryImage, BannerImage } from "@/lib/types"
import imageCompression from 'browser-image-compression'
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
    category: type === 'library' ? 'animals' : '',
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
  const [compressionProgress, setCompressionProgress] = useState<{
    stage: 'idle' | 'analyzing' | 'compressing' | 'uploading' | 'done'
    progress: number
    message: string
    originalSize?: number
    compressedSize?: number
    compressionRatio?: number
  }>({ stage: 'idle', progress: 0, message: '' })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // 重置压缩进度
      setCompressionProgress({ stage: 'idle', progress: 0, message: '' })
    }
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setFormData((prev: any) => ({ ...prev, tags }))
  }

  // 智能客户端压缩函数
  const compressImageSmart = useCallback(async (file: File) => {
    const originalSize = file.size
    
    setCompressionProgress({
      stage: 'analyzing',
      progress: 10,
      message: `分析图片 (${(originalSize / 1024 / 1024).toFixed(1)}MB)...`,
      originalSize
    })

    // 智能压缩配置 - 复用验证过的参数
    const compressionOptions = {
      maxWidthOrHeight: originalSize > 5 * 1024 * 1024 ? 1920 : 2400,
      useWebWorker: true,
      initialQuality: originalSize > 10 * 1024 * 1024 ? 0.7 : 0.8,
      fileType: 'image/webp',
      maxSizeMB: Math.min(2, originalSize / (1024 * 1024) * 0.3),
      onProgress: (progress: number) => {
        setCompressionProgress(prev => ({
          ...prev,
          stage: 'compressing',
          progress: 10 + Math.round(progress * 0.6), // 10-70%
          message: `客户端压缩中... ${Math.round(progress)}%`
        }))
      }
    }

    try {
      console.log('🎯 开始智能压缩:', file.name)
      const compressedFile = await imageCompression(file, compressionOptions)
      const compressionRatio = ((originalSize - compressedFile.size) / originalSize) * 100
      
      setCompressionProgress({
        stage: 'uploading',
        progress: 80,
        message: `压缩完成 (${compressionRatio.toFixed(1)}% 减少)，准备上传...`,
        originalSize,
        compressedSize: compressedFile.size,
        compressionRatio
      })
      
      console.log(`✅ 客户端压缩完成: ${(originalSize/1024).toFixed(1)}KB → ${(compressedFile.size/1024).toFixed(1)}KB (${compressionRatio.toFixed(1)}% 减少)`)
      
      return compressedFile
    } catch (error) {
      console.error('客户端压缩失败:', error)
      // 压缩失败时使用原文件
      setCompressionProgress({
        stage: 'uploading',
        progress: 80,
        message: '压缩失败，使用原图上传...',
        originalSize
      })
      return file
    }
  }, [])

  const handleUpload = async () => {
    // Banner和Hero图片只需要选择文件，标题和描述可选
    if (type === 'banner' || type === 'hero') {
      if (!selectedFile) {
        alert('请选择要上传的文件')
        return
      }
    } else {
      // Library和Reference类型需要标题和描述
      if (!formData.title || !formData.description || !selectedFile) {
        alert('请填写所有必填字段并选择文件')
        return
      }
    }

    setIsLoading(true)
    try {
      // 第一步：客户端智能压缩
      const fileToUpload = await compressImageSmart(selectedFile)
      
      setCompressionProgress(prev => ({
        ...prev,
        stage: 'uploading',
        progress: 85,
        message: '上传到服务器进行二次优化...'
      }))
      
      // 第二步：上传到服务器进行二次优化
      const uploadFormData = new FormData()
      uploadFormData.append('file', fileToUpload)
      uploadFormData.append('type', 'smart-compressed') // 标识已客户端压缩
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
        
        // 计算总压缩效果
        const finalCompressionRatio = compressionProgress.originalSize && uploadResult.compressedSize ? 
          ((compressionProgress.originalSize - uploadResult.compressedSize) / compressionProgress.originalSize) * 100 : 0
        
        setCompressionProgress({
          stage: 'done',
          progress: 100,
          message: `🎉 上传完成！总压缩率: ${finalCompressionRatio.toFixed(1)}%`,
          originalSize: compressionProgress.originalSize,
          compressedSize: uploadResult.compressedSize,
          compressionRatio: finalCompressionRatio
        })
        
        // 输出详细压缩统计
        if (compressionProgress.originalSize) {
          const clientRatio = compressionProgress.compressionRatio || 0
          const serverRatio = uploadResult.compressionRatio || 0
          console.log(`🎨 智能双层压缩完成:`)
          console.log(`📊 原始: ${(compressionProgress.originalSize/1024).toFixed(1)}KB`)
          console.log(`📱 客户端: ${clientRatio.toFixed(1)}% 减少`)
          console.log(`⚙️ 服务器: ${serverRatio.toFixed(1)}% 额外减少`)
          console.log(`🏆 总计: ${finalCompressionRatio.toFixed(1)}% 减少`)
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
      
      // 为Banner和Hero图片自动生成标题和描述（如果为空）
      let finalFormData = { ...formData }
      if (type === 'banner' || type === 'hero') {
        if (!finalFormData.title) {
          finalFormData.title = type === 'hero' 
            ? `Hero图片 ${new Date().toLocaleDateString()}`
            : `Banner图片 ${new Date().toLocaleDateString()}`
        }
        if (!finalFormData.description) {
          finalFormData.description = type === 'hero'
            ? `首页Hero区域背景图片 - ${finalFormData.heroRow === 'top' ? '上排' : '下排'}滚动`
            : '首页Banner轮播图片'
        }
      }
      
      const uploadData = {
        ...finalFormData,
        imageUrl,
        printUrl: uploadResult.printUrl, // 保存高分辨率打印版本
        ...(type === 'library' && { thumbnailUrl, fileSize: selectedFile.size }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await onUpload(uploadData)
      
      // 延迟重置，让用户看到最终结果
      setTimeout(() => {
        // 重置表单
        setFormData({
          title: '',
          description: '',
          category: type === 'library' ? 'animals' : '',
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
        setCompressionProgress({ stage: 'idle', progress: 0, message: '' })
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Upload failed:', error)
      setCompressionProgress({
        stage: 'idle',
        progress: 0,
        message: `❌ 上传失败: ${error instanceof Error ? error.message : '请重试'}`
      })
      alert('上传失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  已选择: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                </p>
                
                {/* 智能压缩进度显示 */}
                {compressionProgress.stage !== 'idle' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        🚀 智能双层压缩
                      </span>
                      <span className="text-sm text-blue-700">
                        {compressionProgress.progress}%
                      </span>
                    </div>
                    
                    {/* 进度条 */}
                    <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${compressionProgress.progress}%` }}
                      />
                    </div>
                    
                    {/* 状态消息 */}
                    <p className="text-sm text-blue-800 mb-1">
                      {compressionProgress.message}
                    </p>
                    
                    {/* 压缩统计 */}
                    {compressionProgress.originalSize && compressionProgress.compressedSize && (
                      <div className="grid grid-cols-3 gap-2 text-xs text-blue-700 pt-2 border-t border-blue-200">
                        <div>
                          <div className="font-medium">原始</div>
                          <div>{(compressionProgress.originalSize / 1024).toFixed(1)}KB</div>
                        </div>
                        <div>
                          <div className="font-medium">压缩后</div>
                          <div>{(compressionProgress.compressedSize / 1024).toFixed(1)}KB</div>
                        </div>
                        <div>
                          <div className="font-medium">压缩率</div>
                          <div className="text-green-600 font-semibold">
                            {compressionProgress.compressionRatio?.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 只有library和reference类型才显示标题和描述字段 */}
          {(type === 'library' || type === 'reference') && (
            <>
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
            </>
          )}
          
          {type === 'library' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="category">分类</Label>
                <Select
                  value={formData.category || 'animals'}
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animals">🐾 动物</SelectItem>
                    <SelectItem value="cute-characters">🎀 可爱角色</SelectItem>
                    <SelectItem value="scenes">🏞️ 场景</SelectItem>
                    <SelectItem value="holidays">🎄 节日</SelectItem>
                    <SelectItem value="adventure">⚡ 冒险</SelectItem>
                    <SelectItem value="nature">🌿 自然</SelectItem>
                    <SelectItem value="fantasy">🦄 幻想</SelectItem>
                    <SelectItem value="seasonal">🌸 季节</SelectItem>
                    <SelectItem value="educational">📚 教育</SelectItem>
                    <SelectItem value="other">📦 其他</SelectItem>
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
              {type !== 'hero' && (
                <div className="grid gap-2">
                  <Label htmlFor="linkUrl">链接地址 (可选)</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="输入点击跳转地址"
                  />
                </div>
              )}
              
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
                {type === 'hero' ? (
                  /* Hero图片只显示滚动位置选择 */
                  <div>
                    <Label>滚动位置</Label>
                    <div className="mt-2">
                      <Select
                        value={formData.heroRow || 'top'}
                        onValueChange={(value) => setFormData((prev: any) => ({ ...prev, heroRow: value as 'top' | 'bottom' }))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">上排（向左滚动）</SelectItem>
                          <SelectItem value="bottom">下排（向右滚动）</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        选择图片在Hero区域的滚动位置
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 普通Banner显示位置选择 */
                  <>
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
                  </>
                )}
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
            {isLoading ? (
              compressionProgress.stage === 'analyzing' ? '分析中...' :
              compressionProgress.stage === 'compressing' ? '压缩中...' :
              compressionProgress.stage === 'uploading' ? '上传中...' :
              compressionProgress.stage === 'done' ? '完成！' : '处理中...'
            ) : '智能上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}