"use client"

import { useState } from "react"
import { PricingPlan } from "@/lib/types"
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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface PricingEditModalProps {
  plan: PricingPlan | null
  isOpen: boolean
  onClose: () => void
  onSave: (plan: PricingPlan) => Promise<void>
}

export function PricingEditModal({ plan, isOpen, onClose, onSave }: PricingEditModalProps) {
  const [formData, setFormData] = useState<Partial<PricingPlan>>(plan || {})
  const [isLoading, setIsLoading] = useState(false)
  const [newFeature, setNewFeature] = useState('')

  const handleSave = async () => {
    if (!plan || !formData.name || !formData.description) return
    
    setIsLoading(true)
    try {
      await onSave({
        ...plan,
        ...formData,
        name: formData.name,
        description: formData.description,
        priceMonthly: formData.priceMonthly || 0,
        priceYearly: formData.priceYearly || 0,
        features: formData.features || [],
        generationsPerDay: formData.generationsPerDay || 0,
        highResolution: formData.highResolution ?? false,
        noWatermark: formData.noWatermark ?? false,
        priorityGeneration: formData.priorityGeneration ?? false,
        isActive: formData.isActive ?? true,
        updatedAt: new Date()
      })
      onClose()
    } catch (error) {
      console.error('Failed to save pricing plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }))
  }

  if (!plan) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑价格计划</DialogTitle>
          <DialogDescription>
            修改价格计划的详细信息和功能
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              计划名称
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              描述
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="col-span-3"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priceMonthly" className="text-right col-span-2">
                月价格 ($)
              </Label>
              <Input
                id="priceMonthly"
                type="number"
                step="0.01"
                value={formData.priceMonthly || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: parseFloat(e.target.value) || 0 }))}
                className="col-span-2"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priceYearly" className="text-right col-span-2">
                年价格 ($)
              </Label>
              <Input
                id="priceYearly"
                type="number"
                step="0.01"
                value={formData.priceYearly || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, priceYearly: parseFloat(e.target.value) || 0 }))}
                className="col-span-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="generations" className="text-right">
              每日生成数
            </Label>
            <Input
              id="generations"
              type="number"
              value={formData.generationsPerDay || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, generationsPerDay: parseInt(e.target.value) || 0 }))}
              className="col-span-3"
            />
          </div>
          
          <div className="grid gap-4">
            <Label>功能开关</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="highRes">高分辨率</Label>
              <Switch
                id="highRes"
                checked={formData.highResolution ?? false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, highResolution: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="noWatermark">无水印</Label>
              <Switch
                id="noWatermark"
                checked={formData.noWatermark ?? false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, noWatermark: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="priority">优先处理</Label>
              <Switch
                id="priority"
                checked={formData.priorityGeneration ?? false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, priorityGeneration: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">激活状态</Label>
              <Switch
                id="active"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          
          <div className="grid gap-4">
            <Label>功能列表</Label>
            <div className="flex gap-2">
              <Input
                placeholder="添加新功能"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              />
              <Button onClick={addFeature} size="sm">添加</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features?.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}