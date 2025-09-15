"use client"

import React, { useState } from "react"
import { UserEditModal } from "@/components/user-edit-modal"
import { ImageUploadModal } from "@/components/image-upload-modal"
import { PricingEditModal } from "@/components/pricing-edit-modal"
import { PromptTemplateModal } from "@/components/prompt-template-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Images, 
  DollarSign, 
  Activity,
  Upload,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  Palette,
  RefreshCw,
  Search,
  X
} from "lucide-react"
import { DashboardStats, LibraryImage, BannerImage, User, PricingPlan, PromptTemplate } from "@/lib/types"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { 
  useAdminStats, 
  useAdminUsers, 
  useAdminLibraryImages, 
  useAdminBanners, 
  useAdminPricing,
  useAdminPromptTemplates
} from "@/hooks/use-api"
import { LibraryImageEditModal } from "@/components/library-image-edit-modal"
import { BannerEditModal } from "@/components/banner-edit-modal"
import { HeroPreviewModal } from "@/components/hero-preview-modal"
import { getColorReferenceSync, hasColorReferenceSync } from "@/lib/reference-images"
import { BannerDefaultImage } from "@/components/default-image"
import { useEffect } from "react"
import { NewsletterAdminPanel } from "@/components/newsletter-admin-panel"


export default function AdminPage() {
  const { user } = useAuth()
  const { stats, loading: statsLoading } = useAdminStats()
  const { users, loading: usersLoading, refetch: refetchUsers } = useAdminUsers(1, 10)
  const { images: libraryImages, loading: libraryLoading, refetch: refetchLibrary } = useAdminLibraryImages(1, 12)
  const { banners: bannerImages, loading: bannersLoading, refetch: refetchBanners } = useAdminBanners()
  const { plans: pricingPlans, loading: pricingLoading } = useAdminPricing()
  const { templates: promptTemplates, loading: templatesLoading, refetch: refetchTemplates } = useAdminPromptTemplates(1, 10)
  
  // 模态框状态
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
  const [showBannerUploadModal, setShowBannerUploadModal] = useState(false)
  const [showHeroUploadModal, setShowHeroUploadModal] = useState(false)
  const [showBannerEditModal, setShowBannerEditModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerImage | null>(null)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [showPricingEditModal, setShowPricingEditModal] = useState(false)
  const [showReferenceUploadModal, setShowReferenceUploadModal] = useState(false)
  const [selectedImageForReference, setSelectedImageForReference] = useState<LibraryImage | null>(null)
  const [colorReferences, setColorReferences] = useState<{[key: string]: boolean}>({})
  const [showLibraryImageEditModal, setShowLibraryImageEditModal] = useState(false)
  const [editingLibraryImage, setEditingLibraryImage] = useState<LibraryImage | null>(null)
  const [showTemplateCreateModal, setShowTemplateCreateModal] = useState(false)
  const [showTemplateEditModal, setShowTemplateEditModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  const [bannerFilter, setBannerFilter] = useState<'all' | 'hero' | 'banner'>('all')
  const [bannerSearchQuery, setBannerSearchQuery] = useState('')
  const [bannerTypeFilter, setBannerTypeFilter] = useState<'all' | 'line' | 'colored' | 'unpaired'>('all')
  const [bannerCurrentPage, setBannerCurrentPage] = useState(1)
  const [bannerPageSize, setBannerPageSize] = useState(12)
  const [showHeroPreview, setShowHeroPreview] = useState(false)
  const [isPairingMode, setIsPairingMode] = useState(false)
  const [selectedForPairing, setSelectedForPairing] = useState<BannerImage | null>(null)
  const [pairingStep, setPairingStep] = useState<'select-line' | 'select-colored'>('select-line')
  
  // 拖拽配对状态
  const [draggedImage, setDraggedImage] = useState<BannerImage | null>(null)
  const [imagePairs, setImagePairs] = useState<{[key: string]: string}>({}) // lineImageId -> coloredImageId
  const [imageTypes, setImageTypes] = useState<{[key: string]: 'line' | 'colored' | 'unknown'}>({}) // imageId -> type
  const [showHiddenImages, setShowHiddenImages] = useState(false) // 是否显示已配对的彩色图
  const [isDatabaseMigrated, setIsDatabaseMigrated] = useState(false) // 数据库是否已迁移
  const [systemSettings, setSystemSettings] = useState({
    adminEmail: '',
    freeGenerations: 0,
    proGenerations: 0,
    maxImageSize: 0,
    enableRegistration: true,
    enableAI: true
  })

  // 用户管理功能
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserEditModal(true)
  }

  const handleSaveUser = async (updatedUser: User) => {
    try {
      console.log('Saving user:', updatedUser)
      
      const response = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新用户失败')
      }

      const result = await response.json()
      console.log('✅ User updated successfully:', result)
      
      alert(`用户信息更新成功！\\n用户: ${updatedUser.name || updatedUser.email}`)
      await refetchUsers()
    } catch (error) {
      console.error('❌ User update failed:', error)
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('确定要删除这个用户吗？这个操作不可逆转！')) {
      try {
        console.log('Deleting user:', userId)
        
        const response = await fetch(`/api/admin/users`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '删除用户失败')
        }

        alert('✅ 用户删除成功！')
        await refetchUsers()
      } catch (error) {
        console.error('❌ User deletion failed:', error)
        alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }
  }

  // 图库图片管理功能
  const handleEditLibraryImage = (image: LibraryImage) => {
    setEditingLibraryImage(image)
    setShowLibraryImageEditModal(true)
  }

  const handleSaveLibraryImage = async (updatedImage: LibraryImage) => {
    try {
      console.log('Saving library image:', updatedImage)
      
      // 转换字段名为数据库格式
      const updateData = {
        title: updatedImage.title,
        description: updatedImage.description,
        tags: updatedImage.tags,
        category: updatedImage.category,
        difficulty: updatedImage.difficulty,
        // 转换为数据库字段名
        is_featured: updatedImage.isFeatured,
        is_active: updatedImage.isActive
      }
      
      console.log('Sending data to API:', updateData)
      
      const response = await fetch(`/api/admin/library-images/${updatedImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API response error:', errorData)
        throw new Error(errorData.error || '更新图片失败')
      }

      const result = await response.json()
      console.log('✅ Library image updated successfully:', result)
      
      alert(`图片信息更新成功！\\n标题: ${updatedImage.title}`)
      await refetchLibrary()
    } catch (error) {
      console.error('❌ Library image update failed:', error)
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleDeleteLibraryImage = async (image: LibraryImage) => {
    const userConfirmed = confirm(
      `确定要删除图片"${image.title}"吗？\\n\\n` +
      `这将从以下位置删除图片：\\n` +
      `• 数据库记录\\n` +
      `• 云存储文件\\n` +
      `• 所有相关的用户收藏\\n\\n` +
      `此操作不可撤销！`
    )
    
    if (userConfirmed) {
      try {
        console.log('🗑️ Deleting library image:', image)
        
        const response = await fetch(`/api/admin/library-images/${image.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '删除图片失败')
        }

        const result = await response.json()
        console.log('✅ Library image deleted successfully:', result)
        
        alert(`✅ 图片"${image.title}"删除成功！\\n已从数据库和存储中完全移除。`)
        
        // 重新获取图片列表
        await refetchLibrary()
      } catch (error) {
        console.error('❌ Library image deletion failed:', error)
        alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}\\n请检查控制台获取详细错误信息。`)
      }
    }
  }

  const handleImageUpload = async (imageData: any) => {
    try {
      console.log('💾 Saving image to database:', imageData)
      
      // 转换为数据库字段名格式
      const createData = {
        title: imageData.title,
        description: imageData.description,
        imageUrl: imageData.imageUrl,
        thumbnailUrl: imageData.thumbnailUrl || imageData.imageUrl,
        category: imageData.category,
        difficulty: imageData.difficulty,
        tags: imageData.tags || [],
        // 转换为数据库字段名
        is_active: imageData.isActive !== false,
        is_featured: imageData.isFeatured || false
      }
      
      console.log('Sending create data to API:', createData)
      
      // 发送到数据库API
      const response = await fetch('/api/admin/library-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存到数据库失败')
      }

      const result = await response.json()
      console.log('✅ Image saved to database successfully:', result)
      
      alert(`图片库图片上传并保存成功！\\n标题: ${imageData.title}\\n分类: ${imageData.category}`)
      await refetchLibrary()
    } catch (error) {
      console.error('❌ Image upload/save failed:', error)
      
      // 提供更详细的错误信息
      let errorMessage = '保存失败'
      let suggestion = ''
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to create library image')) {
          errorMessage = '数据库保存失败'
          suggestion = '可能原因：\n• 数据库连接问题\n• 环境变量未配置\n• 网络连接异常\n\n建议检查浏览器控制台获取详细错误信息。'
        } else if (error.message.includes('fetch')) {
          errorMessage = '网络请求失败'
          suggestion = '请检查网络连接后重试。'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`${errorMessage}\n\n${suggestion}`)
    }
  }

  // 加载彩色参考图状态
  const loadColorReferencesStatus = async () => {
    if (!libraryImages?.data) return
    
    try {
      const statusMap: {[key: string]: boolean} = {}
      
      // 批量检查所有图片的彩色参考图状态
      for (const image of libraryImages.data) {
        try {
          const response = await fetch(`/api/admin/color-references?originalImageUrl=${encodeURIComponent(image.imageUrl)}`)
          const result = await response.json()
          statusMap[image.imageUrl] = !!(result.success && result.data)
        } catch (error) {
          console.error(`Error checking reference for ${image.title}:`, error)
          statusMap[image.imageUrl] = false
        }
      }
      
      setColorReferences(statusMap)
      console.log('✅ Color references status loaded:', Object.keys(statusMap).filter(key => statusMap[key]).length, 'images have references')
    } catch (error) {
      console.error('❌ Failed to load color references status:', error)
    }
  }

  // 当图片库数据加载完成时，加载彩色参考图状态
  useEffect(() => {
    if (libraryImages?.data && !libraryLoading) {
      loadColorReferencesStatus()
    }
  }, [libraryImages?.data, libraryLoading])

  // 当Banner数据加载完成时，从数据库恢复配对关系和图片类型
  useEffect(() => {
    if (bannerImages && !bannersLoading) {
      loadPairingDataFromDatabase()
    }
  }, [bannerImages, bannersLoading])

  const loadPairingDataFromDatabase = () => {
    if (!bannerImages) return

    const pairs: {[key: string]: string} = {}
    const types: {[key: string]: 'line' | 'colored' | 'unknown'} = {}

    // 首先尝试从数据库恢复
    let hasDbData = false
    bannerImages.forEach(image => {
      // 恢复图片类型
      if (image.imageType) {
        types[image.id] = image.imageType
        hasDbData = true
      }

      // 恢复配对关系
      if (image.imageType === 'line' && image.pairedImageId) {
        pairs[image.id] = image.pairedImageId
        hasDbData = true
      }
    })

    // 更新数据库迁移状态
    setIsDatabaseMigrated(hasDbData)

    // 如果数据库没有数据，尝试从本地存储恢复
    if (!hasDbData) {
      try {
        const localData = localStorage.getItem('banner_pairing_data')
        if (localData) {
          const pairingData = JSON.parse(localData)
          
          if (pairingData.pairs) {
            Object.assign(pairs, pairingData.pairs)
          }
          
          if (pairingData.types) {
            Object.assign(types, pairingData.types)
          }
          
          console.log('✅ 从本地存储恢复配对关系:', {
            配对数量: Object.keys(pairs).length,
            图片类型数量: Object.keys(types).length,
            时间戳: pairingData.timestamp ? new Date(pairingData.timestamp).toLocaleString() : '无'
          })
        }
      } catch (error) {
        console.warn('⚠️ 本地存储数据解析失败:', error)
      }
    } else {
      console.log('✅ 从数据库恢复配对关系:', {
        配对数量: Object.keys(pairs).length,
        图片类型数量: Object.keys(types).length
      })
    }

    setImageTypes(types)
    setImagePairs(pairs)
  }

  const handleBannerUpload = async (bannerData: any) => {
    try {
      console.log('Uploading banner:', bannerData)
      
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: bannerData.title,
          imageUrl: bannerData.imageUrl,
          linkUrl: bannerData.linkUrl || null,
          description: bannerData.description || '',
          position: bannerData.position || Math.floor(Math.random() * 1000) + 1,
          isActive: bannerData.isActive !== false,
          showOnHomepage: bannerData.showOnHomepage || false,
          showOnLibrary: bannerData.showOnLibrary || false,
          showOnHero: bannerData.showOnHero || false,
          heroRow: bannerData.heroRow || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Banner上传失败')
      }

      const result = await response.json()
      console.log('✅ Banner uploaded successfully:', result)
      
      alert(`Banner图片上传成功！\\n标题: ${bannerData.title}`)
      await refetchBanners()
      
      // 如果是Hero图片，延迟一秒后给用户提示查看效果
      if (bannerData.showOnHero) {
        setTimeout(() => {
          if (confirm(`🎉 Hero图片上传成功！\\n\\n是否要立即查看首页效果？`)) {
            // 在新标签页打开首页查看效果
            window.open('/', '_blank')
          }
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Banner upload failed:', error)
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // Banner编辑功能
  const handleEditBanner = (banner: BannerImage) => {
    setEditingBanner(banner)
    setShowBannerEditModal(true)
  }

  const handleSaveBanner = async (updatedBanner: BannerImage) => {
    try {
      console.log('Saving banner:', updatedBanner)
      
      // 移除了演示数据检查，现在所有banner都可以编辑
      
      const response = await fetch(`/api/admin/banners/${updatedBanner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: updatedBanner.title,
          description: updatedBanner.description,
          linkUrl: updatedBanner.linkUrl,
          position: updatedBanner.position,
          isActive: updatedBanner.isActive,
          showOnHomepage: updatedBanner.showOnHomepage,
          showOnLibrary: updatedBanner.showOnLibrary,
          showOnHero: updatedBanner.showOnHero,
          heroRow: updatedBanner.heroRow,
          imageType: updatedBanner.imageType,
          pairedImageId: updatedBanner.pairedImageId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新Banner失败')
      }

      const result = await response.json()
      console.log('✅ Banner updated successfully:', result)
      
      alert(`Banner更新成功！\\n标题: ${updatedBanner.title}`)
      await refetchBanners()
      
      // 如果是Hero图片，提示查看效果
      if (updatedBanner.showOnHero) {
        setTimeout(() => {
          if (confirm(`🎨 Hero图片设置已更新！\\n\\n是否要立即查看首页效果？`)) {
            window.open('/', '_blank')
          }
        }, 500)
      }
    } catch (error) {
      console.error('❌ Banner update failed:', error)
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleDeleteBanner = async (banner: BannerImage) => {
    const confirmMessage = `确定要删除Banner"${banner.title}"吗？\\n\\n` +
      `类型: ${banner.showOnHero ? `Hero ${banner.heroRow === 'top' ? '上排' : '下排'}` : '普通Banner'}\\n` +
      `此操作不可撤销！`
    
    if (confirm(confirmMessage)) {
      try {
        console.log('🗑️ Deleting banner:', banner)
        
        // 移除了演示数据检查，现在所有banner都可以删除
        
        const response = await fetch(`/api/admin/banners/${banner.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '删除Banner失败')
        }

        const result = await response.json()
        console.log('✅ Banner deleted successfully:', result)
        
        alert(`✅ Banner"${banner.title}"删除成功！`)
        await refetchBanners()
      } catch (error) {
        console.error('❌ Banner deletion failed:', error)
        alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }
  }

  // 为特定图片上传彩色参考图
  const handleUploadReferenceForImage = (image: LibraryImage) => {
    setSelectedImageForReference(image)
    setShowReferenceUploadModal(true)
  }

  // 彩色参考图上传处理
  const handleReferenceUpload = async (referenceData: any) => {
    try {
      console.log('💾 Saving color reference to database:', referenceData)
      
      // 如果是为特定图片上传参考图，自动填充原始图片URL
      const originalImageUrl = selectedImageForReference 
        ? selectedImageForReference.imageUrl 
        : (referenceData.originalImageUrl || '')
      
      // 发送到数据库API
      const response = await fetch('/api/admin/color-references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: referenceData.title || (selectedImageForReference ? `${selectedImageForReference.title} - 彩色参考图` : ''),
          description: referenceData.description || (selectedImageForReference ? `${selectedImageForReference.title}的彩色参考图` : ''),
          originalImageUrl: originalImageUrl,
          coloredImageUrl: referenceData.imageUrl,
          colorScheme: referenceData.colorScheme || {
            primary: ['#FF69B4', '#FFFFFF'],
            secondary: ['#00BCD4', '#FFDC00'],
            accent: ['#FF4136', '#2ECC40']
          },
          isActive: referenceData.isActive !== false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存到数据库失败')
      }

      const result = await response.json()
      console.log('✅ Color reference saved to database successfully:', result)
      
      if (selectedImageForReference) {
        alert(`✅ 彩色参考图上传成功！\\n为图片"${selectedImageForReference.title}"创建了彩色参考图`)
        
        // 更新彩色参考图状态
        setColorReferences(prev => ({
          ...prev,
          [selectedImageForReference.imageUrl]: true
        }))
      } else {
        alert(`✅ 彩色参考图上传成功！\\n标题: ${referenceData.title}`)
      }
      
      // 重置状态
      setSelectedImageForReference(null)
    } catch (error) {
      console.error('❌ Color reference upload/save failed:', error)
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 价格计划管理
  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan)
    setShowPricingEditModal(true)
  }

  const handlePlanSave = async (updatedPlan: PricingPlan) => {
    try {
      console.log('Saving pricing plan:', updatedPlan)
      
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPlan)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新价格计划失败')
      }

      const result = await response.json()
      console.log('✅ Pricing plan updated successfully:', result)
      
      alert(`价格计划更新成功！\\n计划: ${updatedPlan.name}`)
    } catch (error) {
      console.error('❌ Pricing plan update failed:', error)
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 提示词模板管理
  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template)
    setShowTemplateEditModal(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('确定要删除这个模板吗？此操作不可撤销。')) {
      try {
        const response = await fetch(`/api/admin/prompt-templates/${templateId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '删除模板失败')
        }

        alert('模板删除成功！')
        await refetchTemplates()
      } catch (error) {
        console.error('❌ Template deletion failed:', error)
        alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }
  }

  const handleToggleTemplateActive = async (template: PromptTemplate) => {
    try {
      const response = await fetch(`/api/admin/prompt-templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...template,
          isActive: !template.isActive
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新模板状态失败')
      }

      await refetchTemplates()
    } catch (error) {
      console.error('❌ Template toggle failed:', error)
      alert(`状态更新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleSaveTemplate = async (templateData: any) => {
    try {
      console.log('Saving template:', templateData)
      
      const url = editingTemplate 
        ? `/api/admin/prompt-templates/${editingTemplate.id}`
        : '/api/admin/prompt-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save template')
      }
      
      alert(editingTemplate ? '✅ 模板更新成功！' : '✅ 模板创建成功！')
      setShowTemplateCreateModal(false)
      setShowTemplateEditModal(false)
      setEditingTemplate(null)
      await refetchTemplates()
    } catch (error) {
      console.error('Template save failed:', error)
      alert('❌ 保存失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 数据库配对操作函数
  const savePairingToDatabase = async (lineImage: BannerImage, coloredImage: BannerImage) => {
    try {
      console.log('🔄 尝试保存配对信息到数据库:', {
        lineImage: lineImage.title,
        coloredImage: coloredImage.title
      })

      // 首先尝试数据库保存（如果数据库支持新字段）
      try {
        // 更新线条图的配对信息
        const lineResponse = await fetch(`/api/admin/banners/${lineImage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: lineImage.title,
            description: lineImage.description,
            linkUrl: lineImage.linkUrl,
            position: lineImage.position,
            isActive: lineImage.isActive,
            showOnHomepage: lineImage.showOnHomepage,
            showOnLibrary: lineImage.showOnLibrary,
            showOnHero: lineImage.showOnHero,
            heroRow: lineImage.heroRow,
            imageType: 'line',
            pairedImageId: coloredImage.id
          })
        })

        if (lineResponse.ok) {
          // 更新彩色图的配对信息
          const colorResponse = await fetch(`/api/admin/banners/${coloredImage.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: coloredImage.title,
              description: coloredImage.description,
              linkUrl: coloredImage.linkUrl,
              position: coloredImage.position,
              isActive: coloredImage.isActive,
              showOnHomepage: coloredImage.showOnHomepage,
              showOnLibrary: coloredImage.showOnLibrary,
              showOnHero: coloredImage.showOnHero,
              heroRow: coloredImage.heroRow,
              imageType: 'colored',
              pairedImageId: lineImage.id
            })
          })

          if (colorResponse.ok) {
            console.log('✅ 配对信息已保存到数据库')
            // 注意：数据库保存成功时也不刷新，因为本地状态已经更新
            return
          }
        }
      } catch (dbError) {
        console.warn('⚠️ 数据库保存失败，使用本地存储方案:', dbError)
      }

      // 如果数据库保存失败，使用localStorage作为临时方案
      console.log('🔄 使用本地存储保存配对信息...')
      
      const pairingData = {
        pairs: {
          ...imagePairs,
          [lineImage.id]: coloredImage.id
        },
        types: {
          ...imageTypes,
          [lineImage.id]: 'line' as const,
          [coloredImage.id]: 'colored' as const
        },
        timestamp: Date.now()
      }
      
      localStorage.setItem('banner_pairing_data', JSON.stringify(pairingData))
      
      console.log('✅ 配对信息已保存到本地存储（临时方案）')
      console.log('💡 请执行数据库迁移以启用永久存储')
      
    } catch (error) {
      console.error('❌ 保存配对失败:', error)
      throw error
    }
  }

  const removePairingFromDatabase = async (lineImageId: string) => {
    try {
      const pairedImageId = imagePairs[lineImageId]
      if (!pairedImageId) return

      console.log('🔄 尝试从数据库移除配对关系:', { lineImageId, pairedImageId })

      // 尝试数据库删除
      try {
        const lineImage = bannerImages?.find(img => img.id === lineImageId)
        const coloredImage = bannerImages?.find(img => img.id === pairedImageId)
        
        let success = true

        // 清除线条图的配对信息
        if (lineImage) {
          const lineResponse = await fetch(`/api/admin/banners/${lineImageId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: lineImage.title,
              description: lineImage.description,
              linkUrl: lineImage.linkUrl,
              position: lineImage.position,
              isActive: lineImage.isActive,
              showOnHomepage: lineImage.showOnHomepage,
              showOnLibrary: lineImage.showOnLibrary,
              showOnHero: lineImage.showOnHero,
              heroRow: lineImage.heroRow,
              imageType: lineImage.imageType,
              pairedImageId: null
            })
          })

          if (!lineResponse.ok) success = false
        }

        // 清除彩色图的配对信息
        if (coloredImage && success) {
          const colorResponse = await fetch(`/api/admin/banners/${pairedImageId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: coloredImage.title,
              description: coloredImage.description,
              linkUrl: coloredImage.linkUrl,
              position: coloredImage.position,
              isActive: coloredImage.isActive,
              showOnHomepage: coloredImage.showOnHomepage,
              showOnLibrary: coloredImage.showOnLibrary,
              showOnHero: coloredImage.showOnHero,
              heroRow: coloredImage.heroRow,
              imageType: coloredImage.imageType,
              pairedImageId: null
            })
          })

          if (!colorResponse.ok) success = false
        }

        if (success) {
          console.log('✅ 配对关系已从数据库移除')
          // 注意：数据库删除成功时也不刷新，因为本地状态已经更新
          return
        }
      } catch (dbError) {
        console.warn('⚠️ 数据库删除失败，使用本地存储:', dbError)
      }

      // 如果数据库删除失败，从本地存储删除
      console.log('🔄 从本地存储移除配对关系...')
      
      const existingData = localStorage.getItem('banner_pairing_data')
      const pairingData = existingData ? JSON.parse(existingData) : { pairs: {}, types: {} }
      
      // 删除配对关系
      delete pairingData.pairs[lineImageId]
      
      pairingData.timestamp = Date.now()
      
      localStorage.setItem('banner_pairing_data', JSON.stringify(pairingData))
      
      console.log('✅ 配对关系已从本地存储移除')
      
    } catch (error) {
      console.error('❌ 移除配对失败:', error)
      throw error
    }
  }

  const saveImageTypeToDatabase = async (imageId: string, type: 'line' | 'colored' | 'unknown') => {
    try {
      const image = bannerImages?.find(img => img.id === imageId)
      if (!image) {
        console.warn('❌ 找不到图片:', imageId)
        return
      }

      console.log('🔄 尝试保存图片类型到数据库:', { imageId, type, imageTitle: image.title })

      // 尝试数据库保存
      try {
        const response = await fetch(`/api/admin/banners/${imageId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: image.title,
            description: image.description,
            linkUrl: image.linkUrl,
            position: image.position,
            isActive: image.isActive,
            showOnHomepage: image.showOnHomepage,
            showOnLibrary: image.showOnLibrary,
            showOnHero: image.showOnHero,
            heroRow: image.heroRow,
            imageType: type,
            pairedImageId: image.pairedImageId
          })
        })

        if (response.ok) {
          console.log(`✅ 图片类型已保存到数据库: ${image.title} -> ${type}`)
          // 注意：数据库保存成功时也不刷新，因为本地状态已经更新
          return
        }
      } catch (dbError) {
        console.warn('⚠️ 数据库保存失败，使用本地存储:', dbError)
      }

      // 如果数据库保存失败，保存到本地存储
      console.log('🔄 使用本地存储保存图片类型...')
      
      const existingData = localStorage.getItem('banner_pairing_data')
      const pairingData = existingData ? JSON.parse(existingData) : { pairs: {}, types: {} }
      
      pairingData.types = {
        ...pairingData.types,
        [imageId]: type
      }
      pairingData.timestamp = Date.now()
      
      localStorage.setItem('banner_pairing_data', JSON.stringify(pairingData))
      
      console.log(`✅ 图片类型已保存到本地存储: ${image.title} -> ${type}`)
      
    } catch (error) {
      console.error('❌ 保存图片类型失败:', error)
      // 不抛出错误，允许本地状态更新
    }
  }

  // 拖拽配对功能
  const handleDragStart = (image: BannerImage) => {
    setDraggedImage(image)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetImage: BannerImage) => {
    if (!draggedImage || draggedImage.id === targetImage.id) {
      setDraggedImage(null)
      return
    }

    // 确定哪个是线条图，哪个是彩色图
    const sourceType = getImageType(draggedImage)
    const targetType = getImageType(targetImage)

    console.log('🔍 拖拽配对调试:', {
      source: draggedImage.title,
      sourceType,
      target: targetImage.title,
      targetType
    })

    // 检查是否有未分类的图片
    if (sourceType === 'unknown' || targetType === 'unknown') {
      alert('请先标记图片类型（线条图或彩色图）！')
      setDraggedImage(null)
      return
    }

    // 检查是否为相同类型
    if (sourceType === targetType) {
      alert(`不能配对两个${sourceType === 'line' ? '线条图' : '彩色图'}！只能将线条图和彩色图配对。`)
      setDraggedImage(null)
      return
    }

    // 建立配对关系
    const lineImage = sourceType === 'line' ? draggedImage : targetImage
    const coloredImage = sourceType === 'colored' ? draggedImage : targetImage

    try {
      // 保存到数据库
      await savePairingToDatabase(lineImage, coloredImage)
      
      // 更新本地状态
      setImagePairs(prev => ({
        ...prev,
        [lineImage.id]: coloredImage.id
      }))

      console.log(`✅ 配对成功并已保存: ${lineImage.title} <-> ${coloredImage.title}`)
    } catch (error) {
      console.error('❌ 配对保存失败:', error)
      alert('配对保存失败，请重试')
    }
    
    setDraggedImage(null)
  }

  const handleRemovePair = async (lineImageId: string) => {
    try {
      await removePairingFromDatabase(lineImageId)
      
      setImagePairs(prev => {
        const newPairs = { ...prev }
        delete newPairs[lineImageId]
        return newPairs
      })
    } catch (error) {
      console.error('❌ 移除配对失败:', error)
      alert('移除配对失败，请重试')
    }
  }

  // 手动设置图片类型
  const setImageType = (imageId: string, type: 'line' | 'colored' | 'unknown') => {
    // 立即更新本地状态以提供即时反馈
    setImageTypes(prev => ({
      ...prev,
      [imageId]: type
    }))
    
    // 异步保存到数据库（不等待完成）
    saveImageTypeToDatabase(imageId, type)
  }

  // 判断图片类型的函数
  const getImageType = (image: BannerImage): 'line' | 'colored' | 'unknown' => {
    // 优先使用手动设置的类型
    if (imageTypes[image.id]) {
      return imageTypes[image.id]
    }
    
    if (image.imageType) return image.imageType
    
    const title = image.title.toLowerCase()
    console.log('🔍 分析图片类型:', { title, id: image.id })
    
    // 线条图关键词
    if (title.includes('line') || title.includes('art') || title.includes('sketch') || 
        title.includes('outline') || title.includes('lineart') || title.includes('black') ||
        title.includes('coloring') || title.includes('drawing')) {
      console.log('✅ 识别为线条图')
      return 'line'
    }
    
    // 彩色图关键词  
    if (title.includes('color') || title.includes('painted') || title.includes('filled') ||
        title.includes('colou') || title.includes('bright') || title.includes('rainbow') ||
        title.includes('vivid') || title.includes('full')) {
      console.log('✅ 识别为彩色图')
      return 'colored'
    }
    
    console.log('⚠️ 无法识别类型，标记为unknown')
    return 'unknown'
  }

  // 过滤和分页逻辑
  const filteredBannerImages = React.useMemo(() => {
    if (!bannerImages) return []
    
    return bannerImages.filter((image) => {
      // 位置筛选
      if (bannerFilter === 'hero' && !image.showOnHero) return false
      if (bannerFilter === 'banner' && (image.showOnHero || (!image.showOnHomepage && !image.showOnLibrary))) return false
      
      // 搜索筛选
      if (bannerSearchQuery) {
        const query = bannerSearchQuery.toLowerCase()
        const matchesTitle = image.title.toLowerCase().includes(query)
        const matchesDescription = image.description?.toLowerCase().includes(query)
        const matchesUrl = image.imageUrl?.toLowerCase().includes(query)
        const matchesLinkUrl = image.linkUrl?.toLowerCase().includes(query)
        
        if (!matchesTitle && !matchesDescription && !matchesUrl && !matchesLinkUrl) {
          return false
        }
      }
      
      // 图片类型筛选
      const imageType = getImageType(image)
      if (bannerTypeFilter === 'line' && imageType !== 'line') return false
      if (bannerTypeFilter === 'colored' && imageType !== 'colored') return false
      if (bannerTypeFilter === 'unpaired') {
        // 未配对：线条图没有配对的彩色图，或者彩色图没有被任何线条图配对
        const isLineImage = imageType === 'line'
        const isColoredImage = imageType === 'colored'
        const hasLinePaired = isLineImage && imagePairs[image.id]
        const isColoredPaired = isColoredImage && Object.values(imagePairs).includes(image.id)
        
        if (!((isLineImage && !hasLinePaired) || (isColoredImage && !isColoredPaired))) {
          return false
        }
      }
      
      // 隐藏已配对的彩色图（除非开启了显示隐藏图片模式或在配对模式下）
      if (imageType === 'colored' && !showHiddenImages && !isPairingMode) {
        const isUsedInPair = Object.values(imagePairs).includes(image.id)
        if (isUsedInPair) return false
      }
      
      // 配对模式下的特殊过滤逻辑
      if (isPairingMode) {
        // 第一步：只显示未配对的线条图
        if (pairingStep === 'select-line') {
          return imageType === 'line' && !imagePairs[image.id]
        }
        // 第二步：显示未配对的彩色图 + 已选中的线条图
        else if (pairingStep === 'select-colored') {
          return (imageType === 'colored' && !Object.values(imagePairs).includes(image.id)) || 
                 (selectedForPairing && image.id === selectedForPairing.id)
        }
      }
      
      return true
    })
  }, [bannerImages, bannerFilter, bannerSearchQuery, bannerTypeFilter, imagePairs, showHiddenImages, isPairingMode, pairingStep, selectedForPairing])
  
  // 分页计算
  const totalBannerPages = Math.ceil(filteredBannerImages.length / bannerPageSize)
  const paginatedBannerImages = React.useMemo(() => {
    const startIndex = (bannerCurrentPage - 1) * bannerPageSize
    const endIndex = startIndex + bannerPageSize
    return filteredBannerImages.slice(startIndex, endIndex)
  }, [filteredBannerImages, bannerCurrentPage, bannerPageSize])
  
  // 重置页码当筛选条件改变时
  React.useEffect(() => {
    setBannerCurrentPage(1)
  }, [bannerFilter, bannerSearchQuery, bannerTypeFilter, bannerPageSize])

  // 配对模式处理函数
  const handlePairingModeClick = async (image: BannerImage) => {
    if (!isPairingMode) return
    
    const imageType = getImageType(image)
    
    if (pairingStep === 'select-line') {
      // 第一步：选择线条图
      if (imageType === 'line') {
        setSelectedForPairing(image)
        setPairingStep('select-colored')
      } else {
        alert('请选择一张线条图作为主图。线条图通常包含"line", "coloring", "outline"等关键词。')
      }
    } else if (pairingStep === 'select-colored') {
      // 第二步：选择彩色图
      if (imageType === 'colored' && selectedForPairing) {
        // 执行配对 - 使用现有的savePairingToDatabase函数
        await savePairingToDatabase(selectedForPairing, image)
        
        // 更新本地状态
        setImagePairs(prev => ({
          ...prev,
          [selectedForPairing.id]: image.id
        }))
        
        setImageTypes(prev => ({
          ...prev,
          [selectedForPairing.id]: 'line',
          [image.id]: 'colored'
        }))
        // 重置配对模式
        setSelectedForPairing(null)
        setPairingStep('select-line')
        alert(`✅ 配对成功！"${selectedForPairing.title}" 已与 "${image.title}" 配对。`)
      } else if (imageType === 'line') {
        alert('请选择一张彩色图作为参考图。彩色图通常包含"color", "painted", "filled"等关键词。')
      } else {
        alert('请选择一张彩色图进行配对。')
      }
    }
  }
  
  // 智能配对推荐
  const getSuggestedPairs = (lineImage: BannerImage): BannerImage[] => {
    if (!bannerImages) return []
    
    return bannerImages
      .filter(img => {
        // 必须是彩色图
        if (getImageType(img) !== 'colored') return false
        // 不能已经被配对
        if (Object.values(imagePairs).includes(img.id)) return false
        
        // 简单的标题相似度匹配
        const lineTitle = lineImage.title.toLowerCase()
        const coloredTitle = img.title.toLowerCase()
        
        // 提取关键词进行匹配
        const lineKeywords = lineTitle.split(/\s+/).filter(word => word.length > 2)
        const coloredKeywords = coloredTitle.split(/\s+/).filter(word => word.length > 2)
        
        const commonKeywords = lineKeywords.filter(keyword => 
          coloredKeywords.some(ck => ck.includes(keyword) || keyword.includes(ck))
        )
        
        return commonKeywords.length > 0
      })
      .slice(0, 3) // 最多推荐3张
  }

  // 系统设置功能
  const handleSaveSettings = async () => {
    try {
      console.log('Saving settings:', systemSettings)
      alert('✅ 系统设置保存成功！')
    } catch (error) {
      console.error('Settings save failed:', error)
      alert('❌ 设置保存失败，请重试')
    }
  }

  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, content, and system settings
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="templates">AI Templates</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.newUsersToday || 0} new today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                  <Images className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.totalLibraryImages}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active library
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.totalGenerations}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.generationsToday || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(stats?.monthlyRevenue || 0).toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage registered users and their permissions</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {users?.pagination?.total || 0} Total Users
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading users...</p>
                      </div>
                    </div>
                  ) : users?.data?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name || 'No Name'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.isProUser ? "default" : "secondary"}>
                              {user.isProUser ? 'Pro' : 'Free'}
                            </Badge>
                            {user.role === 'admin' && (
                              <Badge variant="destructive">Admin</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {user.totalGenerations || 0} generations
                          </div>
                          <div className="text-muted-foreground">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) ?? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Library Management</CardTitle>
                    <CardDescription>Manage coloring page library and uploads</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {libraryImages?.pagination?.total || 0} Images
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(colorReferences).filter(key => colorReferences[key]).length} 有彩图
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={loadColorReferencesStatus}
                      disabled={libraryLoading}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setShowImageUploadModal(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {libraryLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted rounded-lg h-48 mb-2"></div>
                        <div className="bg-muted rounded h-4 w-3/4 mb-1"></div>
                        <div className="bg-muted rounded h-3 w-1/2"></div>
                      </div>
                    ))
                  ) : libraryImages?.data?.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="relative">
                        <img 
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUploadReferenceForImage(image)}
                            className="h-6 w-6 p-0"
                            title="为此图片上传彩色参考图"
                          >
                            <Palette className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditLibraryImage(image)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLibraryImage(image)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs font-medium truncate mb-1">{image.title}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {image.category}
                            </Badge>
                            {colorReferences[image.imageUrl] && (
                              <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                                <Palette className="h-2 w-2 mr-1" />
                                彩图
                              </Badge>
                            )}
                          </div>
                          <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
                            {image.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )) ?? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No images found</p>
                      <p className="text-sm">Click "Upload Image" to add your first image</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Banner & Hero Images Management</CardTitle>
                    <CardDescription>Manage banner images for homepage, library, and hero section</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBannerUploadModal(true)}
                      disabled={isPairingMode}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      普通Banner
                    </Button>
                    <Button 
                      onClick={() => setShowHeroUploadModal(true)}
                      disabled={isPairingMode}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Hero图片
                    </Button>
                    
                    {/* 配对模式按钮 */}
                    <Button 
                      variant={isPairingMode ? 'default' : 'outline'}
                      onClick={() => {
                        if (isPairingMode) {
                          // 退出配对模式
                          setIsPairingMode(false)
                          setSelectedForPairing(null)
                          setPairingStep('select-line')
                        } else {
                          // 进入配对模式
                          setIsPairingMode(true)
                          setBannerTypeFilter('unpaired') // 自动显示未配对图片
                        }
                      }}
                      className={isPairingMode ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : ''}
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      {isPairingMode ? '退出配对模式' : '配对模式'}
                    </Button>
                    
                    {bannerImages && bannerImages.filter(img => img.showOnHero).length > 0 && (
                      <>
                        <Button 
                          variant="secondary" 
                          onClick={() => setShowHeroPreview(true)}
                          disabled={isPairingMode}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          预览效果
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            window.open('/', '_blank')
                          }}
                          title="在新页面查看首页实际效果"
                          disabled={isPairingMode}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          查看首页
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 数据库迁移状态提示 */}
                {!bannersLoading && !isDatabaseMigrated && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div className="flex-1">
                        <h4 className="text-yellow-800 font-medium mb-2">配对功能正在使用临时存储</h4>
                        <p className="text-yellow-700 text-sm mb-3">
                          配对关系目前保存在浏览器本地存储中。为了永久保存配对数据，请执行数据库迁移。
                        </p>
                        <div className="flex gap-2">
                          <a 
                            href="https://supabase.com/dashboard" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                          >
                            打开Supabase控制台
                          </a>
                          <button 
                            onClick={() => {
                              const sql = `-- 执行以下SQL命令添加配对字段：
ALTER TABLE banner_images ADD COLUMN IF NOT EXISTS image_type VARCHAR(20) CHECK (image_type IN ('line', 'colored', 'unknown'));
ALTER TABLE banner_images ADD COLUMN IF NOT EXISTS paired_image_id UUID REFERENCES banner_images(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_banner_images_image_type ON banner_images(image_type);
CREATE INDEX IF NOT EXISTS idx_banner_images_paired_image_id ON banner_images(paired_image_id);`
                              navigator.clipboard.writeText(sql)
                              alert('SQL命令已复制到剪贴板！请在Supabase SQL编辑器中粘贴并执行。')
                            }}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            复制SQL迁移命令
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 统计信息和筛选 */}
                {!bannersLoading && bannerImages && (
                  <div className="space-y-6 mb-6">
                    {/* 配对模式提示和指导 */}
                {isPairingMode && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-0.5">
                        {pairingStep === 'select-line' ? '🎯' : '🎨'}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-blue-800 font-medium mb-2">
                          配对模式 - 第{pairingStep === 'select-line' ? '1' : '2'}步
                        </h4>
                        {pairingStep === 'select-line' ? (
                          <>
                            <p className="text-blue-700 text-sm mb-3">
                              请点击选择一张<strong>线条图</strong>作为主图。线条图通常用于着色页面。
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">提示</span>
                              <span className="text-blue-600">点击图片左上角的🎯图标来选择</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-blue-700 text-sm mb-3">
                              已选择线条图：<strong>{selectedForPairing?.title}</strong><br/>
                              现在请点击选择对应的<strong>彩色图</strong>作为参考图。
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">提示</span>
                              <span className="text-purple-600">点击图片左上角的🎨图标来配对，或点击❌图标重新选择</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {selectedForPairing && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-300">
                            <img 
                              src={selectedForPairing.imageUrl} 
                              alt={selectedForPairing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedForPairing(null)
                              setPairingStep('select-line')
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 搜索和筛选区域 */}
                    <div className={`p-4 rounded-lg space-y-4 ${isPairingMode ? 'bg-blue-50/50 border border-blue-200' : 'bg-muted/30'}`}>
                      {/* 搜索框 */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px] max-w-md">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="搜索图片标题、描述或URL..."
                              value={bannerSearchQuery}
                              onChange={(e) => setBannerSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        {/* 图片类型筛选 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">图片类型:</span>
                          <Button
                            variant={bannerTypeFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBannerTypeFilter('all')}
                          >
                            全部
                          </Button>
                          <Button
                            variant={bannerTypeFilter === 'line' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBannerTypeFilter('line')}
                          >
                            📝 线条图
                          </Button>
                          <Button
                            variant={bannerTypeFilter === 'colored' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBannerTypeFilter('colored')}
                          >
                            🎨 彩色图
                          </Button>
                          <Button
                            variant={bannerTypeFilter === 'unpaired' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBannerTypeFilter('unpaired')}
                          >
                            ⚠️ 未配对
                          </Button>
                        </div>
                        
                        {/* 清除搜索 */}
                        {bannerSearchQuery && !isPairingMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBannerSearchQuery('')}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4 mr-1" />
                            清除搜索
                          </Button>
                        )}
                        
                        {/* 配对模式下的快速操作 */}
                        {isPairingMode && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedForPairing(null)
                                setPairingStep('select-line')
                              }}
                              disabled={!selectedForPairing}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              重新选择
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // 显示所有图片以便查看配对结果
                                setBannerTypeFilter('all')
                                setIsPairingMode(false)
                                setSelectedForPairing(null)
                                setPairingStep('select-line')
                              }}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看所有
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 统计信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">
                          {bannerImages.filter(img => img.showOnHero).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Hero图片</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {bannerImages.filter(img => img.showOnHero && img.heroRow === 'top').length}
                        </div>
                        <div className="text-sm text-muted-foreground">上排图片</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {bannerImages.filter(img => img.showOnHero && img.heroRow === 'bottom').length}
                        </div>
                        <div className="text-sm text-muted-foreground">下排图片</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {bannerImages.filter(img => img.showOnHomepage || img.showOnLibrary).length}
                        </div>
                        <div className="text-sm text-muted-foreground">普通Banner</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Object.keys(imagePairs).length}
                        </div>
                        <div className="text-sm text-muted-foreground">已配对组合</div>
                      </div>
                    </div>

                    {/* 快速筛选和分页控制 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <span className="text-muted-foreground">位置筛选:</span>
                          <Button
                            variant={bannerFilter === 'hero' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBannerFilter('hero')}
                          >
                            🏠 Hero图片
                          </Button>
                          <Button
                            variant={bannerFilter === 'banner' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBannerFilter('banner')}
                          >
                            🎯 Banner
                          </Button>
                          <Button
                            variant={bannerFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBannerFilter('all')}
                          >
                            📋 显示全部
                          </Button>
                          
                          {/* 显示/隐藏已配对图片的切换按钮 */}
                          {Object.keys(imagePairs).length > 0 && (
                            <Button
                              variant={showHiddenImages ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setShowHiddenImages(!showHiddenImages)}
                              className="ml-2"
                            >
                              {showHiddenImages ? (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  隐藏已配对
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  显示已配对
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {/* 分页控制和每页数量 */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">每页显示:</span>
                            <select 
                              value={bannerPageSize} 
                              onChange={(e) => {
                                setBannerPageSize(Number(e.target.value))
                                setBannerCurrentPage(1)
                              }}
                              className="bg-background border border-input rounded px-2 py-1"
                            >
                              <option value={12}>12</option>
                              <option value={24}>24</option>
                              <option value={48}>48</option>
                              <option value={100}>100</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBannerCurrentPage(1)}
                              disabled={bannerCurrentPage === 1}
                            >
                              首页
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBannerCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={bannerCurrentPage === 1}
                            >
                              上页
                            </Button>
                            <span className="px-2 text-muted-foreground">
                              第 {bannerCurrentPage} / {totalBannerPages} 页
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBannerCurrentPage(prev => Math.min(totalBannerPages, prev + 1))}
                              disabled={bannerCurrentPage === totalBannerPages}
                            >
                              下页
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBannerCurrentPage(totalBannerPages)}
                              disabled={bannerCurrentPage === totalBannerPages}
                            >
                              末页
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* 拖拽配对说明 */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">🎯 拖拽配对功能</h4>
                        <div className="space-y-1 text-xs text-blue-700">
                          <p><strong>步骤1:</strong> 点击图片左上角的类型标签来设置图片类型（📝线条图 / 🎨彩色图）</p>
                          <p><strong>步骤2:</strong> 将彩色图拖拽到对应的线条图上建立配对关系</p>
                          <p><strong>结果:</strong> 配对后线条图右下角会显示彩色图预览，彩色图会自动隐藏保持界面清爽</p>
                          <p><strong>编辑:</strong> 点击"显示已配对图片"按钮可以重新显示隐藏的彩色图进行编辑操作</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 搜索结果统计 */}
                {!bannersLoading && filteredBannerImages && (
                  <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      显示第 {(bannerCurrentPage - 1) * bannerPageSize + 1} - 
                      {Math.min(bannerCurrentPage * bannerPageSize, filteredBannerImages.length)} 项，
                      共 {filteredBannerImages.length} 项
                      {bannerSearchQuery && (
                        <span className="ml-2 text-primary">
                          （搜索: "{bannerSearchQuery}"）
                        </span>
                      )}
                    </div>
                    {filteredBannerImages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>没有找到匹配的图片</p>
                        <p className="text-xs mt-1">尝试修改搜索条件或筛选器</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 🎨 改进的网格布局 - 保持原来的卡片大小但优化配对显示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {bannersLoading ? (
                    Array.from({ length: bannerPageSize }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted rounded-xl h-48 mb-3"></div>
                        <div className="bg-muted rounded h-4 w-3/4 mb-2"></div>
                        <div className="bg-muted rounded h-3 w-1/2"></div>
                      </div>
                    ))
                  ) : paginatedBannerImages?.map((image) => {
                    const imageType = getImageType(image)
                    const isLineImage = imageType === 'line'
                    const pairedImageId = isLineImage ? imagePairs[image.id] : null
                    const pairedImage = pairedImageId ? bannerImages?.find(img => img.id === pairedImageId) : null
                    
                    // 检查是否为已配对的彩色图（用于特殊显示）
                    const isHiddenPairedImage = imageType === 'colored' && Object.values(imagePairs).includes(image.id) && showHiddenImages
                    
                    // 配对模式下的智能推荐
                    const suggestedPairs = isPairingMode && selectedForPairing && selectedForPairing.id !== image.id 
                      ? getSuggestedPairs(selectedForPairing) : []
                    const isRecommended = suggestedPairs.some(suggested => suggested.id === image.id)

                    return (
                      <Card 
                        key={image.id} 
                        draggable={!isPairingMode}
                        onDragStart={() => !isPairingMode && handleDragStart(image)}
                        onDragOver={!isPairingMode ? handleDragOver : undefined}
                        onDrop={() => !isPairingMode && handleDrop(image)}
                        onClick={() => isPairingMode && handlePairingModeClick(image)}
                        className={`overflow-hidden transition-all duration-300 ${
                          isPairingMode 
                            ? 'hover:shadow-xl hover:scale-105 cursor-pointer' 
                            : 'hover:shadow-lg hover:scale-[1.02] cursor-move'
                        } ${
                          draggedImage?.id === image.id ? 'opacity-50 scale-95' : ''
                        } ${
                          // 配对模式下的特殊样式
                          isPairingMode && selectedForPairing?.id === image.id
                            ? 'ring-4 ring-blue-400 shadow-2xl shadow-blue-200 transform scale-105'
                            : isPairingMode && pairingStep === 'select-line' && imageType === 'line'
                            ? 'ring-2 ring-blue-300 hover:ring-blue-400 shadow-blue-100'
                            : isPairingMode && pairingStep === 'select-colored' && imageType === 'colored' && !Object.values(imagePairs).includes(image.id)
                            ? isRecommended
                              ? 'ring-3 ring-yellow-400 shadow-xl shadow-yellow-200 bg-yellow-50 hover:shadow-yellow-300'
                              : 'ring-2 ring-purple-300 hover:ring-purple-400 shadow-purple-100'
                            : // 非配对模式下的样式
                            !isPairingMode && isHiddenPairedImage 
                              ? 'ring-2 ring-orange-200 dark:ring-orange-800 shadow-orange-100 dark:shadow-orange-900/20 opacity-70'
                              : !isPairingMode && image.showOnHero 
                              ? 'ring-2 ring-purple-200 dark:ring-purple-800 shadow-purple-100 dark:shadow-purple-900/20' 
                              : !isPairingMode && pairedImage
                              ? 'ring-1 ring-green-200 dark:ring-green-800'
                              : 'hover:ring-2 hover:ring-primary/20'
                        }`}
                      >
                        <div className="relative group">
                          <div className="aspect-[4/3] overflow-hidden bg-muted/50">
                            <BannerDefaultImage
                              src={image.imageUrl}
                              alt={image.title}
                              className="transition-transform duration-200 group-hover:scale-105"
                            />
                          </div>
                          
                          {/* 图片类型标识 - 可点击切换 */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <Badge 
                              className={`text-xs font-medium shadow-sm hover:opacity-80 transition-all ${
                                isPairingMode
                                  ? 'cursor-pointer hover:scale-110 hover:shadow-lg'
                                  : 'cursor-pointer'
                              } ${
                                imageType === 'line' 
                                  ? isPairingMode && pairingStep === 'select-line'
                                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 animate-pulse' 
                                    : 'bg-blue-500 text-white'
                                  : imageType === 'colored'
                                  ? isPairingMode && pairingStep === 'select-colored'
                                    ? 'bg-green-500 text-white ring-2 ring-purple-300 animate-pulse'
                                    : 'bg-green-500 text-white'
                                  : 'bg-gray-500 text-white'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isPairingMode) {
                                  handlePairingModeClick(image)
                                } else {
                                  // 循环切换类型：unknown -> line -> colored -> unknown
                                  const nextType = imageType === 'unknown' ? 'line' : 
                                                 imageType === 'line' ? 'colored' : 'unknown'
                                  setImageType(image.id, nextType)
                                }
                              }}
                              title={isPairingMode 
                                ? pairingStep === 'select-line' && imageType === 'line'
                                  ? '🎯 点击选择这张线条图'
                                  : pairingStep === 'select-colored' && imageType === 'colored'
                                  ? '🎨 点击配对这张彩色图'
                                  : '请选择正确的图片类型'
                                : '点击切换图片类型'
                              }
                            >
                              {isPairingMode ? (
                                pairingStep === 'select-line' && imageType === 'line' ? '🎯 选择' :
                                pairingStep === 'select-colored' && imageType === 'colored' ? '🎨 配对' :
                                imageType === 'line' ? '📝 线条图' : 
                                imageType === 'colored' ? '🎨 彩色图' : '❓ 未分类'
                              ) : (
                                imageType === 'line' ? '📝 线条图' : 
                                imageType === 'colored' ? '🎨 彩色图' : '❓ 未分类'
                              )}
                            </Badge>
                            
                            {/* Hero标识 */}
                            {image.showOnHero && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium shadow-sm">
                                🎭 Hero {image.heroRow === 'top' ? '上排' : '下排'}
                              </Badge>
                            )}
                            
                            {/* 已配对的彩色图标识 */}
                            {isHiddenPairedImage && (
                              <Badge className="bg-orange-500 text-white text-xs font-medium shadow-sm">
                                🔗 已配对彩色图
                              </Badge>
                            )}
                            
                            {/* 智能推荐标识 */}
                            {isPairingMode && isRecommended && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold shadow-lg animate-pulse">
                                ⭐ 智能推荐
                              </Badge>
                            )}
                          </div>
                          
                          {/* 配对的彩色图小预览 - 只在线条图上显示 */}
                          {isLineImage && pairedImage && (
                            <div className="absolute bottom-2 right-2 group/pair">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-white">
                                  <BannerDefaultImage
                                    src={pairedImage.imageUrl}
                                    alt={pairedImage.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemovePair(image.id)
                                  }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover/pair:opacity-100 transition-opacity flex items-center justify-center"
                                  title="取消配对"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* 激活状态标识 */}
                          {!image.isActive && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-gray-500 text-white text-xs">
                                🚫 未激活
                              </Badge>
                            </div>
                          )}
                          
                          {/* 操作按钮 - 悬停显示 */}
                          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBanner(image)}
                              className="h-7 w-7 p-0 bg-white/90 hover:bg-white border-white/50 backdrop-blur-sm shadow-sm"
                              title="编辑Banner设置"
                            >
                              <Edit className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteBanner(image)}
                              className="h-7 w-7 p-0 bg-red-50/90 hover:bg-red-100 border-red-200 shadow-sm"
                              title="删除Banner"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {/* 标题和位置 */}
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-semibold text-foreground truncate flex-1 mr-2">
                                {image.title}
                              </h3>
                              {image.position && (
                                <span className="text-xs text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded">
                                  #{image.position}
                                </span>
                              )}
                            </div>
                            
                            {/* 显示位置标签 */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {image.showOnHomepage && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                  🏠 首页
                                </Badge>
                              )}
                              {image.showOnLibrary && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                  📚 图库
                                </Badge>
                              )}
                              {!image.showOnHero && !image.showOnHomepage && !image.showOnLibrary && (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                  ⚠️ 未设置显示位置
                                </Badge>
                              )}
                            </div>
                            
                            {/* 状态信息 */}
                            <div className="flex items-center justify-between pt-1 border-t border-border/50">
                              <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
                                {image.isActive ? "✅ 启用" : "⏸️ 禁用"}
                              </Badge>
                              
                              {/* 配对信息和拖拽提示 */}
                              {isLineImage && pairedImage ? (
                                <span className="text-xs text-green-600 font-medium">
                                  ✓ 已配对
                                </span>
                              ) : imageType !== 'unknown' ? (
                                <span className="text-xs text-muted-foreground">
                                  {isLineImage ? '🎯 拖拽彩色图到此' : '🎯 拖拽到线条图'}
                                </span>
                              ) : (
                                <span className="text-xs text-orange-500">
                                  ⚠️ 请标记图片类型
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }) ?? (
                    <div className="col-span-full text-center py-12">
                      <div className="max-w-md mx-auto">
                        <div className="text-6xl mb-4">🖼️</div>
                        <h3 className="text-lg font-medium text-foreground mb-2">还没有Banner图片</h3>
                        <p className="text-muted-foreground mb-6">
                          上传Banner图片来管理首页轮播图和Hero区域的滚动背景
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button onClick={() => setShowBannerUploadModal(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            上传普通Banner
                          </Button>
                          <Button variant="outline" onClick={() => setShowHeroUploadModal(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            上传Hero图片
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>AI Prompt Templates</CardTitle>
                  <CardDescription>Manage AI generation prompt templates for different styles and complexities</CardDescription>
                </div>
                <Button onClick={() => setShowTemplateCreateModal(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templatesLoading ? (
                    <div className="text-center py-4">加载中...</div>
                  ) : promptTemplates?.data?.map((template) => (
                    <TemplateCard 
                      key={template.id} 
                      template={template}
                      onEdit={() => {
                        setEditingTemplate(template)
                        setShowTemplateEditModal(true)
                      }}
                      onDelete={() => handleDeleteTemplate(template.id)}
                      onToggleActive={() => handleToggleTemplateActive(template)}
                    />
                  )) ?? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>暂无模板数据</p>
                      <p className="text-sm">点击"Create Template"开始创建第一个模板</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter" className="space-y-6">
            <NewsletterAdminPanel />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure application settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={systemSettings.adminEmail}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                      placeholder="admin@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="freeGenerations">Free User Daily Generations</Label>
                    <Input
                      id="freeGenerations"
                      type="number"
                      value={systemSettings.freeGenerations}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, freeGenerations: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proGenerations">Pro User Daily Generations</Label>
                    <Input
                      id="proGenerations"
                      type="number"
                      value={systemSettings.proGenerations}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, proGenerations: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxImageSize">Max Image Size (MB)</Label>
                    <Input
                      id="maxImageSize"
                      type="number"
                      value={systemSettings.maxImageSize}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxImageSize: parseInt(e.target.value) || 0 }))}
                      min="1"
                      max="50"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableRegistration">Enable User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new users to register</p>
                    </div>
                    <Switch
                      id="enableRegistration"
                      checked={systemSettings.enableRegistration}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableRegistration: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAI">Enable AI Generation</Label>
                      <p className="text-sm text-muted-foreground">Allow AI image generation features</p>
                    </div>
                    <Switch
                      id="enableAI"
                      checked={systemSettings.enableAI}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, enableAI: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Management</CardTitle>
                <CardDescription>Configure subscription plans and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {pricingLoading ? (
                    <div className="text-center py-4">Loading pricing plans...</div>
                  ) : pricingPlans?.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold">
                            ${plan.priceMonthly}/mo
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {plan.description}
                          </p>
                          <div className="text-xs">
                            <p>• {plan.generationsPerDay} generations/day</p>
                            {plan.highResolution && <p>• High resolution</p>}
                            {plan.noWatermark && <p>• No watermark</p>}
                            {plan.priorityGeneration && <p>• Priority generation</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) ?? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No pricing plans found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showUserEditModal && editingUser && (
          <UserEditModal
            user={editingUser}
            isOpen={showUserEditModal}
            onClose={() => {
              setShowUserEditModal(false)
              setEditingUser(null)
            }}
            onSave={handleSaveUser}
          />
        )}

        {showImageUploadModal && (
          <ImageUploadModal
            isOpen={showImageUploadModal}
            onClose={() => setShowImageUploadModal(false)}
            onUpload={handleImageUpload}
            type="library"
          />
        )}

        {showLibraryImageEditModal && editingLibraryImage && (
          <LibraryImageEditModal
            image={editingLibraryImage}
            isOpen={showLibraryImageEditModal}
            onClose={() => {
              setShowLibraryImageEditModal(false)
              setEditingLibraryImage(null)
            }}
            onSave={handleSaveLibraryImage}
          />
        )}

        {showPricingEditModal && editingPlan && (
          <PricingEditModal
            plan={editingPlan}
            isOpen={showPricingEditModal}
            onClose={() => {
              setShowPricingEditModal(false)
              setEditingPlan(null)
            }}
            onSave={handlePlanSave}
          />
        )}

        {/* 提示词模板模态框 */}
        {showTemplateCreateModal && (
          <PromptTemplateModal
            template={null}
            isOpen={showTemplateCreateModal}
            isCreate={true}
            onClose={() => setShowTemplateCreateModal(false)}
            onSave={handleSaveTemplate}
          />
        )}

        {showTemplateEditModal && editingTemplate && (
          <PromptTemplateModal
            template={editingTemplate}
            isOpen={showTemplateEditModal}
            isCreate={false}
            onClose={() => {
              setShowTemplateEditModal(false)
              setEditingTemplate(null)
            }}
            onSave={handleSaveTemplate}
          />
        )}

        {showReferenceUploadModal && (
          <ImageUploadModal
            isOpen={showReferenceUploadModal}
            onClose={() => {
              setShowReferenceUploadModal(false)
              setSelectedImageForReference(null)
            }}
            onUpload={handleReferenceUpload}
            type="reference"
            selectedImage={selectedImageForReference}
          />
        )}

        {showBannerUploadModal && (
          <ImageUploadModal
            isOpen={showBannerUploadModal}
            onClose={() => setShowBannerUploadModal(false)}
            onUpload={handleBannerUpload}
            type="banner"
          />
        )}

        {showBannerEditModal && editingBanner && (
          <BannerEditModal
            banner={editingBanner}
            isOpen={showBannerEditModal}
            onClose={() => {
              setShowBannerEditModal(false)
              setEditingBanner(null)
            }}
            onSave={handleSaveBanner}
          />
        )}

        {showHeroUploadModal && (
          <ImageUploadModal
            isOpen={showHeroUploadModal}
            onClose={() => setShowHeroUploadModal(false)}
            onUpload={handleBannerUpload}
            type="hero"
          />
        )}

        {showHeroPreview && bannerImages && (
          <HeroPreviewModal
            isOpen={showHeroPreview}
            onClose={() => setShowHeroPreview(false)}
            banners={bannerImages}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}

interface TemplateCardProps {
  template: PromptTemplate
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}

function TemplateCard({ template, onEdit, onDelete, onToggleActive }: TemplateCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <Badge variant={template.isActive ? "default" : "secondary"}>
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
              {template.isDefault && (
                <Badge variant="outline" className="text-xs">Default</Badge>
              )}
            </div>
            
            <p className="text-muted-foreground text-sm">{template.description}</p>
            
            <div className="flex gap-2 text-xs">
              <Badge variant="outline">{template.style}</Badge>
              <Badge variant="outline">{template.complexity}</Badge>
              <Badge variant="outline">{template.category}</Badge>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md mt-3">
              <p className="text-sm font-medium mb-1">Template:</p>
              <p className="text-xs text-muted-foreground font-mono">
                {template.template.length > 150 
                  ? template.template.substring(0, 150) + '...' 
                  : template.template
                }
              </p>
            </div>
            
            {template.variables && template.variables.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium mb-1">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {template.exampleOutput && (
              <div className="mt-2">
                <p className="text-xs font-medium mb-1">Example Output:</p>
                <p className="text-xs text-muted-foreground italic">
                  {template.exampleOutput.length > 100
                    ? template.exampleOutput.substring(0, 100) + '...'
                    : template.exampleOutput
                  }
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleActive}
            >
              {template.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

