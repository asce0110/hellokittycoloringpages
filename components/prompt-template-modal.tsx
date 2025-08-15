"use client"

import { useState, useEffect } from "react"
import { PromptTemplate, CreatePromptTemplateRequest } from "@/lib/types"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface PromptTemplateModalProps {
  template: PromptTemplate | null
  isOpen: boolean
  onClose: () => void
  onSave: (template: CreatePromptTemplateRequest) => Promise<void>
  isCreate?: boolean
}

export function PromptTemplateModal({ template, isOpen, onClose, onSave, isCreate = false }: PromptTemplateModalProps) {
  const [formData, setFormData] = useState<Partial<PromptTemplate>>({
    name: '',
    description: '',
    template: '',
    style: 'classic',
    complexity: 'medium',
    category: 'character',
    isActive: true,
    isDefault: false,
    variables: [],
    exampleOutput: '',
    sortOrder: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [newVariable, setNewVariable] = useState('')

  // Reset form when modal opens/closes or template changes
  useEffect(() => {
    if (isOpen) {
      if (template && !isCreate) {
        setFormData(template)
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          description: '',
          template: '',
          style: 'classic',
          complexity: 'medium',
          category: 'character',
          isActive: true,
          isDefault: false,
          variables: [],
          exampleOutput: '',
          sortOrder: 1
        })
      }
    }
  }, [isOpen, template, isCreate])

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.template) {
      alert('请填写必填字段：名称、描述和模板内容')
      return
    }
    
    setIsLoading(true)
    try {
      await onSave({
        name: formData.name!,
        description: formData.description!,
        template: formData.template!,
        style: formData.style || 'classic',
        complexity: formData.complexity as "simple" | "medium" | "complex" || 'medium',
        category: formData.category || 'character',
        isActive: formData.isActive ?? true,
        isDefault: formData.isDefault ?? false,
        variables: formData.variables || [],
        exampleOutput: formData.exampleOutput || '',
        sortOrder: formData.sortOrder || 1
      })
      onClose()
    } catch (error) {
      console.error('Save template failed:', error)
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables?.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...(prev.variables || []), newVariable.trim()]
      }))
      setNewVariable('')
    }
  }

  const removeVariable = (variableToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables?.filter(v => v !== variableToRemove) || []
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? 'Create New Template' : 'Edit Template'}
          </DialogTitle>
          <DialogDescription>
            {isCreate 
              ? 'Create a new AI prompt template for generating coloring pages'
              : 'Edit the AI prompt template details'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Classic Hello Kitty Character"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category || 'character'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="character">Character</SelectItem>
                  <SelectItem value="scene">Scene</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this template is used for..."
              className="h-20"
            />
          </div>

          {/* Style and Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Art Style</Label>
              <Select 
                value={formData.style || 'classic'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic Line Art</SelectItem>
                  <SelectItem value="cute">Cute Cartoon</SelectItem>
                  <SelectItem value="simple">Minimalist</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complexity">Complexity</Label>
              <Select 
                value={formData.complexity || 'medium'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, complexity: value as "simple" | "medium" | "complex" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple (Kids 3-5)</SelectItem>
                  <SelectItem value="medium">Medium (Kids 6-10)</SelectItem>
                  <SelectItem value="complex">Complex (Adults)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Content */}
          <div className="space-y-2">
            <Label htmlFor="template">Template Content *</Label>
            <Textarea
              id="template"
              value={formData.template || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
              placeholder="Create a {complexity} coloring page featuring {userInput}..."
              className="h-32 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use variables like {`{userInput}`}, {`{style}`}, {`{complexity}`} in your template
            </p>
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <Label>Template Variables</Label>
            <div className="flex gap-2">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="Add variable (e.g., {character})"
                onKeyPress={(e) => e.key === 'Enter' && addVariable()}
              />
              <Button type="button" variant="outline" onClick={addVariable}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.variables && formData.variables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {variable}
                    <button
                      onClick={() => removeVariable(variable)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Example Output */}
          <div className="space-y-2">
            <Label htmlFor="exampleOutput">Example Output</Label>
            <Textarea
              id="exampleOutput"
              value={formData.exampleOutput || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, exampleOutput: e.target.value }))}
              placeholder="Describe what this template typically generates..."
              className="h-20"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isDefault"
                checked={formData.isDefault ?? false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
              />
              <Label htmlFor="isDefault">Default Template</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : (isCreate ? 'Create Template' : 'Save Changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}