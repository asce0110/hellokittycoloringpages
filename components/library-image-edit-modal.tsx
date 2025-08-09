import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Image as ImageIcon } from "lucide-react"
import { LibraryImage } from "@/lib/types"

interface LibraryImageEditModalProps {
  image: LibraryImage | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedImage: LibraryImage) => void
}

export function LibraryImageEditModal({ image, isOpen, onClose, onSave }: LibraryImageEditModalProps) {
  const [formData, setFormData] = useState<Partial<LibraryImage>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // 当image改变时，更新表单数据
  useEffect(() => {
    if (image) {
      setFormData({
        title: image.title,
        description: image.description,
        category: image.category,
        difficulty: image.difficulty,
        tags: image.tags,
        isActive: image.isActive,
        isFeatured: image.isFeatured,
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl
      })
    } else {
      setFormData({})
    }
    setImageFile(null)
  }, [image])

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      // 这里应该调用实际的上传API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'library')
      
      // 模拟上传
      const uploadedUrl = `/library/${file.name}`
      setFormData(prev => ({
        ...prev,
        imageUrl: uploadedUrl,
        thumbnailUrl: uploadedUrl // 在真实应用中可能需要生成缩略图
      }))
      setImageFile(file)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('图片上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!image || !formData.title || !formData.imageUrl) {
      alert('请填写所有必填字段')
      return
    }

    const updatedImage: LibraryImage = {
      ...image,
      ...formData,
      title: formData.title!,
      description: formData.description || '',
      category: formData.category || 'other',
      difficulty: formData.difficulty || 'easy',
      tags: formData.tags || [],
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      isFeatured: formData.isFeatured !== undefined ? formData.isFeatured : false,
      imageUrl: formData.imageUrl!,
      thumbnailUrl: formData.thumbnailUrl || formData.imageUrl!,
      updatedAt: new Date()
    }

    await onSave(updatedImage)
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }

  if (!image) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑图库图片</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 当前图片预览 */}
          <div className="space-y-2">
            <Label>当前图片</Label>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={formData.imageUrl || image.imageUrl}
                    alt={formData.title || image.title}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{formData.title || image.title}</h4>
                    <p className="text-sm text-muted-foreground">{formData.category || image.category}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={formData.isActive ? "default" : "secondary"}>
                        {formData.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {formData.isFeatured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <Label>更换图片（可选）</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="flex flex-col items-center gap-3">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm">上传新的图片文件</p>
                  <p className="text-xs text-muted-foreground">支持 PNG, JPG, SVG 格式</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  disabled={uploading}
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">图片标题 *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入图片标题"
              />
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Select 
                value={formData.category || 'other'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hello-kitty">Hello Kitty</SelectItem>
                  <SelectItem value="animals">动物</SelectItem>
                  <SelectItem value="nature">自然</SelectItem>
                  <SelectItem value="fantasy">幻想</SelectItem>
                  <SelectItem value="seasonal">季节</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入图片描述"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 难度 */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">难度等级</Label>
              <Select 
                value={formData.difficulty || 'easy'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'complex' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="complex">复杂</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="用逗号分隔多个标签"
              />
            </div>
          </div>

          {/* 状态开关 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">启用状态</Label>
                <p className="text-sm text-muted-foreground">
                  关闭后用户将无法看到此图片
                </p>
              </div>
              <Switch
                id="is-active"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-featured">推荐图片</Label>
                <p className="text-sm text-muted-foreground">
                  推荐图片会在首页显示
                </p>
              </div>
              <Switch
                id="is-featured"
                checked={formData.isFeatured !== undefined ? formData.isFeatured : false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title || !formData.imageUrl || uploading}
          >
            {uploading ? '上传中...' : '保存更改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}