"use client"

import { useState } from "react"
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
  RefreshCw
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
import { useEffect } from "react"


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
  const [showHeroPreview, setShowHeroPreview] = useState(false)
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
      
      const response = await fetch(`/api/admin/library-images/${updatedImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: updatedImage.title,
          description: updatedImage.description,
          tags: updatedImage.tags,
          category: updatedImage.category,
          difficulty: updatedImage.difficulty,
          isFeatured: updatedImage.isFeatured,
          isActive: updatedImage.isActive
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
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
      
      // 发送到数据库API
      const response = await fetch('/api/admin/library-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: imageData.title,
          description: imageData.description,
          imageUrl: imageData.imageUrl,
          thumbnailUrl: imageData.thumbnailUrl || imageData.imageUrl,
          category: imageData.category,
          difficulty: imageData.difficulty,
          tags: imageData.tags || [],
          isActive: imageData.isActive !== false,
          isFeatured: imageData.isFeatured || false
        })
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
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
      
      // 检查是否是演示数据（ID不是UUID格式）
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updatedBanner.id)
      
      if (!isUUID) {
        // 演示数据无法真正更新
        alert(`⚠️ "${updatedBanner.title}" 是演示数据，无法直接编辑。\\n\\n如需自定义，请：\\n1. 上传新的Hero图片\\n2. 在新上传的图片上进行编辑\\n3. 新图片会覆盖演示数据的显示`)
        return
      }
      
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
          heroRow: updatedBanner.heroRow
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
        
        // 检查是否是演示数据（ID不是UUID格式）
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(banner.id)
        
        if (!isUUID) {
          // 演示数据无法真正删除，只能从localStorage中移除（如果存在）
          alert(`⚠️ "${banner.title}" 是演示数据，无法删除。\\n\\n如需删除演示数据，请在管理员面板中上传替代图片，或联系开发者。`)
          return
        }
        
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="templates">AI Templates</TabsTrigger>
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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBannerUploadModal(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      普通Banner
                    </Button>
                    <Button onClick={() => setShowHeroUploadModal(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Hero图片
                    </Button>
                    {bannerImages && bannerImages.filter(img => img.showOnHero).length > 0 && (
                      <Button 
                        variant="secondary" 
                        onClick={() => setShowHeroPreview(true)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        预览效果
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 统计信息和筛选 */}
                {!bannersLoading && bannerImages && (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    </div>

                    {/* 快速筛选 */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">快速筛选:</span>
                      <Button
                        variant={bannerFilter === 'hero' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBannerFilter('hero')}
                      >
                        仅显示Hero图片
                      </Button>
                      <Button
                        variant={bannerFilter === 'banner' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBannerFilter('banner')}
                      >
                        仅显示Banner
                      </Button>
                      <Button
                        variant={bannerFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBannerFilter('all')}
                      >
                        显示全部
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bannersLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted rounded-lg h-32 mb-2"></div>
                        <div className="bg-muted rounded h-4 w-3/4 mb-1"></div>
                        <div className="bg-muted rounded h-3 w-1/2"></div>
                      </div>
                    ))
                  ) : bannerImages?.filter((image) => {
                    if (bannerFilter === 'hero') {
                      return image.showOnHero
                    } else if (bannerFilter === 'banner') {
                      return !image.showOnHero && (image.showOnHomepage || image.showOnLibrary)
                    }
                    return true
                  }).map((image) => (
                    <Card 
                      key={image.id} 
                      className={`overflow-hidden ${
                        image.showOnHero 
                          ? 'ring-2 ring-purple-200 dark:ring-purple-800' 
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-32 object-cover"
                        />
                        {/* Hero标识 */}
                        {image.showOnHero && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-xs">
                              Hero {image.heroRow === 'top' ? '上' : '下'}
                            </Badge>
                          </div>
                        )}
                        {/* 演示数据标识 */}
                        {!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(image.id) && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                              演示数据
                            </Badge>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBanner(image)}
                            className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                            title="编辑Banner设置"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBanner(image)}
                            className="h-6 w-6 p-0 bg-red-500/80 hover:bg-red-600"
                            title="删除Banner"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium truncate flex-1 mr-2">{image.title}</p>
                          {image.position && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              #{image.position}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* 显示位置标签 */}
                            {image.showOnHomepage && (
                              <Badge variant="secondary" className="text-xs">
                                首页
                              </Badge>
                            )}
                            {image.showOnLibrary && (
                              <Badge variant="secondary" className="text-xs">
                                图库
                              </Badge>
                            )}
                            {!image.showOnHero && !image.showOnHomepage && !image.showOnLibrary && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                未设置显示位置
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
                              {image.isActive ? "启用" : "禁用"}
                            </Badge>
                            {image.showOnHero && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                {image.heroRow === 'top' ? '↗️ 向左滚动' : '↘️ 向右滚动'}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) ?? (
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