"use client"

import { useState } from "react"
import { User } from "@/lib/types"
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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserEditModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => Promise<void>
}

export function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>(user || {})
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!user || !formData.name || !formData.email) return
    
    setIsLoading(true)
    try {
      await onSave({
        ...user,
        ...formData,
        name: formData.name,
        email: formData.email,
        role: formData.role || user.role,
        isProUser: formData.isProUser ?? user.isProUser,
        updatedAt: new Date()
      })
      onClose()
    } catch (error) {
      console.error('Failed to save user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
          <DialogDescription>
            修改用户信息和权限设置
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              姓名
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              角色
            </Label>
            <Select
              value={formData.role || user.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'admin' | 'user' }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">普通用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pro" className="text-right">
              Pro用户
            </Label>
            <div className="col-span-3">
              <Switch
                id="pro"
                checked={formData.isProUser ?? user.isProUser}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isProUser: checked }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="generations" className="text-right">
              今日生成
            </Label>
            <Input
              id="generations"
              type="number"
              value={formData.generationsToday ?? user.generationsToday ?? 0}
              onChange={(e) => setFormData(prev => ({ ...prev, generationsToday: parseInt(e.target.value) || 0 }))}
              className="col-span-3"
            />
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