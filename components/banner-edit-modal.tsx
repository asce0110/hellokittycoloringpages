"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BannerImage } from "@/lib/types"

interface BannerEditModalProps {
  banner: BannerImage
  isOpen: boolean
  onClose: () => void
  onSave: (banner: BannerImage) => Promise<void>
}

export function BannerEditModal({ banner, isOpen, onClose, onSave }: BannerEditModalProps) {
  const [formData, setFormData] = useState<BannerImage>(banner)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData(banner)
  }, [banner])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save banner:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof BannerImage, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑Banner图片</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 图片预览 */}
          <div className="flex items-center gap-4">
            <img
              src={formData.imageUrl}
              alt={formData.title}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <div>
              <p className="text-sm text-muted-foreground">当前图片</p>
              <p className="text-sm font-mono text-xs">{formData.imageUrl}</p>
            </div>
          </div>

          {/* 基础信息 */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Banner标题"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Banner描述（可选）"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">链接URL</Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl || ''}
                onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                placeholder="点击跳转链接（可选）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">显示位置</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => handleInputChange('position', parseInt(e.target.value) || 0)}
                placeholder="数字越小越靠前"
              />
            </div>
          </div>

          {/* 显示位置设置 */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">显示位置</Label>
              
              {/* Hero区域选择 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Hero区域（首页滚动背景）</Label>
                    <p className="text-sm text-muted-foreground">
                      显示在首页顶部滚动背景中
                    </p>
                  </div>
                  <Switch
                    checked={formData.showOnHero}
                    onCheckedChange={(checked) => {
                      handleInputChange('showOnHero', checked)
                      if (!checked) {
                        handleInputChange('heroRow', null)
                      } else {
                        handleInputChange('heroRow', 'top')
                      }
                    }}
                  />
                </div>

                {formData.showOnHero && (
                  <div className="ml-4 space-y-2">
                    <Label>滚动位置</Label>
                    <Select
                      value={formData.heroRow || 'top'}
                      onValueChange={(value) => handleInputChange('heroRow', value || null)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="选择滚动位置" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">上排（向左滚动）</SelectItem>
                        <SelectItem value="bottom">下排（向右滚动）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* 普通Banner选择 */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>首页Banner轮播</Label>
                  <p className="text-sm text-muted-foreground">
                    显示在首页轮播图中
                  </p>
                </div>
                <Switch
                  checked={formData.showOnHomepage}
                  onCheckedChange={(checked) => handleInputChange('showOnHomepage', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>图库Banner轮播</Label>
                  <p className="text-sm text-muted-foreground">
                    显示在图库页面轮播图中
                  </p>
                </div>
                <Switch
                  checked={formData.showOnLibrary}
                  onCheckedChange={(checked) => handleInputChange('showOnLibrary', checked)}
                />
              </div>
            </div>

            {/* 启用状态 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <Label>启用状态</Label>
                <p className="text-sm text-muted-foreground">
                  是否激活此Banner
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存更改'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}